import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { WalletPageClient } from "@/features/wallet";

export default function WalletRoute() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<main className="relative z-10 pb-20">
				<WalletPageClient />
			</main>
		</div>
	);
}
