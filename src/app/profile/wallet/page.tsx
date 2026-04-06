import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { WalletPageClient } from "@/features/wallet/components/wallet-page-client";

export default function WalletRoute() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pb-20 pt-28">
				<WalletPageClient />
			</main>
			<Footer />
		</div>
	);
}
