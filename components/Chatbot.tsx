"use client"

import { useState, useRef, useEffect, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Map, MessagesSquare } from "lucide-react"

type Mode = "skills" | "roadmap"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("skills")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setMessages([])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const userMessage = input.trim()
    if (!userMessage || isLoading) return

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    }

    const updatedMessages = [...messages, newUserMsg]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode,
        }),
      })

      if (!res.ok || !res.body) throw new Error("Failed to fetch")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2))
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + text }
                    : m
                )
              )
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again." }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const placeholders = {
    skills: "Ask about dribbling, shooting, fitness...",
    roadmap: "Tell me your skill level and goals...",
  }

  const welcomeMessages = {
    skills:
      "Hey! I'm your Basketball 101 coach. Ask me anything about basketball skills — dribbling, shooting, passing, fitness, or IQ. 🏀",
    roadmap:
      "Let's build your basketball roadmap! Tell me: your current skill level, your position, your age, and what you want to improve. I'll create a personalized plan for you. 🗺️",
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Open basketball coach chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] flex flex-col rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-orange-600/30 to-black/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏀</span>
              <span className="font-bold text-white text-sm">
                Basketball 101 Coach
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-1 p-2 border-b border-white/10 bg-black/20">
            <button
              onClick={() => switchMode("skills")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                mode === "skills"
                  ? "bg-orange-500 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <MessagesSquare className="w-3 h-3" />
              Skills Q&A
            </button>
            <button
              onClick={() => switchMode("roadmap")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                mode === "roadmap"
                  ? "bg-orange-500 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Map className="w-3 h-3" />
              My Roadmap
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[360px]"
          >
            <div className="flex justify-start mb-3">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2 text-xs bg-white/10 text-white/90 leading-relaxed">
                {welcomeMessages[mode]}
              </div>
            </div>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-3`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-orange-500 text-white rounded-tr-sm"
                      : "bg-white/10 text-white/90 rounded-tl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start mb-3">
                <div className="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 border-t border-white/10 bg-black/20"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholders[mode]}
              className="flex-1 text-xs h-9"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
