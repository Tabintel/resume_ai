import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    console.log("[v0] API route called")

    const formData = await request.formData()
    const file = formData.get("file") as File

    console.log("[v0] File received:", file?.name, "size:", file?.size)

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    console.log("[v0] Buffer created, size:", buffer.byteLength)

    const resumeText = extractTextFromPDF(buffer)
    console.log("[v0] Extracted text length:", resumeText.length)

    if (!resumeText || resumeText.length < 20) {
      return Response.json(
        { error: "Could not extract text from PDF. Please ensure it's a valid PDF file." },
        { status: 400 },
      )
    }

    console.log("[v0] Text sample:", resumeText.substring(0, 150))

    try {
      console.log("[v0] Starting generateText call")

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `You are a professional resume roaster. Generate hilarious, clever jokes about this resume content. Make them funny but respectful. No emojis. Output as one flowing paragraph.

Resume:
${resumeText}`,
          },
        ],
      })

      console.log("[v0] generateText completed, text length:", text.length)

      const sseData = `data: ${JSON.stringify({ type: "text-delta", delta: text })}\n\n`

      return new Response(sseData, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (aiError) {
      console.error("[v0] AI generation error:", aiError instanceof Error ? aiError.message : String(aiError))
      throw aiError
    }
  } catch (error) {
    console.error("[v0] Caught error in route:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "no stack")
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to process resume" },
      { status: 500 },
    )
  }
}

function extractTextFromPDF(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let text = ""

  // Try UTF-8 decode first
  try {
    const decoder = new TextDecoder("utf-8", { fatal: false })
    text = decoder.decode(bytes)
  } catch (e) {
    console.error("[v0] UTF-8 decode failed, falling back to binary extraction")
  }

  // If decode didn't work, extract printable characters
  if (!text || text.length < 10) {
    const chars: string[] = []
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i]
      if ((byte >= 32 && byte <= 126) || [9, 10, 13].includes(byte)) {
        chars.push(String.fromCharCode(byte))
      }
    }
    text = chars.join("")
  }

  // Clean up the extracted text
  const cleaned = text
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 5000)

  console.log("[v0] Extracted text sample:", cleaned.substring(0, 100))
  return cleaned
}
