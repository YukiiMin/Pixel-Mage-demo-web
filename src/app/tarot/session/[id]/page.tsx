import Header from "@/components/layout/header";
import StarBackground from "@/components/ui/star-background";
import { TarotSessionPage } from "@/features/tarot/components/tarot-session-page";

export default function TarotSessionRoute() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pb-20 pt-28">
				<TarotSessionPage />
			</main>
		</div>
	);
}
