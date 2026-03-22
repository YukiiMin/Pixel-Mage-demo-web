"use client";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import StarBackground from "@/components/ui/star-background";
import { useAuthGuard } from "@/features/auth/hooks/use-auth-guard";
import { MyCardsPage } from "@/features/inventory/components/my-cards-page";

export default function MyCardsRoutePage() {
	useAuthGuard("authenticated-only", "/login");

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
