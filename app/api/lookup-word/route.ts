import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

const LANGUAGE_NAMES: Record<string, string> = {
  chinese: "Chinese (Mandarin)",
  french: "French",
  japanese: "Japanese",
  vietnamese: "Vietnamese",
}

export async function POST(request: NextRequest) {
  try {
    const { word, targetLanguage, nativeLanguage } = await request.json()

    if (!word || !targetLanguage || !nativeLanguage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage
    const nativeLangName = nativeLanguage.charAt(0).toUpperCase() + nativeLanguage.slice(1)

    const prompt = `Provide a dictionary entry for the ${targetLangName} word: "${word}"

Please provide the response in this exact JSON format:
{
  "word": "${word}",
  "pronunciation": "romanization or IPA pronunciation",
  "translation": "translation to ${nativeLangName}",
  "definition": "brief definition in ${nativeLangName} (1-2 sentences)",
  "partOfSpeech": "noun/verb/adjective/etc",
  "example": "a simple example sentence in ${targetLangName} using this word"
}

Important:
- For Chinese, provide pinyin with tone marks
- For Japanese, provide romaji
- For Vietnamese, the word itself is already romanized
- Keep the definition concise and clear
- Make the example sentence simple and natural`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Parse the AI response
    let parsedResponse
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Failed to parse word lookup",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error("Error looking up word:", error)
    return NextResponse.json({ error: "Failed to lookup word" }, { status: 500 })
  }
}
