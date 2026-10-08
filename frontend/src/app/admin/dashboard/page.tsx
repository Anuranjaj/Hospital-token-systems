"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import api from "@/lib/api"
import { logout, isAuthenticated } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import type { Doctor, Department, Token } from "@/lib/types"
import {
  Stethoscope, Users, LayoutGrid, LogOut, Plus, Edit2, Trash2,
  X, ChevronDown, Phone, User, Star, Clock, Calendar, CheckCircle,
  AlertTriangle, ArrowRight, RefreshCw, Search, Save, Loader2,
  Building2, FileText
} from "lucide-react"

// ─── DOCTOR AVATAR ───────────────────────────────────────────────────────────
function DoctorAvatar({ doctor, size = "md" }: { doctor: Doctor; size?: "sm" | "md" }) {
  const colors = [
    "from-sky-500 to-blue-600", "from-teal-500 to-cyan-600",
    "from-violet-500 to-purple-600", "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600", "from-emerald-500 to-green-600",
  ]
  const color = colors[doctor.id % colors.length]
  const initials = doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const cls = size === "sm" ? "w-9 h-9 text-sm" : "w-12 h-12 text-base"

  return (
    <div className={`${cls} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md`}>
      {initials}
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Token["status"] }) {
  const map: Record<Token["status"], string> = {
    Waiting: "bg-amber-50 text-amber-700 border-amber-200",
    Current: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Consulted: "bg-blue-50 text-blue-700 border-blue-200",
    "Not Reached": "bg-red-50 text-red-700 border-red-200",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status]}`}>
      {status}
    </span>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl p-4 border ${color}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-70">{label}</p>
    </div>
  )
}

// ─── DOCTOR FORM MODAL ────────────────────────────────────────────────────────
interface DoctorFormProps {
  doctor?: Doctor | null
  departments: Department[]
  onClose: () => void
  onSaved: () => void
}

function DoctorFormModal({ doctor, departments, onClose, onSaved }: DoctorFormProps) {
  const isEdit = !!doctor
  const [form, setForm] = useState({
    name: doctor?.name ?? "",
    specialization_id: doctor?.specialization?.id?.toString() ?? "",
    experience: doctor?.experience ?? "",
    consultation_time: doctor?.consultation_time ?? "",
    available_days: doctor?.available_days ?? "",
    photo_url: doctor?.photo_url ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError("Doctor name is required."); return }
    setLoading(true)
    setError("")
    try {
      const payload = {
        name: form.name.trim(),
        specialization_id: form.specialization_id ? parseInt(form.specialization_id) : null,
        experience: form.experience.trim(),
        consultation_time: form.consultation_time.trim(),
        available_days: form.available_days.trim(),
        photo_url: form.photo_url.trim(),
      }
      if (isEdit) {
        await api.put(`/doctors/${doctor!.id}/`, payload)
      } else {
        await api.post("/doctors/", payload)
      }
      onSaved()
    } catch {
      setError("Failed to save. Please check your details and try again.")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: "name", label: "Full Name", placeholder: "e.g. Rajesh Kumar", required: true, icon: <User className="w-4 h-4" /> },
    { key: "experience", label: "Experience", placeholder: "e.g. 10 Years", required: false, icon: <Star className="w-4 h-4" /> },
    { key: "consultation_time", label: "Consultation Hours", placeholder: "e.g. 10:00 AM - 02:00 PM", required: false, icon: <Clock className="w-4 h-4" /> },
    { key: "available_days", label: "Available Days", placeholder: "e.g. Mon, Tue, Wed, Thu, Fri", required: false, icon: <Calendar className="w-4 h-4" /> },
    { key: "photo_url", label: "Photo URL", placeholder: "https://example.com/photo.jpg", required: false, icon: <User className="w-4 h-4" /> },
  ]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-6 py-5 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">{isEdit ? "Edit Doctor" : "Add New Doctor"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Department Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department / Specialization</label>
            <div className="relative">
              <select
                value={form.specialization_id}
                onChange={(e) => update("specialization_id", e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-sm appearance-none bg-white transition-all text-slate-700"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {fields.map(({ key, label, placeholder, required, icon }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => update(key, e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-sm transition-all"
                />
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Save Changes" : "Add Doctor"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── DEPARTMENT FORM MODAL ────────────────────────────────────────────────────
interface DeptFormProps {
  department?: Department | null
  onClose: () => void
  onSaved: () => void
}

function DepartmentFormModal({ department, onClose, onSaved }: DeptFormProps) {
  const isEdit = !!department
  const [name, setName] = useState(department?.name ?? "")
  const [description, setDescription] = useState(department?.description ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Department name is required."); return }
    setLoading(true)
    setError("")
    try {
      const payload = { name: name.trim(), description: description.trim() }
      if (isEdit) {
        await api.put(`/departments/${department!.id}/`, payload)
      } else {
        await api.post("/departments/", payload)
      }
      onSaved()
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-6 py-5 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">{isEdit ? "Edit Department" : "Add New Department"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Department Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Cardiology"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <textarea
                placeholder="Brief description of the department..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-sm transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Save Changes" : "Add Department"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"tokens" | "doctors" | "departments">("tokens")

  // Token state
  const [tokens, setTokens] = useState<Token[]>([])
  const [tokenFilter, setTokenFilter] = useState<number | "all">("all")
  const [tokenSearch, setTokenSearch] = useState("")
  const [loadingTokens, setLoadingTokens] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Doctor state
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [deletingDoctorId, setDeletingDoctorId] = useState<number | null>(null)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [doctorSearch, setDoctorSearch] = useState("")

  // Department state
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deletingDeptId, setDeletingDeptId] = useState<number | null>(null)
  const [loadingDepts, setLoadingDepts] = useState(false)
  const [deptSearch, setDeptSearch] = useState("")

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated()) router.replace("/admin")
  }, [router])

  const loadTokens = useCallback(() => api.get<Token[]>("/tokens/live/"), [])
  const loadDoctorsAndDepartments = useCallback(
    () => Promise.all([
      api.get<Doctor[]>("/doctors/"),
      api.get<Department[]>("/departments/"),
    ]),
    [],
  )
  const loadDepartments = useCallback(() => api.get<Department[]>("/departments/"), [])

  const fetchTokens = useCallback(async () => {
    setLoadingTokens(true)
    try {
      const response = await loadTokens()
      setTokens(response.data)
    } catch {
      toast({ title: "Could not load today's tokens.", variant: "destructive" })
    } finally {
      setLoadingTokens(false)
    }
  }, [loadTokens, toast])

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true)
    try {
      const [doctorsResponse, departmentsResponse] = await loadDoctorsAndDepartments()
      setDoctors(doctorsResponse.data)
      setDepartments(departmentsResponse.data)
    } catch {
      toast({ title: "Could not load doctors and departments.", variant: "destructive" })
    } finally {
      setLoadingDoctors(false)
    }
  }, [loadDoctorsAndDepartments, toast])

  const fetchDepartments = useCallback(async () => {
    setLoadingDepts(true)
    try {
      const response = await loadDepartments()
      setDepartments(response.data)
    } catch {
      toast({ title: "Could not load departments.", variant: "destructive" })
    } finally {
      setLoadingDepts(false)
    }
  }, [loadDepartments, toast])

  useEffect(() => {
    let active = true

    loadTokens()
      .then((response) => {
        if (active) setTokens(response.data)
      })
      .catch(() => {
        if (active) toast({ title: "Could not load today's tokens.", variant: "destructive" })
      })
      .finally(() => {
        if (active) setLoadingTokens(false)
      })

    loadDoctorsAndDepartments()
      .then(([doctorsResponse, departmentsResponse]) => {
        if (!active) return
        setDoctors(doctorsResponse.data)
        setDepartments(departmentsResponse.data)
      })
      .catch(() => {
        if (active) toast({ title: "Could not load doctors and departments.", variant: "destructive" })
      })
      .finally(() => {
        if (active) setLoadingDoctors(false)
      })

    return () => {
      active = false
    }
  }, [loadDoctorsAndDepartments, loadTokens, toast])

  // ── TOKEN ACTIONS ──
  const updateTokenStatus = async (tokenId: number, newStatus: Token["status"]) => {
    setUpdatingId(tokenId)
    try {
      await api.patch(`/tokens/${tokenId}/`, { status: newStatus })
      setTokens((prev) => prev.map((t) => t.id === tokenId ? { ...t, status: newStatus } : t))
    } catch {
      toast({ title: "Could not update the token status.", variant: "destructive" })
    }
    finally { setUpdatingId(null) }
  }

  // ── DOCTOR ACTIONS ──
  const deleteDoctor = async (doctorId: number) => {
    if (!confirm("Are you sure you want to delete this doctor? All their tokens will also be deleted.")) return
    setDeletingDoctorId(doctorId)
    try {
      await api.delete(`/doctors/${doctorId}/`)
      setDoctors((prev) => prev.filter((d) => d.id !== doctorId))
    } catch {
      toast({ title: "Could not delete the doctor.", variant: "destructive" })
    }
    finally { setDeletingDoctorId(null) }
  }

  // ── DEPARTMENT ACTIONS ──
  const deleteDepartment = async (deptId: number) => {
    if (!confirm("Are you sure you want to delete this department? Doctors assigned to it will be unlinked.")) return
    setDeletingDeptId(deptId)
    try {
      await api.delete(`/departments/${deptId}/`)
      setDepartments((prev) => prev.filter((d) => d.id !== deptId))
    } catch {
      toast({ title: "Could not delete the department.", variant: "destructive" })
    }
    finally { setDeletingDeptId(null) }
  }

  const handleLogout = () => {
    logout()
    router.replace("/admin")
  }

  // ── DERIVED DATA ──
  const filteredTokens = tokens.filter((t) => {
    const matchDoc = tokenFilter === "all" || t.doctor.id === tokenFilter
    const matchSearch = tokenSearch
      ? t.patient_name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
        t.token_number.toString().includes(tokenSearch)
      : true
    return matchDoc && matchSearch
  })

  const filteredDoctors = doctors.filter((d) =>
    doctorSearch
      ? d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.specialization?.name.toLowerCase().includes(doctorSearch.toLowerCase())
      : true
  )

  const filteredDepts = departments.filter((d) =>
    deptSearch
      ? d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
        d.description?.toLowerCase().includes(deptSearch.toLowerCase())
      : true
  )

  const stats = {
    total: filteredTokens.length,
    waiting: filteredTokens.filter((t) => t.status === "Waiting").length,
    current: filteredTokens.filter((t) => t.status === "Current").length,
    consulted: filteredTokens.filter((t) => t.status === "Consulted").length,
    notReached: filteredTokens.filter((t) => t.status === "Not Reached").length,
  }

  const navItems = [
    { id: "tokens" as const, label: "Token Queue", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "doctors" as const, label: "Doctors", icon: <Users className="w-4 h-4" /> },
    { id: "departments" as const, label: "Departments", icon: <Building2 className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ── SIDEBAR ── */}
      <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0 shadow-2xl">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30 flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">MediToken</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Links & Logout */}
        <div className="px-3 pb-5 space-y-1 border-t border-slate-800 pt-3">
          <Link
            href="/display"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <LayoutGrid className="w-4 h-4" />
            Display Board
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <User className="w-4 h-4" />
            Patient View
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        <AnimatePresence mode="wait">
          {/* ════ TOKEN QUEUE TAB ════ */}
          {activeTab === "tokens" && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-8"
            >
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Token Queue</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Today&apos;s patient tokens — manage status manually</p>
                </div>
                <button
                  onClick={fetchTokens}
                  disabled={loadingTokens}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingTokens ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                <StatCard label="Total" value={stats.total} color="bg-slate-50 border-slate-200 text-slate-800" />
                <StatCard label="Waiting" value={stats.waiting} color="bg-amber-50 border-amber-200 text-amber-800" />
                <StatCard label="Current" value={stats.current} color="bg-emerald-50 border-emerald-200 text-emerald-800" />
                <StatCard label="Consulted" value={stats.consulted} color="bg-blue-50 border-blue-200 text-blue-800" />
                <StatCard label="Not Reached" value={stats.notReached} color="bg-red-50 border-red-200 text-red-800" />
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patient or token#..."
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm bg-white shadow-sm"
                  />
                </div>
                <div className="relative">
                  <select
                    value={tokenFilter}
                    onChange={(e) => setTokenFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                    className="pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm bg-white shadow-sm appearance-none text-slate-700"
                  >
                    <option value="all">All Doctors</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>Dr. {d.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Token Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {filteredTokens.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No tokens found</p>
                    <p className="text-sm mt-1">
                      {tokens.length === 0 ? "No tokens have been issued today." : "No tokens match your filter."}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 w-16">#</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Patient</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Doctor</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTokens.map((token) => (
                        <motion.tr
                          key={token.id}
                          layout
                          className={`hover:bg-slate-50 transition-colors ${token.status === "Current" ? "bg-emerald-50/50" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                              token.status === "Current"
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {token.token_number}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{token.patient_name}</p>
                            {token.phone_number && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" /> {token.phone_number}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-slate-700 font-medium">Dr. {token.doctor.name}</p>
                            {token.doctor.specialization && (
                              <p className="text-xs text-slate-400">{token.doctor.specialization.name}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={token.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {updatingId === token.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                              ) : (
                                <>
                                  {token.status === "Waiting" && (
                                    <button
                                      onClick={() => updateTokenStatus(token.id, "Current")}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                                    >
                                      <ArrowRight className="w-3 h-3" /> Call
                                    </button>
                                  )}
                                  {token.status === "Current" && (
                                    <button
                                      onClick={() => updateTokenStatus(token.id, "Consulted")}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors"
                                    >
                                      <CheckCircle className="w-3 h-3" /> Done
                                    </button>
                                  )}
                                  {(token.status === "Waiting" || token.status === "Current") && (
                                    <button
                                      onClick={() => updateTokenStatus(token.id, "Not Reached")}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"
                                    >
                                      <X className="w-3 h-3" /> Skip
                                    </button>
                                  )}
                                  {(token.status === "Consulted" || token.status === "Not Reached") && (
                                    <span className="text-xs text-slate-400">—</span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {/* ════ DOCTORS TAB ════ */}
          {activeTab === "doctors" && (
            <motion.div
              key="doctors"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-8"
            >
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Doctors</h2>
                  <p className="text-slate-500 text-sm mt-0.5">{doctors.length} doctor{doctors.length !== 1 ? "s" : ""} registered</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={fetchDoctors}
                    disabled={loadingDoctors}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingDoctors ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <button
                    id="add-doctor-btn"
                    onClick={() => { setEditingDoctor(null); setShowDoctorModal(true) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Doctor
                  </button>
                </div>
              </div>

              {departments.length === 0 && (
                <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>No departments found. <button onClick={() => setActiveTab("departments")} className="underline font-semibold">Add departments first</button> before adding doctors.</span>
                </div>
              )}

              {/* Search */}
              <div className="relative max-w-xs mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm bg-white shadow-sm"
                />
              </div>

              {/* Doctor Grid */}
              {filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">
                    {doctors.length === 0 ? "No doctors added yet." : "No doctors match your search."}
                  </p>
                  {doctors.length === 0 && (
                    <button
                      onClick={() => { setEditingDoctor(null); setShowDoctorModal(true) }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add First Doctor
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {filteredDoctors.map((doctor, i) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <DoctorAvatar doctor={doctor} size="md" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">Dr. {doctor.name}</h3>
                          {doctor.specialization && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-sky-50 text-sky-600 text-xs font-semibold rounded-full border border-sky-100">
                              {doctor.specialization.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        {doctor.experience && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            {doctor.experience}
                          </div>
                        )}
                        {doctor.consultation_time && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                            {doctor.consultation_time}
                          </div>
                        )}
                        {doctor.available_days && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                            {doctor.available_days}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-slate-100 pt-4">
                        <button
                          onClick={() => { setEditingDoctor(doctor); setShowDoctorModal(true) }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-sky-300 hover:text-sky-600 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => deleteDoctor(doctor.id)}
                          disabled={deletingDoctorId === doctor.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-all"
                        >
                          {deletingDoctorId === doctor.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ════ DEPARTMENTS TAB ════ */}
          {activeTab === "departments" && (
            <motion.div
              key="departments"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-8"
            >
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Departments</h2>
                  <p className="text-slate-500 text-sm mt-0.5">{departments.length} department{departments.length !== 1 ? "s" : ""} configured</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={fetchDepartments}
                    disabled={loadingDepts}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingDepts ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <button
                    id="add-dept-btn"
                    onClick={() => { setEditingDept(null); setShowDeptModal(true) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Department
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-xs mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm bg-white shadow-sm"
                />
              </div>

              {/* Department Grid */}
              {filteredDepts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">
                    {departments.length === 0 ? "No departments added yet." : "No departments match your search."}
                  </p>
                  {departments.length === 0 && (
                    <button
                      onClick={() => { setEditingDept(null); setShowDeptModal(true) }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add First Department
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {filteredDepts.map((dept, i) => {
                    const doctorCount = doctors.filter((d) => d.specialization?.id === dept.id).length
                    return (
                      <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 truncate text-base">{dept.name}</h3>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                              {doctorCount} doctor{doctorCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {dept.description && (
                          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{dept.description}</p>
                        )}

                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                          <button
                            onClick={() => { setEditingDept(dept); setShowDeptModal(true) }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-sky-300 hover:text-sky-600 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => deleteDepartment(dept.id)}
                            disabled={deletingDeptId === dept.id}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-all"
                          >
                            {deletingDeptId === dept.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── DOCTOR FORM MODAL ── */}
      <AnimatePresence>
        {showDoctorModal && (
          <DoctorFormModal
            doctor={editingDoctor}
            departments={departments}
            onClose={() => { setShowDoctorModal(false); setEditingDoctor(null) }}
            onSaved={() => { setShowDoctorModal(false); setEditingDoctor(null); fetchDoctors() }}
          />
        )}
      </AnimatePresence>

      {/* ── DEPARTMENT FORM MODAL ── */}
      <AnimatePresence>
        {showDeptModal && (
          <DepartmentFormModal
            department={editingDept}
            onClose={() => { setShowDeptModal(false); setEditingDept(null) }}
            onSaved={() => { setShowDeptModal(false); setEditingDept(null); fetchDepartments(); fetchDoctors() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
