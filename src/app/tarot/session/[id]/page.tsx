import { TarotSessionPage } from "@/components/customer/tarot/tarot-session-page";
import Header from "@/components/layout/Header";
import StarBackground from "@/components/ui/star-background";

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
