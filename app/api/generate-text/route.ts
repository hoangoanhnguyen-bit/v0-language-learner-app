import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

const LANGUAGE_NAMES: Record<string, string> = {
  chinese: "Chinese (Mandarin)",
  french: "French",
  japanese: "Japanese",
  vietnamese: "Vietnamese",
}

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  beginner: "simple vocabulary and short sentences",
  intermediate: "moderate vocabulary and varied sentence structures",
  advanced: "sophisticated vocabulary and complex sentence structures",
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting text generation request")
    const { targetLanguage, proficiencyLevel, userId } = await request.json()
    console.log("[v0] Request params:", { targetLanguage, proficiencyLevel, userId })

    if (!targetLanguage || !proficiencyLevel || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated, generating text with AI")

    // Generate text using AI
    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage
    const levelDesc = LEVEL_DESCRIPTIONS[proficiencyLevel] || proficiencyLevel

    const wordCountRange =
      proficiencyLevel === "beginner" ? "100-150" : proficiencyLevel === "intermediate" ? "150-250" : "200-300"

    const prompt = `Write a short literary story in ${languageName} suitable for a ${proficiencyLevel} language learner. 

Requirements:
- Use ${levelDesc}
- Length: approximately ${wordCountRange} words
- Include an engaging narrative with a clear beginning, middle, and end
- Use natural, conversational language appropriate for the level
- Make it culturally relevant and interesting

Provide the response in this exact JSON format:
{
  "title": "Story title in ${languageName}",
  "content": "The full story text in ${languageName}"
}`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1000,
      temperature: 0.7,
    })

    console.log("[v0] AI generation successful, parsing response")

    // Parse the AI response
    let parsedResponse
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.log("[v0] JSON parsing failed, using fallback format")
      // Fallback: use the entire response as content
      parsedResponse = {
        title: `${languageName} Story`,
        content: text,
      }
    }

    // Count words
    const wordCount = parsedResponse.content.split(/\s+/).length
    console.log("[v0] Text parsed, word count:", wordCount)

    const { data: newText, error: insertError } = await supabase
      .from("texts")
      .insert({
        title: parsedResponse.title,
        content: parsedResponse.content,
        language: targetLanguage,
        level: proficiencyLevel,
        word_count: wordCount,
        source: "ai",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error inserting text:", insertError)
      throw insertError
    }

    console.log("[v0] Text inserted, creating user_texts entry")

    const { error: userTextError } = await supabase.from("user_texts").insert({
      user_id: userId,
      text_id: newText.id,
      status: "pending",
    })

    if (userTextError) {
      console.error("[v0] Error creating user_texts entry:", userTextError)
      throw userTextError
    }

    console.log("[v0] Text generation complete, returning text ID:", newText.id)
    return NextResponse.json({ textId: newText.id })
  } catch (error) {
    console.error("[v0] Error generating text:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate text"
    return NextResponse.json(
      {
        error: errorMessage,
        details:
          "If you're seeing a credit card error, please ensure your Vercel account has a valid payment method added.",
      },
      { status: 500 },
    )
  }
}
