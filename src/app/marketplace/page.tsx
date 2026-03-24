import Footer from '@/components/layout/footer1'
import Header from '@/components/layout/header1/index'
import StarBackground from '@/components/ui/star-background'
import { MarketplacePage } from '@/features/marketplace/components/marketplace-page'

export default function MarketplaceRoutePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <Header />
      <main className="relative z-10 pt-28">
        <MarketplacePage />
      </main>
      <Footer />
    </div>
  )
}
