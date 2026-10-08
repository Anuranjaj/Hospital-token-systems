"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import api from "@/lib/api"
import type { Doctor, PublicToken } from "@/lib/types"
import { Stethoscope, Clock, RefreshCw, Wifi, WifiOff } from "lucide-react"

interface DoctorQueue {
  doctor: Doctor
  current: PublicToken | null
  waiting: PublicToken[]
  consulted: number
  notReached: number
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="font-mono tabular-nums">
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  )
}

export default function DisplayPage() {
  const [queues, setQueues] = useState<DoctorQueue[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [secondsAgo, setSecondsAgo] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const [doctorsResponse, tokensResponse] = await Promise.all([
        api.get<Doctor[]>("/doctors/"),
        api.get<PublicToken[]>("/tokens/live/"),
      ])
      return { doctors: doctorsResponse.data, tokens: tokensResponse.data }
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let active = true

    const refresh = () => {
      fetchData().then((data) => {
        if (!active) return
        if (!data) {
          setIsOnline(false)
          return
        }

        const { doctors: allDoctors, tokens: allTokens } = data
        setDoctors(allDoctors)
        setQueues(allDoctors.map((doctor) => {
          const doctorTokens = allTokens.filter((token) => token.doctor.id === doctor.id)
          return {
            doctor,
            current: doctorTokens.find((token) => token.status === "Current") ?? null,
            waiting: doctorTokens
              .filter((token) => token.status === "Waiting")
              .sort((a, b) => a.token_number - b.token_number),
            consulted: doctorTokens.filter((token) => token.status === "Consulted").length,
            notReached: doctorTokens.filter((token) => token.status === "Not Reached").length,
          }
        }))
        setLastUpdated(new Date())
        setSecondsAgo(0)
        setIsOnline(true)
      })
    }

    refresh()
    const interval = setInterval(refresh, 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [fetchData])

  // Tick seconds-ago counter
  useEffect(() => {
    const t = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
      }
    }, 1000)
    return () => clearInterval(t)
  }, [lastUpdated])

  const activeDoctors = queues.filter(
    (q) => q.current !== null || q.waiting.length > 0 || q.consulted > 0
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* TOP BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">MediToken</h1>
            <p className="text-xs text-slate-400 font-medium">Live Token Display</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <RefreshCw className="w-3.5 h-3.5 opacity-50" />
            <span className="text-xs">{isOnline ? `${secondsAgo}s ago` : "Offline"}</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white font-mono">
              <LiveClock />
            </div>
            <div className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
        </div>
      </header>

      {/* STATUS LEGEND */}
      <div className="bg-slate-900/50 border-b border-slate-800/50 px-6 py-2 flex items-center gap-6 text-xs">
        {[
          { label: "Now Serving", color: "bg-emerald-500" },
          { label: "Waiting", color: "bg-slate-600" },
          { label: "Consulted", color: "bg-blue-700" },
          { label: "Not Reached", color: "bg-red-800" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-slate-400">
            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            {s.label}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        {doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 py-20">
            <Stethoscope className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-2xl font-bold mb-2">No Active Queues</p>
            <p className="text-slate-500">No doctors or tokens found for today.</p>
          </div>
        ) : activeDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 py-20">
            <Clock className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-2xl font-bold mb-2">All Clear</p>
            <p className="text-slate-500">No tokens have been issued for today yet.</p>
          </div>
        ) : (
          <div
            className="grid gap-5 h-full"
            style={{ gridTemplateColumns: `repeat(${Math.min(activeDoctors.length, 3)}, 1fr)` }}
          >
            {activeDoctors.map((q) => (
              <motion.div
                key={q.doctor.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col"
              >
                {/* Doctor Header */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4 border-b border-slate-800">
                  <p className="font-bold text-white text-lg leading-tight">Dr. {q.doctor.name}</p>
                  {q.doctor.specialization && (
                    <p className="text-sky-400 text-sm font-medium mt-0.5">{q.doctor.specialization.name}</p>
                  )}
                  <div className="flex gap-3 mt-3 text-xs">
                    <span className="text-slate-400">Total: <span className="text-white font-semibold">{q.waiting.length + (q.current ? 1 : 0) + q.consulted + q.notReached}</span></span>
                    <span className="text-blue-400">Done: <span className="font-semibold">{q.consulted}</span></span>
                    <span className="text-amber-400">Waiting: <span className="font-semibold">{q.waiting.length}</span></span>
                  </div>
                </div>

                {/* NOW SERVING */}
                <div className="px-5 py-6 border-b border-slate-800 flex-shrink-0">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Now Serving</p>
                  <AnimatePresence mode="wait">
                    {q.current ? (
                      <motion.div
                        key={q.current.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-4"
                      >
                        <div className="relative">
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                            <span className="text-4xl font-black text-white">
                              {q.current.token_number}
                            </span>
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-400 rounded-full animate-ping opacity-75" />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-400 rounded-full" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">Token #{q.current.token_number}</p>
                          <span className="mt-1 inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                            In Consultation
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-24 rounded-2xl bg-slate-800/50 border border-slate-700 border-dashed"
                      >
                        <p className="text-slate-600 text-sm">No one being served</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* WAITING QUEUE */}
                <div className="px-5 py-4 flex-1 min-h-0 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Waiting Queue ({q.waiting.length})
                  </p>
                  {q.waiting.length === 0 ? (
                    <p className="text-slate-700 text-sm text-center py-4">Queue is empty</p>
                  ) : (
                    <div className="space-y-2">
                      {q.waiting.slice(0, 8).map((token, idx) => (
                        <motion.div
                          key={token.id}
                          layout
                          className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-3 py-2.5"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            idx === 0 ? "bg-sky-500 text-white shadow-md shadow-sky-500/30" : "bg-slate-700 text-slate-300"
                          }`}>
                            {token.token_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">Token #{token.token_number}</p>
                          </div>
                          {idx === 0 && (
                            <span className="text-xs font-medium text-sky-400 flex-shrink-0">Next</span>
                          )}
                        </motion.div>
                      ))}
                      {q.waiting.length > 8 && (
                        <p className="text-center text-slate-600 text-xs mt-2">
                          +{q.waiting.length - 8} more waiting
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span>Auto-refreshes every 5 seconds</span>
        <Link href="/" className="hover:text-slate-300 transition-colors">← Patient Booking</Link>
      </footer>
    </div>
  )
}
