import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { CardFrameworkPageClient } from "@/features/card-gallery/components/card-framework-page";

export default function CardFrameworkPage() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pt-28">
				<CardFrameworkPageClient />
			</main>
			<Footer />
		</div>
	);
}
