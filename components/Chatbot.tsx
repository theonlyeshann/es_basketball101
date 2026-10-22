"use client"

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

type Mode = 'skills' | 'roadmap'
type Message = { role: 'user' | 'assistant'; content: string }
const errors: Record<number, string> = {
  400: 'Please shorten your question or start a new conversation.',
  413: 'This conversation is too long. Start a new conversation.',
  429: 'The coach is busy. Please try again in a minute.',
  503: 'The AI coach is currently unavailable. You can still explore every basketball lesson.',
  504: 'The coach took too long. Please try again.',
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('skills')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const request = useRef<AbortController | null>(null)

  useEffect(() => {
    if (isOpen) { dialog.current?.showModal(); inputRef.current?.focus() }
    else dialog.current?.close()
  }, [isOpen])
  useEffect(() => () => { request.current?.abort() }, [])
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight
  }, [messages, isLoading, error])

  function cancel() {
    request.current?.abort()
    request.current = null
    setIsLoading(false)
  }
  function close() {
    cancel()
    setIsOpen(false)
    trigger.current?.focus()
  }
  function reset(nextMode = mode) {
    cancel()
    setMode(nextMode)
    setMessages([])
    setInput('')
    setError(null)
    inputRef.current?.focus()
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!input.trim() || request.current) return
    const user: Message = { role: 'user', content: input.trim() }
    const history = [...messages.slice(-10), user]
    // Keep whole user/assistant pairs and a bounded context. Never send UI errors.
    while (history.reduce((n, m) => n + m.content.length, 0) > 20_000 || new TextEncoder().encode(JSON.stringify({ messages: history, mode })).byteLength > 32_768) history.splice(0, 2)
    const controller = new AbortController()
    request.current = controller
    setIsLoading(true)
    setError(null)
    const timeout = setTimeout(() => controller.abort(), 28_000)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mode }), signal: controller.signal,
      })
      if (!response.ok) throw new Error(errors[response.status] || 'The coach could not answer. Please try again.')
      const data: unknown = await response.json()
      if (!data || typeof data !== 'object' || !('reply' in data) || typeof data.reply !== 'string' || !data.reply.trim() || data.reply.length > 8000) throw new Error('The coach returned an incomplete answer. Please try again.')
      if (request.current !== controller) return
      setMessages([...history, { role: 'assistant', content: data.reply }])
      setInput('')
    } catch (cause) {
      if (request.current !== controller) return
      setError(controller.signal.aborted ? 'The coach took too long. Please try again.' : cause instanceof SyntaxError ? 'The coach returned an incomplete answer. Please try again.' : cause instanceof Error && !(cause instanceof TypeError) ? cause.message : 'Unable to connect. Check your connection and try again.')
    } finally {
      clearTimeout(timeout)
      if (request.current === controller) {
        request.current = null
        setIsLoading(false)
        inputRef.current?.focus()
      }
    }
  }

  return <>
    <button ref={trigger} onClick={() => setIsOpen(true)} aria-label="Open basketball coach chat" aria-haspopup="dialog" aria-expanded={isOpen}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 size-14 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-2xl flex items-center justify-center">
      <MessageCircle aria-hidden="true" className="size-6" />
    </button>
    <dialog ref={dialog} onCancel={event => { event.preventDefault(); close() }} onClose={close} onKeyDown={event => {
      if (event.key !== 'Tab') return
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]'))
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }} aria-labelledby="coach-title" className="coach-dialog text-white bg-neutral-950 border border-white/20 rounded-2xl p-0 shadow-2xl">
      <div className="flex flex-col h-full min-h-0">
        <header className="flex items-center justify-between pl-4 pr-2 py-2 border-b border-white/20 shrink-0">
          <h2 id="coach-title" className="font-bold text-base">Basketball 101 Coach</h2>
          <button onClick={close} aria-label="Close basketball coach chat" className="size-11 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/10"><X aria-hidden="true" className="size-5" /></button>
        </header>
        <div role="group" aria-label="Coaching mode" className="flex gap-2 p-2 shrink-0">
          {(['skills', 'roadmap'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => { if (mode !== value) reset(value) }} className={`flex-1 min-h-11 px-2 rounded-lg text-sm font-semibold ${mode === value ? 'bg-orange-700 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>{value === 'skills' ? 'Skills Q&A' : 'My Roadmap'}</button>)}
        </div>
        <div ref={scroll} role="log" aria-label="Conversation" aria-live="polite" aria-busy={isLoading} tabIndex={0} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 text-sm leading-relaxed">
          <p className="bg-white/10 rounded-xl p-3">{mode === 'skills' ? "Ask me about dribbling, shooting, passing, fitness, or basketball IQ." : "Tell me your experience level, position, and goals. Let's build a practice plan."}</p>
          {messages.map((message, i) => <p key={i} className={`rounded-xl p-3 whitespace-pre-wrap break-words ${message.role === 'user' ? 'bg-orange-800 ml-6' : 'bg-white/10 mr-4'}`}><span className="sr-only">{message.role === 'user' ? 'You: ' : 'Coach: '}</span>{message.content}</p>)}
          {isLoading && <p className="rounded-xl p-3 bg-orange-800 ml-6 break-words">{input.trim()}</p>}
        </div>
        <div className="px-4 shrink-0">
          <p role="status" className="text-sm text-orange-200">{isLoading ? 'Coach is thinking…' : ''}</p>
          {error && <p role="alert" className="text-sm text-orange-200 py-2">{error}</p>}
        </div>
        <form onSubmit={submit} className="p-3 border-t border-white/20 shrink-0">
          <label htmlFor="coach-question" className="block text-sm mb-2">Your basketball question</label>
          <div className="flex gap-2">
            <input ref={inputRef} id="coach-question" value={input} onChange={e => setInput(e.target.value)} maxLength={2000} readOnly={isLoading} autoComplete="off" placeholder={mode === 'skills' ? 'How can I improve my shot?' : 'What should I practice first?'} className="min-w-0 w-full h-11 rounded-lg bg-white/10 border border-white/30 px-3 text-base placeholder:text-neutral-400" />
            <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send question" className="size-11 shrink-0 rounded-lg bg-orange-700 hover:bg-orange-800 disabled:opacity-50 flex items-center justify-center"><Send aria-hidden="true" className="size-5" /></button>
          </div>
          <div className="flex justify-between items-center gap-2 mt-2 text-xs text-neutral-300">
            <button type="button" onClick={() => reset()} className="underline min-h-11">New conversation</button>
            {isLoading ? <button type="button" onClick={() => { cancel(); setError('Request stopped. Your question is ready to send again.') }} className="underline min-h-11">Stop response</button> : <span>{input.length}/2,000</span>}
          </div>
          <p className="text-xs text-neutral-300">AI can make mistakes. Avoid sharing personal information.</p>
        </form>
      </div>
    </dialog>
  </>
}
