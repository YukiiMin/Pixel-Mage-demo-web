import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header/index'
import StarBackground from '@/components/ui/star-background'
import { OrdersPage } from '@/features/orders/components/orders-page'

export default function OrdersRoute() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <Header />
      <main className="relative z-10 pb-20 pt-28">
        <OrdersPage />
      </main>
      <Footer />
    </div>
  )
}
