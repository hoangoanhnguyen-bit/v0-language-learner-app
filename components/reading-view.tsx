"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Volume2, Loader2, Brain } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ComprehensionQuiz } from "@/components/comprehension-quiz"

interface Text {
  id: string
  title: string
  content: string
  language: string
  level: string
  word_count: number
}

interface ReadingViewProps {
  text: Text
  userId: string
}

export function ReadingView({ text, userId }: ReadingViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [wordLookup, setWordLookup] = useState<WordLookup | null>(null)
  const [isLoadingLookup, setIsLoadingLookup] = useState(false)
  const [showLookupDialog, setShowLookupDialog] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(text.content)

      // Set language based on target language
      const languageCodes: Record<string, string> = {
        chinese: "zh-CN",
        french: "fr-FR",
        japanese: "ja-JP",
        vietnamese: "vi-VN",
      }
      utterance.lang = languageCodes[text.language] || "en-US"
      utterance.rate = 0.9

      utterance.onend = () => {
        setIsPlaying(false)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }
  }

  const handleWordClick = async (word: string) => {
    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[.,!?;:"""''()[\]{}]/g, "").trim()
    if (!cleanWord) return

    setSelectedWord(cleanWord)
    setShowLookupDialog(true)
    setIsLoadingLookup(true)
    setWordLookup(null)

    try {
      const response = await fetch("/api/lookup-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: cleanWord,
          targetLanguage: text.language,
          nativeLanguage: "english",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to lookup word")
      }

      const data = await response.json()
      setWordLookup(data)
    } catch (error) {
      console.error("Error looking up word:", error)
      setWordLookup({
        word: cleanWord,
        pronunciation: "",
        translation: "Failed to load definition",
        definition: "Please try again",
        partOfSpeech: "",
        example: "",
      })
    } finally {
      setIsLoadingLookup(false)
    }
  }

  const handlePronounceWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    const languageCodes: Record<string, string> = {
      chinese: "zh-CN",
      french: "fr-FR",
      japanese: "ja-JP",
      vietnamese: "vi-VN",
    }
    utterance.lang = languageCodes[text.language] || "en-US"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  // Split content into clickable words
  const renderContent = () => {
    const words = text.content.split(/(\s+)/)
    return words.map((word, index) => {
      if (word.trim() === "") return word
      return (
        <span
          key={index}
          onClick={() => handleWordClick(word.trim())}
          className="cursor-pointer hover:bg-primary/10 rounded px-0.5 transition-colors"
        >
          {word}
        </span>
      )
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Audio Controls */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button onClick={handlePlayPause} size="lg" variant={isPlaying ? "secondary" : "default"}>
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Listen
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Audio narration</span>
            </div>
          </div>
          <Button onClick={() => setShowQuiz(true)} variant="outline">
            <Brain className="h-4 w-4" />
            Take Quiz
          </Button>
        </CardContent>
      </Card>

      {/* Text Content */}
      <Card>
        <CardContent className="p-8">
          <div
            className="prose prose-lg max-w-none leading-relaxed"
            style={{ fontSize: "1.125rem", lineHeight: "1.75" }}
          >
            {renderContent()}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>{text.word_count} words</span>
        <span>·</span>
        <span className="capitalize">{text.level}</span>
        <span>·</span>
        <span>Click any word for definition</span>
      </div>

      {/* Word Lookup Dialog */}
      <Dialog open={showLookupDialog} onOpenChange={setShowLookupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Word Lookup</DialogTitle>
          </DialogHeader>
          {isLoadingLookup ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : wordLookup ? (
            <div className="space-y-4">
              {/* Word and Pronunciation */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold">{wordLookup.word}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePronounceWord(wordLookup.word)}
                    className="h-8 w-8"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                {wordLookup.pronunciation && (
                  <p className="text-sm text-muted-foreground">{wordLookup.pronunciation}</p>
                )}
                {wordLookup.partOfSpeech && (
                  <p className="text-xs text-muted-foreground italic">{wordLookup.partOfSpeech}</p>
                )}
              </div>

              {/* Translation */}
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Translation</h4>
                <p className="text-lg font-medium">{wordLookup.translation}</p>
              </div>

              {/* Definition */}
              {wordLookup.definition && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground">Definition</h4>
                  <p className="text-sm">{wordLookup.definition}</p>
                </div>
              )}

              {/* Example */}
              {wordLookup.example && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground">Example</h4>
                  <p className="text-sm italic">{wordLookup.example}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comprehension Quiz</DialogTitle>
          </DialogHeader>
          <ComprehensionQuiz
            textId={text.id}
            textContent={text.content}
            textTitle={text.title}
            targetLanguage={text.language}
            userId={userId}
            onClose={() => setShowQuiz(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface WordLookup {
  word: string
  pronunciation: string
  translation: string
  definition: string
  partOfSpeech: string
  example: string
}
