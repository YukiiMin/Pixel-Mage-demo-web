"use client";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { MyCardsPage } from "@/features/inventory";

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
