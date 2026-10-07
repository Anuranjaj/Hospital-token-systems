import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
from django.contrib.auth.models import User
from core.models import Hospital, Department, Doctor

def seed():
    if not settings.DEBUG:
        raise RuntimeError("The seed script is for development and demo use only.")

    print("Seeding database...")
    
    admin_password = os.environ.get('DEMO_ADMIN_PASSWORD')
    if admin_password:
        username = os.environ.get('DEMO_ADMIN_USERNAME', 'admin')
        admin_user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            admin_user.set_password(admin_password)
            admin_user.save()
            print(f"Created development admin user '{username}'.")
        elif not admin_user.is_staff or not admin_user.is_superuser:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save(update_fields=['is_staff', 'is_superuser'])
            print(f"Granted development admin access to '{username}'; password left unchanged.")
        else:
            print(f"Development admin user '{username}' already exists; password left unchanged.")
    else:
        print("Skipping demo admin creation. Set DEMO_ADMIN_PASSWORD to create one.")

    # 2. Create Hospital Info
    hosp, created = Hospital.objects.get_or_create(
        id=1,
        defaults={
            'name': 'CityCare General & Research Hospital',
            'about': 'CityCare is a premier healthcare institution providing world-class medical services with modern equipment, 24/7 emergency care, and expert specialists across all disciplines.',
            'address': '104 Healthcare Boulevard, Medical District, Suite 500',
            'contact_details': '+1 (800) 555-0199 / info@citycare.org'
        }
    )
    if created:
        print("Created default Hospital info.")

    # 3. Create Departments
    departments_data = [
        ("General Medicine", "Primary healthcare, routine physical checkups, and diagnostic consultations."),
        ("Cardiology", "Advanced heart health care, cardiac screenings, and blood pressure management."),
        ("Pediatrics", "Specialized child health, vaccination guidance, and pediatric wellness care."),
        ("Orthopedics", "Bone, joint, and muscle care, injury recovery, and spinal health."),
        ("Neurology", "Comprehensive brain, nerve, and movement disorder consultations."),
        ("Dermatology", "Skin care treatments, allergy management, and cosmetic dermatology."),
    ]

    dept_objs = {}
    for name, desc in departments_data:
        dept, _ = Department.objects.get_or_create(name=name, defaults={'description': desc})
        dept_objs[name] = dept
    print(f"Ensured {len(dept_objs)} departments exist.")

    # 4. Create Sample Doctors
    doctors_data = [
        {
            "name": "Dr. Sarah Jenkins",
            "specialization": dept_objs.get("Cardiology"),
            "experience": "12 Years",
            "consultation_time": "09:00 AM - 01:00 PM",
            "available_days": "Mon, Wed, Fri",
            "photo_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop"
        },
        {
            "name": "Dr. Michael Chen",
            "specialization": dept_objs.get("General Medicine"),
            "experience": "8 Years",
            "consultation_time": "10:00 AM - 04:00 PM",
            "available_days": "Mon, Tue, Thu, Sat",
            "photo_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop"
        },
        {
            "name": "Dr. Emily Rodriguez",
            "specialization": dept_objs.get("Pediatrics"),
            "experience": "15 Years",
            "consultation_time": "02:00 PM - 06:00 PM",
            "available_days": "Tue, Wed, Fri, Sat",
            "photo_url": "https://images.unsplash.com/photo-1594824813566-88855ce7890b?q=80&w=600&auto=format&fit=crop"
        },
        {
            "name": "Dr. James Wilson",
            "specialization": dept_objs.get("Orthopedics"),
            "experience": "10 Years",
            "consultation_time": "11:00 AM - 03:00 PM",
            "available_days": "Mon, Thu, Fri",
            "photo_url": "https://images.unsplash.com/photo-1612349317150-e410f624c427?q=80&w=600&auto=format&fit=crop"
        }
    ]

    for d_info in doctors_data:
        Doctor.objects.get_or_create(
            name=d_info["name"],
            defaults=d_info
        )
    print("Ensured sample doctors exist.")
    print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed()
