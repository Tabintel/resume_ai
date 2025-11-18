"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface LandingPageProps {
  onEnroll: () => void
  onLogin: () => void
}

export default function LandingPage({ onEnroll, onLogin }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-foreground">Resume Roaster</div>
          <div className="text-sm text-muted-foreground">AI-Powered Humor</div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl w-full text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-foreground mb-4 tracking-tight leading-tight">Roast Your Resume</h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              Secure, passwordless authentication with face recognition. Unlock hilarious AI-generated jokes about your
              professional journey.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-6 mb-12 mt-16">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="text-sm font-semibold text-foreground mb-2">Secure</div>
              <p className="text-xs text-muted-foreground">Biometric authentication without passwords</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="text-sm font-semibold text-foreground mb-2">Private</div>
              <p className="text-xs text-muted-foreground">Your data is never stored or shared</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="text-sm font-semibold text-foreground mb-2">Hilarious</div>
              <p className="text-xs text-muted-foreground">AI roasts tailored to your resume</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={onEnroll} size="lg" className="px-8 rounded-xl">
              Sign Up with Face
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={onLogin} variant="outline" size="lg" className="px-8 rounded-xl bg-transparent">
              Login
            </Button>
          </div>

          {/* Footer Info */}
          <p className="text-xs text-muted-foreground mt-12">
            Powered by FACEIO and cutting-edge AI. No camera? No problem. We'll skip the fun.
          </p>
        </div>
      </section>
    </main>
  )
}
