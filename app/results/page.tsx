"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ResultsPage from "@/components/pages/results-page"

export default function Results() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const facialId = sessionStorage.getItem("facialId")
    if (!facialId) {
      router.push("/")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <ResultsPage />
}
