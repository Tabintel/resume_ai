"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LandingPage from "@/components/pages/landing-page"
import AuthModal from "@/components/auth-modal"

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"enroll" | "login">("login")
  const router = useRouter()

  const handleAuthAction = (mode: "enroll" | "login") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (facialId: string) => {
    sessionStorage.setItem("facialId", facialId)
    setShowAuthModal(false)
    router.push("/dashboard")
  }

  return (
    <>
      <LandingPage onEnroll={() => handleAuthAction("enroll")} onLogin={() => handleAuthAction("login")} />
      {showAuthModal && (
        <AuthModal mode={authMode} onSuccess={handleAuthSuccess} onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}
