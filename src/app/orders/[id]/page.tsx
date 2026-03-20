import { OrderDetail } from "@/components/customer/orders/order-detail";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import StarBackground from "@/components/ui/star-background";

interface OrderDetailRouteProps {
	params: Promise<{ id: string }>;
}

export default async function OrderDetailRoute({ params }: OrderDetailRouteProps) {
	const { id } = await params;

	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pb-20 pt-28">
				<OrderDetail orderId={id} />
			</main>
			<Footer />
		</div>
	);
}
