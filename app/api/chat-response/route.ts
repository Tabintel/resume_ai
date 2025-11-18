import { streamText } from "ai"

export async function POST(request: Request) {
  try {
    const { userMessage, previousJokes, resumeText } = await request.json()

    if (!userMessage || !previousJokes) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = streamText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a witty AI comedian helping to roast resumes. Here are the jokes you previously made:

${previousJokes.map((joke: string, i: number) => `${i + 1}. ${joke}`).join("\n")}

The user just said: "${userMessage}"

Respond in a fun, engaging way. If they ask for more jokes, generate 2-3 more in the same style. Keep responses concise (1-2 sentences max). Do NOT use emojis or multiple separate messages - provide one cohesive response.`,
      system:
        "You are a hilarious AI comedian. Keep your responses short, witty, and entertaining. Stream your response word by word for real-time effect. Never use emojis. Never send multiple separate messages - send one complete response.",
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Error in chat streaming:", error)
    return Response.json(
      {
        error: "Failed to generate response",
      },
      { status: 500 },
    )
  }
}
