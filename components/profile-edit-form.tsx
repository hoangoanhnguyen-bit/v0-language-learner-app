"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "lucide-react"

const NATIVE_LANGUAGES = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "other", label: "Other" },
]

const TARGET_LANGUAGES = [
  { value: "chinese", label: "Chinese (Mandarin)" },
  { value: "french", label: "French" },
  { value: "japanese", label: "Japanese" },
  { value: "vietnamese", label: "Vietnamese" },
]

const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner", description: "Just starting out" },
  { value: "intermediate", label: "Intermediate", description: "Can read simple texts" },
  { value: "advanced", label: "Advanced", description: "Comfortable with complex texts" },
]

interface ProfileEditFormProps {
  profile: {
    id: string
    native_language: string
    target_language: string
    proficiency_level: string
  }
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [nativeLanguage, setNativeLanguage] = useState<string>(profile.native_language)
  const [targetLanguage, setTargetLanguage] = useState<string>(profile.target_language)
  const [proficiencyLevel, setProficiencyLevel] = useState<string>(profile.proficiency_level)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (!nativeLanguage || !targetLanguage || !proficiencyLevel) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          native_language: nativeLanguage,
          target_language: targetLanguage,
          proficiency_level: proficiencyLevel,
        })
        .eq("id", profile.id)

      if (updateError) throw updateError

      setSuccess(true)
      router.refresh()

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/library")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <User className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Edit your profile</CardTitle>
        <CardDescription className="text-center">Update your language learning preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="native-language">Your native language</Label>
              <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
                <SelectTrigger id="native-language">
                  <SelectValue placeholder="Select your native language" />
                </SelectTrigger>
                <SelectContent>
                  {NATIVE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target-language">Language you want to learn</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="target-language">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Your proficiency level</Label>
              <div className="grid gap-3">
                {PROFICIENCY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setProficiencyLevel(level.value)}
                    className={`flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-colors ${
                      proficiencyLevel === level.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold">{level.label}</div>
                    <div className="text-sm text-muted-foreground">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">Profile updated successfully!</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving changes..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
