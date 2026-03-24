'use client'

import Footer from '@/components/layout/footer1'
import Header from '@/components/layout/header1/index'
import StarBackground from '@/components/ui/star-background'
import { MyCardsPage } from '@/features/inventory/components/my-cards-page'

export default function MyCardsRoutePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <Header />
      <main className="relative z-10 pt-28">
        <MyCardsPage />
      </main>
      <Footer />
    </div>
  )
}
