import { MyCardsPage } from "@/components/customer/my-cards/my-cards-page";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import StarBackground from "@/components/ui/star-background";

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
	);
}
