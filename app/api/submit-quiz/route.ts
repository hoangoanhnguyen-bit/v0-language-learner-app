import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { recordStudyActivity } from "@/lib/streak-utils"

export async function POST(request: NextRequest) {
  try {
    const { textId, userId, score, totalQuestions } = await request.json()

    if (!textId || !userId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error: updateError } = await supabase
      .from("user_texts")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("text_id", textId)

    if (updateError) {
      console.error("Error updating user_texts:", updateError)
    }

    // Record quiz completion as a study activity
    await recordStudyActivity(user.id, "quiz_completed", textId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
