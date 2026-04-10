import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { OrdersPage } from "@/features/orders";

export default function OrdersRoute() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<main className="relative z-10 pb-20">
				<OrdersPage />
			</main>
		</div>
	);
}
