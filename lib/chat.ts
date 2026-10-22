import { z } from 'zod'

export const MAX_MESSAGE_LENGTH = 2000
export const MAX_MESSAGES = 11
const MAX_BODY_BYTES = 32_768
const schema = z.object({
  mode: z.enum(['skills', 'roadmap']),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(8000),
  }).strict().refine(m => m.role !== 'user' || m.content.length <= MAX_MESSAGE_LENGTH)).min(1).max(MAX_MESSAGES),
}).strict().refine(({ messages }) => messages.every((m, i) => m.role === (i % 2 ? 'assistant' : 'user')) && messages.length % 2 === 1)
  .refine(({ messages }) => messages.reduce((n, m) => n + m.content.length, 0) <= 20_000)

export type ChatInput = z.infer<typeof schema>
type Config = { enabled?: string; apiKey?: string; model?: string }
type Generate = (input: ChatInput, config: { apiKey: string; model: string }, signal: AbortSignal) => Promise<string>

const json = (body: object, status = 200, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', ...headers },
})

// Instance-wide ceiling; deliberately does not trust client-supplied IP headers.
// Multi-instance deployments still need a shared edge quota and provider budget.
export function createLimiter(now = Date.now, limit = 10, windowMs = 60_000) {
  let start = now()
  let count = 0
  return () => {
    if (now() - start >= windowMs) { start = now(); count = 0 }
    return ++count <= limit
  }
}

async function readBody(req: Request) {
  if (Number(req.headers.get('content-length')) > MAX_BODY_BYTES) throw new RangeError()
  const reader = req.body?.getReader()
  if (!reader) throw new SyntaxError()
  let bytes = 0
  let text = ''
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_BODY_BYTES) { await reader.cancel(); throw new RangeError() }
      text += decoder.decode(value, { stream: true })
    }
    return JSON.parse(text + decoder.decode()) as unknown
  } finally { reader.releaseLock() }
}

export function createChatHandler(generate: Generate, options: {
  config: () => Config
  allow?: () => boolean
  timeoutMs?: number
}) {
  const allow = options.allow ?? createLimiter()
  return async (req: Request) => {
    const origin = req.headers.get('origin')
    if (origin && origin !== new URL(req.url).origin) return json({ error: 'Cross-origin requests are not allowed.' }, 403)
    if (req.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return json({ error: 'Send JSON.' }, 415)
    let raw: unknown
    try { raw = await readBody(req) }
    catch (error) { return json({ error: error instanceof RangeError ? 'Request is too large.' : 'Invalid JSON.' }, error instanceof RangeError ? 413 : 400) }
    const parsed = schema.safeParse(raw)
    if (!parsed.success) return json({ error: 'Use alternating user/assistant messages, ending with a user question. Keep each message under 2,000 characters and history within 11 messages.' }, 400)
    const config = options.config()
    if (config.enabled !== 'true' || !config.apiKey?.trim() || !config.model?.trim()) return json({ error: 'The AI coach is currently unavailable. You can still explore every basketball lesson.' }, 503)
    if (!allow()) return json({ error: 'The coach is busy. Please try again in a minute.' }, 429, { 'Retry-After': '60' })
    const controller = new AbortController()
    const abort = () => controller.abort()
    req.signal.addEventListener('abort', abort, { once: true })
    if (req.signal.aborted) abort()
    const timer = setTimeout(abort, options.timeoutMs ?? 25_000)
    let onAbort: () => void = () => {}
    try {
      if (controller.signal.aborted) return json({ error: 'Request cancelled.' }, 408)
      const cancelled = new Promise<never>((_, reject) => {
        onAbort = () => reject(new Error('Request cancelled'))
        controller.signal.addEventListener('abort', onAbort, { once: true })
        if (controller.signal.aborted) onAbort()
      })
      const reply = await Promise.race([generate(parsed.data, { apiKey: config.apiKey, model: config.model }, controller.signal), cancelled])
      if (!reply.trim() || reply.length > 8000) return json({ error: 'The coach could not answer. Please rephrase your question.' }, 502)
      return json({ reply })
    } catch {
      // Provider errors can contain credentials, URLs and prompts. Never echo/log them.
      return json({ error: controller.signal.aborted ? 'The coach took too long. Please try again.' : 'The coach could not answer. Please try again.' }, controller.signal.aborted ? 504 : 502)
    } finally {
      clearTimeout(timer)
      req.signal.removeEventListener('abort', abort)
      controller.signal.removeEventListener('abort', onAbort)
    }
  }
}
