import { Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  totalDays: number
}

export function StreakDisplay({ currentStreak, longestStreak, totalDays }: StreakDisplayProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{currentStreak}</span>
                <span className="text-sm text-muted-foreground">day streak</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Keep it up! Study daily to maintain your streak</p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest</div>
            </div>
            <div className="border-l pl-4">
              <div className="text-2xl font-semibold">{totalDays}</div>
              <div className="text-xs text-muted-foreground">Total Days</div>
            </div>
          </div>
        </div>
        {currentStreak >= 7 && (
          <div className="mt-4 flex gap-2">
            {currentStreak >= 7 && <Badge variant="secondary">🔥 Week Warrior</Badge>}
            {currentStreak >= 30 && <Badge variant="secondary">⭐ Month Master</Badge>}
            {currentStreak >= 100 && <Badge variant="secondary">💎 Century Champion</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
