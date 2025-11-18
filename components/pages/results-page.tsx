"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RotateCcw, LogOut, AlertCircle } from "lucide-react"
import ChatInterface from "@/components/chat-interface"

export default function ResultsPage() {
  const router = useRouter()
  const [jokes, setJokes] = useState<string[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [resumePreview, setResumePreview] = useState<string>("")
  const [usedMockData, setUsedMockData] = useState(false)

  useEffect(() => {
    const facialId = sessionStorage.getItem("facialId")
    if (!facialId) {
      router.push("/")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  useEffect(() => {
    const jokesData = sessionStorage.getItem("jokes")
    const preview = sessionStorage.getItem("resumePreview")
    const mockData = sessionStorage.getItem("usedMockData")

    if (jokesData) {
      setJokes(JSON.parse(jokesData))
    }
    if (preview) {
      setResumePreview(preview)
    }
    if (mockData) {
      setUsedMockData(JSON.parse(mockData))
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.clear()
    router.push("/")
  }

  const handleUploadAnother = () => {
    router.push("/dashboard")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-foreground">Resume Roaster</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Your Roasts Are Ready</h1>
          <p className="text-muted-foreground">Interact with your AI-generated jokes in real-time</p>
        </div>

        {usedMockData && (
          <div className="mb-6 p-4 bg-accent border border-border rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-accent-foreground font-medium">Demo Mode</p>
              <p className="text-sm text-accent-foreground/70">
                Using example jokes. Add a Vercel credit card to generate real AI jokes.
              </p>
            </div>
          </div>
        )}

        {/* Jokes Grid */}
        <div className="space-y-6">
          {jokes.length > 0 ? (
            <ChatInterface jokes={jokes} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your jokes...</p>
            </div>
          )}

          {/* Action Button */}
          <Button onClick={handleUploadAnother} variant="outline" className="w-full rounded-xl bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" />
            Upload Another Resume
          </Button>
        </div>
      </section>
    </main>
  )
}
