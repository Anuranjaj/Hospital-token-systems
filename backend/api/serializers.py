from rest_framework import serializers
from core.models import Hospital, Department, Doctor, Token

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    specialization = DepartmentSerializer(read_only=True)
    specialization_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='specialization', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Doctor
        fields = (
            'id',
            'name',
            'specialization',
            'specialization_id',
            'experience',
            'consultation_time',
            'available_days',
            'photo_url',
        )

class TokenSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source='doctor', write_only=True
    )

    class Meta:
        model = Token
        fields = '__all__'


class TokenCreateSerializer(serializers.ModelSerializer):
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source='doctor'
    )

    class Meta:
        model = Token
        fields = ('patient_name', 'phone_number', 'doctor_id')


class PublicTokenSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = Token
        fields = ('id', 'doctor', 'token_number', 'date', 'status')
