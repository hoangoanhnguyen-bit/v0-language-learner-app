import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileSetupForm } from "@/components/profile-setup-form"

export default async function SetupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (profile) {
    redirect("/library")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <ProfileSetupForm userId={user.id} />
      </div>
    </div>
  )
}
