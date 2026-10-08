from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Department, Doctor, Hospital, Token


class TokenApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.department = Department.objects.create(name='Cardiology')
        self.doctor = Doctor.objects.create(
            name='Dr. Example',
            specialization=self.department,
            experience='5 Years',
            consultation_time='09:00 AM - 01:00 PM',
            available_days='Mon, Wed, Fri',
        )

    def test_authenticated_user_can_book_a_token(self):
        user = User.objects.create_user(username='patient-user', password='test-password')
        self.client.force_authenticate(user=user)

        response = self.client.post(
            '/api/tokens/',
            {
                'patient_name': 'Example Patient',
                'phone_number': '555-0100',
                'doctor_id': self.doctor.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['date'], timezone.localdate().isoformat())
        self.assertEqual(
            set(response.data),
            {'id', 'doctor', 'token_number', 'date', 'status'},
        )
        self.assertNotIn('phone_number', response.data)
        self.assertNotIn('user', response.data['doctor'])
        self.assertTrue(
            Token.objects.filter(
                patient_name='Example Patient',
                phone_number='555-0100',
            ).exists()
        )

    def test_unauthenticated_user_cannot_book_a_token(self):
        response = self.client.post(
            '/api/tokens/',
            {
                'patient_name': 'Example Patient',
                'phone_number': '555-0100',
                'doctor_id': self.doctor.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_public_live_queue_contains_only_display_fields(self):
        Token.objects.create(
            patient_name='Example Patient',
            phone_number='555-0100',
            doctor=self.doctor,
            token_number=1,
        )

        response = self.client.get('/api/tokens/live/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(response.data[0]),
            {'id', 'doctor', 'token_number', 'date', 'status'},
        )
        self.assertNotIn('patient_name', response.data[0])
        self.assertNotIn('phone_number', response.data[0])

    def test_public_users_cannot_read_the_admin_token_list(self):
        response = self.client.get('/api/tokens/')

        self.assertNotEqual(response.status_code, status.HTTP_200_OK)

    def test_non_staff_users_cannot_change_admin_records(self):
        hospital = Hospital.objects.create(
            name='Example Hospital',
            about='About',
            address='Address',
            contact_details='555-0100',
        )
        token = Token.objects.create(
            patient_name='Example Patient',
            doctor=self.doctor,
            token_number=1,
        )
        user = User.objects.create_user(username='regular-user', password='test-password')
        self.client.force_authenticate(user=user)

        requests = (
            self.client.post('/api/departments/', {'name': 'Neurology'}, format='json'),
            self.client.patch(
                f'/api/doctors/{self.doctor.id}/',
                {'name': 'Changed Name'},
                format='json',
            ),
            self.client.patch(
                f'/api/tokens/{token.id}/',
                {'status': 'Current'},
                format='json',
            ),
            self.client.patch(
                f'/api/hospitals/{hospital.id}/',
                {'name': 'Changed Hospital'},
                format='json',
            ),
        )

        for response in requests:
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_users_can_change_token_status(self):
        token = Token.objects.create(
            patient_name='Example Patient',
            doctor=self.doctor,
            token_number=1,
        )
        staff_user = User.objects.create_user(
            username='staff-user',
            password='test-password',
            is_staff=True,
        )
        self.client.force_authenticate(user=staff_user)

        response = self.client.patch(
            f'/api/tokens/{token.id}/',
            {'status': 'Current'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token.refresh_from_db()
        self.assertEqual(token.status, 'Current')
