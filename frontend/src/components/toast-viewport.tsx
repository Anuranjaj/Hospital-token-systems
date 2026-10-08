"use client"

import { useEffect, useRef, useState } from "react"
import { TOAST_EVENT, type ToastOptions } from "@/hooks/use-toast"

export function ToastViewport() {
  const [toast, setToast] = useState<ToastOptions | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const showToast = (event: Event) => {
      const options = (event as CustomEvent<ToastOptions>).detail
      setToast(options)

      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setToast(null), 4000)
    }

    window.addEventListener(TOAST_EVENT, showToast)
    return () => {
      window.removeEventListener(TOAST_EVENT, showToast)
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  if (!toast) return null

  const isError = toast.variant === "destructive"

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed right-4 top-4 z-[100] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-slate-200 bg-white text-slate-800"
      }`}
    >
      {toast.title}
    </div>
  )
}
