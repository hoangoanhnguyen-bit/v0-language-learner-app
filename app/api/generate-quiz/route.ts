import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { textId, textContent, textTitle, targetLanguage } = await request.json()

    if (!textId || !textContent || !targetLanguage) {
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

    const { data: userText } = await supabase
      .from("user_texts")
      .select("*")
      .eq("user_id", user.id)
      .eq("text_id", textId)
      .maybeSingle()

    if (!userText) {
      return NextResponse.json({ error: "Text not found or access denied" }, { status: 404 })
    }

    const prompt = `Based on the following text titled "${textTitle}", generate 5 multiple-choice comprehension questions.

Text:
${textContent}

Requirements:
- Create 5 questions that test understanding of the text
- Each question should have 4 answer options (A, B, C, D)
- Only one answer should be correct
- Questions should test different aspects: main idea, details, inference, vocabulary in context
- Write questions in English for clarity
- Make incorrect options plausible but clearly wrong

Provide the response in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

The correctAnswer should be the index (0-3) of the correct option in the options array.`

    const { text: aiResponse } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Parse the AI response
    let parsedResponse
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Failed to parse quiz questions",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
