"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Send, Loader2, AlertCircle } from "lucide-react"

interface ChatMessage {
  id: string
  type: "joke" | "user" | "ai"
  content: string
  timestamp: Date
  error?: boolean
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  jokes: string[]
}

export default function ChatInterface({ jokes }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const jokeMessages: ChatMessage[] = jokes.map((joke, index) => ({
      id: `joke-${index}`,
      type: "joke",
      content: joke,
      timestamp: new Date(),
    }))
    setMessages(jokeMessages)
  }, [jokes])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return

    setError("")

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: userInput,
      timestamp: new Date(),
    }

    const userInputValue = userInput
    setMessages((prev) => [...prev, userMessage])
    setUserInput("")
    setIsLoading(true)

    const aiMessageId = `ai-${Date.now()}`
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      type: "ai",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, aiMessage])

    try {
      const response = await fetch("/api/chat-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userInputValue,
          previousJokes: jokes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let fullContent = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === "text-delta" && data.delta) {
                fullContent += data.delta
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, content: fullContent, isStreaming: true } : msg,
                  ),
                )
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg)))
    } catch (error) {
      console.error("[v0] Error streaming message:", error)
      setError("Failed to get response. Please try again.")

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "ai",
        content: "I had trouble processing that. Try asking for more jokes or feedback about the resume.",
        timestamp: new Date(),
        error: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Loading jokes...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {message.type !== "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  {message.error ? "!" : "AI"}
                </div>
              )}

              <div
                className={`flex-1 max-w-xs lg:max-w-md ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.error
                      ? "bg-destructive/10 border border-destructive/30"
                      : "bg-accent"
                } rounded-xl p-4 group`}
              >
                <p className={`text-sm leading-relaxed ${message.type === "user" ? "text-primary-foreground" : ""}`}>
                  {message.content}
                  {message.isStreaming && (
                    <span className="ml-1 inline-block w-2 h-2 bg-current rounded-full animate-pulse"></span>
                  )}
                </p>

                {message.type === "joke" && !message.isStreaming && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(message.id, message.content)}
                    className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-xs text-primary-foreground font-semibold">
                  You
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4 bg-background space-y-2">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask for more jokes or feedback..."
            className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            size="sm"
            className="rounded-lg"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
