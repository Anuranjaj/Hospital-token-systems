from django.contrib import admin
from .models import Hospital, Department, Doctor, Token


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_details')
    search_fields = ('name', 'address')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'experience', 'consultation_time', 'available_days')
    list_filter = ('specialization',)
    search_fields = ('name', 'specialization__name')


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ('token_number', 'patient_name', 'doctor', 'status', 'date')
    list_filter = ('status', 'date', 'doctor')
    search_fields = ('patient_name', 'phone_number', 'doctor__name')
    ordering = ('-date', 'token_number')
