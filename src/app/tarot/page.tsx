import { TarotSetupPage } from "@/components/customer/tarot/tarot-setup-page";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import StarBackground from "@/components/ui/star-background";

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
	);
}
