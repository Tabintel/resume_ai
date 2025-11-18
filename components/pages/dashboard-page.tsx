"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, AlertCircle } from "lucide-react"
import FileUpload from "@/components/file-upload"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const facialId = sessionStorage.getItem("facialId")
    if (!facialId) {
      router.push("/")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.clear()
    router.push("/")
  }

  const handleUpload = async (file: File) => {
    setError("")
    setUploadedFile(file)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("facialId", sessionStorage.getItem("facialId") || "")

      console.log("[v0] Uploading file:", file.name)

      const response = await fetch("/api/process-resume", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Error response:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || "Failed to process resume")
        } catch {
          throw new Error("Failed to process resume: " + errorText)
        }
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const decoder = new TextDecoder()
      let fullText = ""

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          console.log("[v0] Received chunk:", chunk.substring(0, 50))
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === "text-delta" && data.delta) {
                  fullText += data.delta
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      console.log("[v0] Full text received:", fullText.substring(0, 100))

      if (!fullText || fullText.length === 0) {
        throw new Error("No jokes were generated. Please try another resume.")
      }

      sessionStorage.setItem("jokes", JSON.stringify([fullText]))
      sessionStorage.setItem("resumePreview", file.name)
      router.push("/results")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error uploading file"
      console.error("[v0] Upload error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
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
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Welcome Back</h1>
          <p className="text-muted-foreground">Upload your resume and let AI roast your professional journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-destructive font-medium">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Card */}
        <div className="bg-card border border-border rounded-2xl p-12 mb-8">
          <FileUpload onFileSelect={handleUpload} isLoading={isLoading} />
        </div>

        {/* Info Box */}
        <div className="bg-accent border border-border rounded-2xl p-6 space-y-3">
          <p className="text-sm text-accent-foreground">
            <span className="font-semibold">Supported formats:</span> PDF files only (max 10MB). We'll parse your resume
            and generate hilarious AI jokes about your skills and experience.
          </p>
          <p className="text-xs text-accent-foreground/70">
            Your resume content is processed securely and not permanently stored.
          </p>
        </div>
      </section>
    </main>
  )
}
