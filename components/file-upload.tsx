"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, File, Loader2, AlertCircle } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
}

export default function FileUpload({ onFileSelect, isLoading = false }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>("")

  const handleFileSelect = (file: File) => {
    setError("")

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files?.[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files?.[0]) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
          dragActive ? "border-primary bg-accent" : "border-border hover:border-ring"
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf" onChange={handleInputChange} className="hidden" />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="mb-4 p-3 bg-primary/10 rounded-full">
              <File className="w-6 h-6 text-primary" />
            </div>
            <p className="text-foreground font-semibold mb-2">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground mb-6">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            {isLoading && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing your resume...</span>
              </div>
            )}
            {!isLoading && (
              <Button onClick={() => inputRef.current?.click()} variant="outline" className="rounded-lg">
                Choose Different File
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 p-3 bg-muted rounded-full">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold mb-1">Drag your resume here</p>
            <p className="text-sm text-muted-foreground mb-6">or</p>
            <Button onClick={() => inputRef.current?.click()} variant="outline" className="rounded-lg">
              Browse Files
            </Button>
            <p className="text-xs text-muted-foreground mt-4">PDF files up to 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
