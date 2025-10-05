"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
}

interface ComprehensionQuizProps {
  textId: string
  textContent: string
  textTitle: string
  targetLanguage: string
  userId: string
  onClose?: () => void
}

export function ComprehensionQuiz({
  textId,
  textContent,
  textTitle,
  targetLanguage,
  userId,
  onClose,
}: ComprehensionQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const generateQuiz = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textId, textContent, textTitle, targetLanguage }),
      })

      if (!response.ok) throw new Error("Failed to generate quiz")

      const data = await response.json()
      setQuestions(data.questions)
      setSelectedAnswers(new Array(data.questions.length).fill(null))
    } catch (error) {
      console.error("Error generating quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (isSubmitted) return
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    const correctCount = questions.reduce((count, question, index) => {
      return count + (selectedAnswers[index] === question.correctAnswer ? 1 : 0)
    }, 0)
    setScore(correctCount)
    setIsSubmitted(true)

    try {
      await fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textId, userId, score: correctCount, totalQuestions: questions.length }),
      })
    } catch (error) {
      console.error("Error submitting quiz:", error)
    }
  }

  const handleRetry = () => {
    setSelectedAnswers(new Array(questions.length).fill(null))
    setIsSubmitted(false)
    setScore(0)
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comprehension Quiz</CardTitle>
          <CardDescription>Test your understanding of the text</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateQuiz} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprehension Quiz</CardTitle>
        <CardDescription>
          {isSubmitted ? `You scored ${score} out of ${questions.length}` : "Answer all questions and submit"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="font-semibold">{qIndex + 1}.</span>
              <p className="flex-1">{question.question}</p>
              {isSubmitted && (
                <div>
                  {selectedAnswers[qIndex] === question.correctAnswer ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              )}
            </div>
            <RadioGroup
              value={selectedAnswers[qIndex]?.toString()}
              onValueChange={(value) => handleAnswerSelect(qIndex, Number.parseInt(value))}
              disabled={isSubmitted}
            >
              {question.options.map((option, oIndex) => {
                const isSelected = selectedAnswers[qIndex] === oIndex
                const isCorrect = question.correctAnswer === oIndex
                const showCorrect = isSubmitted && isCorrect
                const showIncorrect = isSubmitted && isSelected && !isCorrect

                return (
                  <div
                    key={oIndex}
                    className={`flex items-center space-x-2 rounded-md border p-3 ${
                      showCorrect
                        ? "border-green-600 bg-green-50 dark:bg-green-950"
                        : showIncorrect
                          ? "border-red-600 bg-red-50 dark:bg-red-950"
                          : ""
                    }`}
                  >
                    <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                    <Label htmlFor={`q${qIndex}-o${oIndex}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {showCorrect && <Badge variant="secondary">Correct</Badge>}
                  </div>
                )
              })}
            </RadioGroup>
            {isSubmitted && selectedAnswers[qIndex] !== question.correctAnswer && (
              <p className="text-sm text-muted-foreground pl-6">
                Your answer:{" "}
                {selectedAnswers[qIndex] !== null ? question.options[selectedAnswers[qIndex]] : "Not answered"}
              </p>
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          {!isSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswers.some((answer) => answer === null)}
              className="w-full"
            >
              Submit Quiz
            </Button>
          ) : (
            <>
              <Button onClick={handleRetry} variant="outline" className="flex-1 bg-transparent">
                Try Again
              </Button>
              {onClose && (
                <Button onClick={onClose} className="flex-1">
                  Continue
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
