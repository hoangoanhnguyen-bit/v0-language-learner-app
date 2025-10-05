import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Sparkles, Settings, Plus, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { calculateStreak } from "@/lib/streak-utils"
import { StreakDisplay } from "@/components/streak-display"
import { GenerateTextButton } from "@/components/generate-text-button"

export default async function LibraryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!profile) {
    redirect("/setup")
  }

  const { data: currentUserText } = await supabase
    .from("user_texts")
    .select("*, texts(*)")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  let textToRead = currentUserText?.texts

  if (!textToRead) {
    // Find a text that matches user's language and level that they haven't seen
    const { data: seenTextIds } = await supabase.from("user_texts").select("text_id").eq("user_id", user.id)

    const seenIds = seenTextIds?.map((ut) => ut.text_id) || []

    // Try to find an existing text they haven't seen
    const { data: availableText } = await supabase
      .from("texts")
      .select("*")
      .eq("language", profile.target_language)
      .eq("level", profile.proficiency_level)
      .not("id", "in", `(${seenIds.length > 0 ? seenIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
      .limit(1)
      .maybeSingle()

    if (availableText) {
      // Assign this text to the user
      await supabase.from("user_texts").insert({
        user_id: user.id,
        text_id: availableText.id,
        status: "pending",
      })
      textToRead = availableText
    }
  }

  const { count: completedCount } = await supabase
    .from("user_texts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")

  const streakData = await calculateStreak(user.id)

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Today's Reading</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Learning <span className="font-medium text-foreground capitalize">{profile.target_language}</span>
            </div>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <StreakDisplay
            currentStreak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            totalDays={streakData.totalDays}
          />
        </div>

        {completedCount !== null && completedCount > 0 && (
          <Card className="mb-6 bg-muted/50">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  {completedCount} {completedCount === 1 ? "text" : "texts"} completed
                </span>
              </div>
              <GenerateTextButton
                targetLanguage={profile.target_language}
                proficiencyLevel={profile.proficiency_level}
                userId={user.id}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Generate New
              </GenerateTextButton>
            </CardContent>
          </Card>
        )}

        {textToRead ? (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{textToRead.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {textToRead.word_count} words · {textToRead.level}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed line-clamp-4">{textToRead.content}</p>
              <Link href={`/read/${textToRead.id}`}>
                <Button size="lg" className="w-full">
                  Start Reading
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Ready for a new text?</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Generate a new AI-powered text tailored to your level and start learning.
              </p>
              <GenerateTextButton
                targetLanguage={profile.target_language}
                proficiencyLevel={profile.proficiency_level}
                userId={user.id}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
