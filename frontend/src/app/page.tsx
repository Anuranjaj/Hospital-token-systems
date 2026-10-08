"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import api from "@/lib/api"
import type { Doctor, Department, PublicToken } from "@/lib/types"
import {
  Stethoscope, Clock, Calendar, Star, Phone, User, X,
  CheckCircle, Monitor, LogIn, ChevronRight, Search
} from "lucide-react"

function DoctorAvatar({ doctor, size = "md" }: { doctor: Doctor; size?: "sm" | "md" | "lg" }) {
  const colors = [
    "from-sky-500 to-blue-600",
    "from-teal-500 to-cyan-600",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-green-600",
  ]
  const color = colors[doctor.id % colors.length]
  const initials = doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
  const sizeClasses = { sm: "w-10 h-10 text-sm", md: "w-16 h-16 text-xl", lg: "w-20 h-20 text-2xl" }

  if (doctor.photo_url) {
    return (
      <Image
        src={doctor.photo_url}
        alt={doctor.name}
        width={80}
        height={80}
        unoptimized
        className={`${sizeClasses[size]} rounded-2xl object-cover`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
      />
    )
  }
  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shadow-lg`}>
      {initials}
    </div>
  )
}

export default function PatientBookingPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDept, setSelectedDept] = useState<number | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [patientName, setPatientName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [bookedToken, setBookedToken] = useState<PublicToken | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get("/departments/").then((r) => setDepartments(r.data)).catch(() => {})
    api.get("/doctors/").then((r) => setDoctors(r.data)).catch(() => {})
  }, [])

  const filteredDoctors = doctors.filter((d) => {
    const matchesDept = selectedDept ? d.specialization?.id === selectedDept : true
    const matchesSearch = searchQuery
      ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialization?.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesDept && matchesSearch
  })

  const openBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setBookedToken(null)
    setError("")
    setPatientName("")
    setPhoneNumber("")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDoctor(null)
    setBookedToken(null)
  }

  const handleBook = async () => {
    if (!selectedDoctor || !patientName.trim()) {
      setError("Please enter your full name.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const response = await api.post("/tokens/", {
        patient_name: patientName.trim(),
        phone_number: phoneNumber.trim(),
        doctor_id: selectedDoctor.id,
      })
      setBookedToken(response.data)
    } catch {
      setError("Failed to book token. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">MediToken</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/display"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Display Board</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-lg shadow-sky-500/30"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* HERO */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Tokens available today
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-sky-200 to-blue-300 bg-clip-text text-transparent">
              Book Your Hospital Token
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Skip the queue. Choose your doctor, get your token instantly, and arrive when it&apos;s your turn.
            </p>
          </motion.div>

          {/* SEARCH */}
          <motion.div
            className="mt-8 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by doctor name or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all text-sm"
              />
            </div>
          </motion.div>
        </div>
      </header>

      {/* DEPARTMENT FILTERS */}
      {departments.length > 0 && (
        <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedDept(null)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedDept === null
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Departments
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id === selectedDept ? null : dept.id)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedDept === dept.id
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {doctors.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No doctors available yet.</p>
            <p className="text-sm mt-1">Please check back later or contact the hospital.</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No doctors found.</p>
            <p className="text-sm mt-1">Try a different search term or department.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {filteredDoctors.map((doctor, i) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 cursor-pointer"
                onClick={() => openBooking(doctor)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <DoctorAvatar doctor={doctor} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">
                      Dr. {doctor.name}
                    </h3>
                    {doctor.specialization && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-sky-50 text-sky-600 text-xs font-semibold rounded-full border border-sky-100">
                        {doctor.specialization.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  {doctor.experience && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                      <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{doctor.experience} experience</span>
                    </div>
                  )}
                  {doctor.consultation_time && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <span>{doctor.consultation_time}</span>
                    </div>
                  )}
                  {doctor.available_days && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
                      <span>{doctor.available_days}</span>
                    </div>
                  )}
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-md shadow-sky-500/25 group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-all">
                  Book Token
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {showModal && selectedDoctor && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          >
            <motion.div
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <DoctorAvatar doctor={selectedDoctor} size="sm" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Booking for</p>
                      <p className="font-bold text-base">Dr. {selectedDoctor.name}</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                {selectedDoctor.specialization && (
                  <span className="inline-block px-3 py-1 bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-medium rounded-full">
                    {selectedDoctor.specialization.name}
                  </span>
                )}
              </div>

              {/* Modal Body */}
              <AnimatePresence mode="wait">
                {bookedToken ? (
                  // SUCCESS STATE
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-9 h-9 text-emerald-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Token Booked!</h3>
                    <p className="text-slate-500 text-sm mb-6">Your token number is</p>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                      className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-sky-500/30"
                    >
                      <span className="text-5xl font-black text-white">
                        {bookedToken.token_number}
                      </span>
                    </motion.div>
                    <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Patient</span>
                        <span className="font-semibold text-slate-900">{patientName.trim()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Doctor</span>
                        <span className="font-semibold text-slate-900">Dr. {selectedDoctor.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Status</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          {bookedToken.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setBookedToken(null); setPatientName(""); setPhoneNumber("") }}
                        className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Book Another
                      </button>
                      <button
                        onClick={closeModal}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // FORM STATE
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-5">Enter Your Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleBook()}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-sm transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleBook()}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-sm text-red-500 flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> {error}
                      </motion.p>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={closeModal}
                        className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBook}
                        disabled={loading}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Get Token <ChevronRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 mt-10 py-6 text-center text-slate-400 text-sm">
        <p>MediToken — Hospital Token Management System</p>
      </footer>
    </div>
  )
}
