import type { Metadata } from "next";
import { WalletPageClient } from "@/features/wallet/components/wallet-page-client";

export const metadata: Metadata = {
	title: "Ví PM - PixelMage",
};

export default function WalletPage() {
	return <WalletPageClient />;
}
