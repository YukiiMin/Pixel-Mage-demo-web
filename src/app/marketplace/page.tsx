import { MarketplacePage } from "@/components/customer/marketplace/marketplace-page";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import StarBackground from "@/components/ui/star-background";

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
	);
}
