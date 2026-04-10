import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { OrderDetail } from "@/features/orders/types";

// Poll GET /api/orders/{id} để theo dõi paymentStatus
// Pattern giống tarot interpret poll
export function useOrderStatusPoll(orderId: number | null) {
	return useQuery({
		queryKey: ["order-detail", orderId],
		queryFn: () =>
			apiRequest<OrderDetail>(
				API_ENDPOINTS.orderManagement.byId(orderId!),
			).then((r) => r.data),
		enabled: !!orderId,
		refetchInterval: (query) => {
			const paymentStatus = query.state.data?.paymentStatus;
			// Dừng poll khi terminal state
			if (paymentStatus === "SUCCEEDED" || paymentStatus === "FAILED")
				return false;
			const orderStatus = query.state.data?.status;
			if (orderStatus === "CANCELLED") return false;
			return 3000;
		},
	});
}
