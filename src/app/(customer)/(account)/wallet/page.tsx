import Header from "@/components/layout/header/index";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Wallet } from "lucide-react";

export const metadata = {
	title: "Ví PixelMage — Sắp ra mắt",
};

export default function WalletRoute() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<Header />
			<main className="relative z-10 pt-20">
				<ComingSoon
					featureName="Ví PixelMage"
					description="Hệ thống ví điểm thưởng và đổi voucher đang được hoàn thiện để mang đến trải nghiệm tốt nhất."
					eta="Dự kiến trong tương lai gần"
					icon={<Wallet className="h-10 w-10 text-primary" />}
					backHref="/dashboard"
					backLabel="Về Dashboard"
				/>
			</main>
		</div>
	);
}
