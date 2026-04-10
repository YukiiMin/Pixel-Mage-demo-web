import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { OrderDetail } from "@/features/orders";

interface OrderDetailRouteProps {
	params: Promise<{ id: string }>;
}

export default async function OrderDetailRoute({
	params,
}: OrderDetailRouteProps) {
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
