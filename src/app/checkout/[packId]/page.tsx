import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import StarBackground from "@/components/ui/star-background";
import { CheckoutPage } from "@/features/checkout/components/checkout-page";

interface Props {
	params: Promise<{ packId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { packId } = await params;
	return {
		title: `Thanh toán Pack #${packId} · PixelMage`,
		description: "Thanh toán pack thẻ bài PixelMage qua SEPay VietQR",
		robots: "noindex, nofollow", // Checkout pages should not be indexed
	};
}

export default async function CheckoutRoute({ params }: Props) {
	const { packId } = await params;
	const packIdNum = Number(packId);

	if (!packId || Number.isNaN(packIdNum) || packIdNum <= 0) {
		return (
			<div className="relative min-h-screen overflow-x-hidden">
				<StarBackground />
				<main className="relative z-10 flex min-h-screen items-center justify-center px-4">
					<p className="text-muted-foreground">Pack không hợp lệ.</p>
				</main>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<main className="relative z-10 pt-10">
				{/* useSearchParams() inside CheckoutPage needs a Suspense boundary */}
				<Suspense
					fallback={
						<div className="flex min-h-[60vh] items-center justify-center">
							<Loader2 className="h-10 w-10 animate-spin text-primary" />
						</div>
					}
				>
					<CheckoutPage packId={packIdNum} />
				</Suspense>
			</main>
		</div>
	);
}
