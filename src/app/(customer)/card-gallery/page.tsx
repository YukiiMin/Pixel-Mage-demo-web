import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { CardGalleryPageClient } from "@/features/card-gallery";

export default function CardGalleryPage() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pt-28">
				<CardGalleryPageClient />
			</main>
			<Footer />
		</div>
	);
}
