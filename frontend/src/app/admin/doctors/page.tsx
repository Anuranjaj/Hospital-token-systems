"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Department } from "@/lib/types";

interface Doctor {
  id: number;
  name: string;
  specialization: { id: number, name: string } | null;
  experience: string;
  consultation_time: string;
  available_days: string;
  photo_url: string;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [specializationId, setSpecializationId] = useState<string>("");
  const [experience, setExperience] = useState("");
  const [time, setTime] = useState("");
  const [days, setDays] = useState("");
  const [photo, setPhoto] = useState("");

  const { toast } = useToast();

  const loadDoctors = useCallback(() => api.get<Doctor[]>('doctors/'), []);
  const loadDepartments = useCallback(() => api.get<Department[]>('departments/'), []);

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await loadDoctors();
      setDoctors(response.data);
    } catch {
      toast({title: "Error fetching doctors", variant: "destructive"});
    }
  }, [loadDoctors, toast]);

  useEffect(() => {
    let active = true;
    loadDoctors()
      .then((response) => { if (active) setDoctors(response.data); })
      .catch(() => { if (active) toast({title: "Error fetching doctors", variant: "destructive"}); });
    loadDepartments()
      .then((response) => { if (active) setDepartments(response.data); })
      .catch(() => { if (active) toast({title: "Failed to load departments", variant: "destructive"}); });
    return () => { active = false; };
  }, [loadDepartments, loadDoctors, toast]);

  const resetForm = () => {
    setName("");
    setSpecializationId("");
    setExperience("");
    setTime("");
    setDays("");
    setPhoto("");
    setEditingDoctor(null);
  };

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setName(doctor.name);
      setSpecializationId(doctor.specialization ? doctor.specialization.id.toString() : "");
      setExperience(doctor.experience);
      setTime(doctor.consultation_time);
      setDays(doctor.available_days);
      setPhoto(doctor.photo_url || "");
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        specialization_id: specializationId ? parseInt(specializationId, 10) : null,
        experience,
        consultation_time: time,
        available_days: days,
        photo_url: photo
      };

      if (editingDoctor) {
        await api.patch(`doctors/${editingDoctor.id}/`, payload);
        toast({ title: "Doctor updated successfully" });
      } else {
        await api.post('doctors/', payload);
        toast({ title: "Doctor added successfully" });
      }
      setIsDialogOpen(false);
      fetchDoctors();
    } catch {
      toast({title: "Error saving doctor", variant: "destructive"});
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await api.delete(`doctors/${id}/`);
      toast({ title: "Doctor deleted successfully" });
      fetchDoctors();
    } catch {
      toast({title: "Error deleting doctor", variant: "destructive"});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Doctors Management</h2>
          <p className="text-slate-500">Add, view, edit or remove doctors.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2"/> Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. John Doe" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Department / Specialization</label>
                <select
                  value={specializationId}
                  onChange={(e) => setSpecializationId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Experience</label>
                <Input value={experience} onChange={(e) => setExperience(e.target.value)} required placeholder="10 Years" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consultation Time</label>
                  <Input value={time} onChange={(e) => setTime(e.target.value)} required placeholder="10:00 AM - 02:00 PM" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Days</label>
                  <Input value={days} onChange={(e) => setDays(e.target.value)} required placeholder="Mon, Wed, Fri" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo URL</label>
                <div className="flex gap-2">
                  <Input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://images.unsplash.com/..." />
                  {photo && <Image src={photo} alt="Preview" width={40} height={40} unoptimized className="h-10 w-10 rounded-full object-cover" />}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Doctor</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  {doctor.photo_url ? (
                    <Image src={doctor.photo_url} alt={doctor.name} width={40} height={40} unoptimized className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 border rounded-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{doctor.name}</TableCell>
                <TableCell>{doctor.specialization?.name || 'General'}</TableCell>
                <TableCell>{doctor.experience}</TableCell>
                <TableCell>
                  <div className="text-sm">{doctor.available_days}</div>
                  <div className="text-xs text-slate-500">{doctor.consultation_time}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(doctor)}>
                      <Pencil className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(doctor.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {doctors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-slate-500">
                  No doctors found. Please add some.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
