"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Ticket, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface Doctor {
  id: number;
  name: string;
  specialization: { name: string } | null;
}

export default function BookTokenPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientName, setPatientName] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ token_number: number, date: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{type: 'success'|'error', msg: string} | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('doctors/');
        setDoctors(response.data);
      } catch {
        console.error("Failed to fetch doctors.");
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !selectedDoctor) {
      setToastMessage({type: 'error', msg: "Please fill in all the details."});
      return;
    }

    setLoading(true);
    setToastMessage(null);
    try {
      const response = await api.post('tokens/', {
        patient_name: patientName,
        doctor_id: selectedDoctor
      });
      
      setTokenInfo({
        token_number: response.data.token_number,
        date: response.data.date
      });
      setToastMessage({type: 'success', msg: `Token ${response.data.token_number} booked successfully!`});
    } catch {
      setToastMessage({type: 'error', msg: "There was an error while booking your token."});
    } finally {
      setLoading(false);
    }
  };

  if (tokenInfo) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center min-h-[80vh] items-center">
        <Card className="w-full max-w-md shadow-xl border-green-100">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Booking Confirmed</CardTitle>
            <CardDescription>Your token has been successfully generated.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center mb-6">
              <p className="text-slate-500 text-sm mb-1">Your Token Number</p>
              <h2 className="text-6xl font-black text-slate-900">{tokenInfo.token_number}</h2>
              <p className="text-slate-500 mt-2 text-sm">Date: {tokenInfo.date}</p>
            </div>
            
            <Alert className="bg-blue-50 text-blue-800 border-blue-200 mb-6">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Please keep an eye on the Live Token Display to estimate your turn.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
               <Link href="/live" className="flex-1">
                 <Button className="w-full" variant="outline">Live Tracking</Button>
               </Link>
               <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                 setTokenInfo(null);
                 setPatientName("");
                 setSelectedDoctor("");
                 setToastMessage(null);
               }}>Book Another</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col justify-center min-h-[80vh] items-center">
      <div className="w-full max-w-md mb-4">
        <Link href="/">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 p-0">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Ticket className="h-6 w-6 mr-2 text-blue-600" /> Book a Token
          </CardTitle>
          <CardDescription>Enter details to get your consultation token.</CardDescription>
        </CardHeader>
        <CardContent>
          {toastMessage && (
            <Alert variant={toastMessage.type === 'error' ? 'destructive' : 'default'} className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{toastMessage.msg}</AlertDescription>
            </Alert>
          )}
          
          {doctors.length === 0 ? (
             <Alert className="bg-amber-50 text-amber-800 border-amber-200">
               <AlertCircle className="h-4 w-4 text-amber-600" />
               <AlertTitle>No Doctors Available</AlertTitle>
               <AlertDescription>
                 Currently, there are no doctors available for booking. Please try again later.
               </AlertDescription>
             </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Patient Name</label>
                <Input 
                  placeholder="Enter your full name" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Doctor</label>
                <Select disabled={loading} value={selectedDoctor} onValueChange={setSelectedDoctor} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a specialist" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.name} {doctor.specialization ? `(${doctor.specialization.name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Generating..." : "Generate Token"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
