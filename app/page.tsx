import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Languages, Headphones, Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Master Languages Through Literary Immersion
          </h1>
          <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
            Read AI-curated texts in Chinese, French, Japanese, or Vietnamese. Listen, learn vocabulary, and test your
            comprehension.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Everything you need to learn</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Literary Texts</h3>
              <p className="text-sm text-muted-foreground">AI-generated stories tailored to your level</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Audio Narration</h3>
              <p className="text-sm text-muted-foreground">Listen to native pronunciation</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Word Lookup</h3>
              <p className="text-sm text-muted-foreground">Click any word for instant definitions</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Comprehension Quiz</h3>
              <p className="text-sm text-muted-foreground">Test your understanding after reading</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
