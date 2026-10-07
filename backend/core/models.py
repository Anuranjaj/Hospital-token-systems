from django.db import models
from django.contrib.auth.models import User

class Hospital(models.Model):
    name = models.CharField(max_length=255)
    about = models.TextField()
    address = models.TextField()
    contact_details = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    specialization = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    experience = models.CharField(max_length=50) # e.g., "10 Years"
    consultation_time = models.CharField(max_length=100) # e.g., "10:00 AM - 02:00 PM"
    available_days = models.CharField(max_length=255) # e.g., "Mon, Tue, Wed"
    photo_url = models.URLField(blank=True)

    def __str__(self):
        return self.name

class Token(models.Model):
    STATUS_CHOICES = (
        ('Waiting', 'Waiting'),
        ('Current', 'Current'),
        ('Consulted', 'Consulted'),
        ('Not Reached', 'Not Reached'),
    )

    patient_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    token_number = models.IntegerField()
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Waiting')

    def __str__(self):
        return f"{self.token_number} - {self.patient_name}"
