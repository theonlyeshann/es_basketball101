import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, mode } = await req.json()

  const systemPrompt =
    mode === "roadmap"
      ? `You are an expert basketball coach and trainer. Your job is to create detailed, personalized roadmaps for players who want to improve. 
         When a user tells you their current skill level, position, age, or goals, build them a structured improvement plan.
         Format your roadmap with clear phases (e.g., Phase 1: Foundation, Phase 2: Development, Phase 3: Advanced), 
         specific drills, weekly practice schedules, and measurable milestones.
         Be encouraging, practical, and specific. Focus on the fundamentals: fitness, dribbling, passing, shooting, and basketball IQ.`
      : `You are a knowledgeable basketball coach and skills expert for Basketball 101.
         You answer questions about basketball skills, techniques, drills, and fundamentals.
         Keep answers focused on: fitness training, ball handling/dribbling, passing, shooting mechanics, and basketball IQ.
         Be concise, practical, and encouraging. Use real examples from NBA players when relevant.
         If asked something unrelated to basketball, kindly redirect the conversation back to basketball skills.`

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: systemPrompt,
    messages,
  })

  return result.toTextStreamResponse()
}
