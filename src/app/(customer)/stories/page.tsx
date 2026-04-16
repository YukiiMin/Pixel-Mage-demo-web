import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import StarBackground from "@/components/ui/star-background";
import { StoriesPageClient } from "@/features/collection";

export default function StoriesPage() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pb-20 pt-28">
				<StoriesPageClient />
			</main>
			<Footer />
		</div>
	);
}
