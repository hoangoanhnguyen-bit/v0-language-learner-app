"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface GenerateTextButtonProps {
  targetLanguage: string
  proficiencyLevel: string
  userId: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
}

export function GenerateTextButton({
  targetLanguage,
  proficiencyLevel,
  userId,
  variant = "default",
  size = "lg",
  children,
}: GenerateTextButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetLanguage,
          proficiencyLevel,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate text")
      }

      const data = await response.json()
      router.push(`/read/${data.textId}`)
      router.refresh()
    } catch (error) {
      console.error("Error generating text:", error)
      alert("Failed to generate text. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const buttonContent = children || (
    <>
      <Sparkles className="mr-2 h-4 w-4" />
      Generate New Text
    </>
  )

  return (
    <Button onClick={handleGenerate} disabled={isGenerating} size={size} variant={variant}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        buttonContent
      )}
    </Button>
  )
}
