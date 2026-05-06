import { useState, useEffect } from "react"

export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([])

  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return { toasts, addToast }
}
