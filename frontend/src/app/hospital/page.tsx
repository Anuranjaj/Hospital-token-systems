"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Hospital } from "@/lib/types";
import { Building2, MapPin, PhoneCall, ShieldCheck, HeartPulse, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HospitalInfoPage() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('hospitals/')
      .then((res) => {
        if (res.data.length > 0) {
          setHospital(res.data[0]);
        }
      })
      .catch(() => console.error("Failed to load hospital details"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <Link href="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 mb-4 p-0">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Building2 className="w-10 h-10 text-sky-400" />
            <h1 className="text-4xl font-extrabold tracking-tight">
              {hospital ? hospital.name : "Hospital Information"}
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl">
            Providing compassionate, high-quality patient care with modern medical technology and dedicated specialists.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* About Section */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-6 h-6 text-blue-600" /> About Our Facility
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {hospital?.about || "Welcome to our state-of-the-art medical center. We specialize in comprehensive healthcare services including general consultations, specialized surgery, emergency response, and preventative healthcare programs."}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Hospital Address</h3>
                  <p className="text-sm text-slate-600 mt-1">{hospital?.address || "104 Healthcare Boulevard, Suite 500"}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Emergency & Helpline</h3>
                  <p className="text-sm text-slate-600 mt-1">{hospital?.contact_details || "+1 (800) 555-0199"}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">OPD Hours</h3>
                  <p className="text-sm text-slate-600 mt-1">Mon - Sat: 08:00 AM - 08:00 PM</p>
                </div>
              </div>
            </div>

            {/* Mission & Quality */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5" /> Accredited Patient Safety
                </div>
                <h3 className="text-2xl font-bold">Need assistance or immediate consultation?</h3>
                <p className="text-slate-300 text-sm">Book an online token or visit our reception desk for immediate support.</p>
              </div>
              <Link href="/book">
                <Button size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold whitespace-nowrap">
                  Book Token Now
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
