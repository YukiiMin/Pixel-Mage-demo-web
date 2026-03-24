import { Button } from '@/components/ui/button'
import { API_ENDPOINTS, apiRequest } from '@/lib/api-config'
import { useTarotSessionStore } from '@/stores/use-tarot-session-store'
import type { ReadingCard } from '@/types/tarot'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface CardDrawAreaProps {
  sessionId: number
  onConfirm: () => void
}

export function CardDrawArea({ sessionId, onConfirm }: CardDrawAreaProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setReadingCards = useTarotSessionStore((state) => state.setReadingCards)

  const handleDraw = async () => {
    try {
      setIsDrawing(true)
      setError(null)
      const response = await apiRequest<{ drawnCards: ReadingCard[] }>(
        API_ENDPOINTS.tarotReadings.draw(sessionId),
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      )
      setReadingCards(response.data.drawnCards)
      onConfirm()
    } catch (err: any) {
      console.error('Failed to draw cards:', err)
      setError('Không thể rút bài. Vui lòng thử lại.')
    } finally {
      setIsDrawing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 text-center"
      data-testid="card-draw-area"
    >
      <div className="space-y-4">
        <h2 className="font-(--font-heading) text-2xl  text-foreground">
          Tập trung vào câu hỏi của bạn
        </h2>
        <p className="text-secondary/80">
          Nhấn nút bên dưới để Vũ Trụ chọn cho bạn những lá bài phù hợp nhất
        </p>
      </div>

      <div className="flex min-h-50 flex-col items-center justify-center space-y-6">
        {error && <p className="text-destructive font-medium">{error}</p>}
        <Button
          size="lg"
          onClick={handleDraw}
          disabled={isDrawing}
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-50"
          data-testid="confirm-draw-button"
        >
          {isDrawing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang Rút Bài...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Cho phép Vũ Trụ Chọn Bài
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
