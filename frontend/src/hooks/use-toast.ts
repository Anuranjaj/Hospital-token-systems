"use client"

import { useCallback } from "react"

export interface ToastOptions {
  title: string
  variant?: "default" | "destructive"
}

export const TOAST_EVENT = "app-toast"

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    window.dispatchEvent(new CustomEvent<ToastOptions>(TOAST_EVENT, { detail: options }))
  }, [])

  return { toast }
}
