import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { ShopPage } from "@/features/marketplace";

export default function MarketplaceRoutePage() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pt-28">
				<ShopPage />
			</main>
			<Footer />
		</div>
	);
}
