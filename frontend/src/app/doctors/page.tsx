"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Award, Stethoscope, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Doctor {
  id: number;
  name: string;
  specialization: { name: string } | null;
  experience: string;
  consultation_time: string;
  available_days: string;
  photo_url: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('doctors/');
        setDoctors(response.data);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 p-0">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Meet Our Medical Specialists</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Our team of experienced and dedicated doctors are here to provide you with expert medical care.
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Stethoscope className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-medium text-slate-600">No doctors available yet</h3>
          <p className="text-slate-500 mt-2">Please check back later or contact the hospital administration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 group">
              <div className="h-64 overflow-hidden relative bg-slate-100">
                <Image
                  src={doctor.photo_url || "https://images.unsplash.com/photo-1612349317150-e410f624c427?q=80&w=1770&auto=format&fit=crop"} 
                  alt={doctor.name}
                  width={480}
                  height={256}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {doctor.specialization ? doctor.specialization.name : "General"}
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Experience: <span className="font-medium text-gray-900">{doctor.experience}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Days: <span className="font-medium text-gray-900">{doctor.available_days}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Time: <span className="font-medium text-gray-900">{doctor.consultation_time}</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
