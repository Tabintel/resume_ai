"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"

interface AuthModalProps {
  mode: "enroll" | "login"
  onSuccess: (facialId: string) => void
  onClose: () => void
}

export default function AuthModal({ mode, onSuccess, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAuth = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Simulated FACEIO integration
      // In production, this would call the actual FACEIO SDK
      // const fio = new faceIO('your-public-id')
      // const userData = mode === 'enroll'
      //   ? await fio.enroll({ locale: 'auto' })
      //   : await fio.authenticate({ locale: 'auto' })
      // onSuccess(userData.facialId)

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockFacialId = `facial_${Math.random().toString(36).substr(2, 9)}`
      onSuccess(mockFacialId)
    } catch (err) {
      setError(mode === "enroll" ? "Face enrollment failed. Try again." : "Face authentication failed. Try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{mode === "enroll" ? "Create Account" : "Sign In"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-muted-foreground text-sm mb-6">
            {mode === "enroll"
              ? "Position your face in the frame, ensure good lighting, and follow the on-screen prompts."
              : "Look at your camera and allow face recognition to verify your identity."}
          </p>

          {/* Camera Preview Placeholder */}
          <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center mb-6 border border-border">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-border mx-auto mb-3"></div>
              <p className="text-xs text-muted-foreground">Camera Preview</p>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button onClick={handleAuth} disabled={isLoading} className="w-full rounded-xl">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : mode === "enroll" ? (
              "Start Enrollment"
            ) : (
              "Authenticate"
            )}
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full rounded-xl bg-transparent">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
