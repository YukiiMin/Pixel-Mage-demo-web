import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import StarBackground from '@/components/ui/star-background'
import { TarotSetupPage } from '@/features/tarot/components/tarot-setup-page'

export default function TarotPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <Header />
      <main className="relative z-10 pb-20 pt-28">
        <TarotSetupPage />
      </main>
      <Footer />
    </div>
  )
}
