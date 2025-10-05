import { createClient } from "@/lib/supabase/server"

export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalDays: number
  lastActivityDate: string | null
}

export async function calculateStreak(userId: string): Promise<StreakData> {
  const supabase = await createClient()

  // Get all unique activity dates for the user, ordered by date descending
  const { data: activities, error } = await supabase
    .from("study_activities")
    .select("activity_date")
    .eq("user_id", userId)
    .order("activity_date", { ascending: false })

  if (error || !activities || activities.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      lastActivityDate: null,
    }
  }

  // Get unique dates
  const uniqueDates = Array.from(new Set(activities.map((a) => a.activity_date))).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  )

  const totalDays = uniqueDates.length
  const lastActivityDate = uniqueDates[0]

  // Calculate current streak
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if the last activity was today or yesterday
  const lastDate = new Date(lastActivityDate)
  lastDate.setHours(0, 0, 0, 0)

  if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
    currentStreak = 1
    let checkDate = new Date(lastDate)

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i])
      prevDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(checkDate)
      expectedDate.setDate(expectedDate.getDate() - 1)

      if (prevDate.getTime() === expectedDate.getTime()) {
        currentStreak++
        checkDate = prevDate
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i])
    const nextDate = new Date(uniqueDates[i + 1])

    const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDiff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    currentStreak,
    longestStreak,
    totalDays,
    lastActivityDate,
  }
}

export async function recordStudyActivity(
  userId: string,
  activityType: "read" | "quiz_completed" | "word_lookup",
  textId?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const today = new Date().toISOString().split("T")[0]

  // Try to insert or update activity for today
  const { error } = await supabase.from("study_activities").upsert(
    {
      user_id: userId,
      activity_type: activityType,
      activity_date: today,
      text_id: textId || null,
    },
    {
      onConflict: "user_id,activity_date",
    },
  )

  if (error) {
    console.error("Error recording study activity:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
