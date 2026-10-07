from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
from core.models import Hospital, Department, Doctor, Token
from .serializers import (
    HospitalSerializer,
    DepartmentSerializer,
    DoctorSerializer,
    TokenSerializer,
    TokenCreateSerializer,
    PublicTokenSerializer,
)

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class TokenViewSet(viewsets.ModelViewSet):
    queryset = Token.objects.all().order_by('-date', 'token_number')
    serializer_class = TokenSerializer

    def get_permissions(self):
        if self.action in ['create', 'live']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'create':
            return TokenCreateSerializer
        if not self.request.user.is_staff:
            return PublicTokenSerializer
        return TokenSerializer

    def create(self, request, *args, **kwargs):
        doctor_id = request.data.get('doctor_id')
        today = timezone.localdate()

        with transaction.atomic():
            last_token = (
                Token.objects.select_for_update()
                .filter(doctor_id=doctor_id, date=today)
                .order_by('-token_number')
                .first()
            )
            next_number = (last_token.token_number + 1) if last_token else 1

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            token = serializer.save(token_number=next_number)
            headers = self.get_success_headers(serializer.data)
            response_serializer = PublicTokenSerializer(
                token,
                context=self.get_serializer_context(),
            )
            return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def live(self, request):
        today = timezone.localdate()
        queryset = Token.objects.filter(date=today).order_by('token_number')
        doctor_id = request.query_params.get('doctor_id')
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
