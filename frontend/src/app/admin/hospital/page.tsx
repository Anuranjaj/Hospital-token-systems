"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save } from "lucide-react";

export default function AdminHospitalPage() {
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await api.get('hospitals/');
        if (response.data.length > 0) {
          const hosp = response.data[0];
          setHospitalId(hosp.id);
          setName(hosp.name);
          setAbout(hosp.about);
          setAddress(hosp.address);
          setContact(hosp.contact_details);
        }
      } catch {
        toast({ title: "Failed to load hospital details", variant: "destructive" });
      }
    };
    fetchHospital();
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      name,
      about,
      address,
      contact_details: contact
    };

    try {
      if (hospitalId) {
        await api.patch(`hospitals/${hospitalId}/`, payload);
      } else {
        const res = await api.post(`hospitals/`, payload);
        setHospitalId(res.data.id);
      }
      toast({ title: "Hospital details updated successfully" });
    } catch {
      toast({ title: "Failed to update hospital", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Hospital Details</h2>
        <p className="text-slate-500">Manage public information about the facility.</p>
      </div>

      <Card className="max-w-2xl shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-5 h-5 text-blue-600" />
            General Information
          </CardTitle>
          <CardDescription>
            These details will appear on the public Home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hospital Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="E.g., CitiCare Hospital" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">About Section</label>
              <Textarea 
                value={about} 
                onChange={(e) => setAbout(e.target.value)} 
                placeholder="A brief description of the hospital's mission and facilities..." 
                rows={5}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Full address of the hospital" 
                rows={2}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Number</label>
              <Input 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                placeholder="+1 (234) 567-8900" 
                required 
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
