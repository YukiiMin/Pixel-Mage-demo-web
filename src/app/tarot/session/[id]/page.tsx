import Header from '@/components/layout/header1/index'
import StarBackground from '@/components/ui/star-background'
import { TarotSessionPage } from '@/features/tarot/components/tarot-session-page'

export default async function TarotSessionRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sessionId = parseInt(id, 10) || 0

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <Header />
      <main className="relative z-10 pb-20 pt-28">
        <TarotSessionPage sessionId={sessionId} />
      </main>
    </div>
  )
}
