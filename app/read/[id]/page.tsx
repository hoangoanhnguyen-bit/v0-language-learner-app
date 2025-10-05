import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReadingView } from "@/components/reading-view"
import { recordStudyActivity } from "@/lib/streak-utils"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ReadPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: text, error } = await supabase.from("texts").select("*").eq("id", id).single()

  if (error || !text) {
    redirect("/library")
  }

  const { data: userText } = await supabase
    .from("user_texts")
    .select("*")
    .eq("user_id", user.id)
    .eq("text_id", id)
    .single()

  if (!userText) {
    redirect("/library")
  }

  await recordStudyActivity(user.id, "read", text.id)

  return (
    <div className="min-h-svh bg-background">
      <ReadingView text={text} userId={user.id} />
    </div>
  )
}
