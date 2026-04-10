import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { OrderDetail } from "@/features/orders/types";

// Poll GET /api/orders/{id} de theo doi paymentStatus
// Pattern giong tarot interpret poll
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
			// Dung poll khi terminal state (BE PaymentStatus enum: SUCCEEDED, FAILED, CANCELLED)
			if (
				paymentStatus === "SUCCEEDED" ||
				paymentStatus === "FAILED" ||
				paymentStatus === "CANCELLED"
			)
				return false;
			const orderStatus = query.state.data?.status;
			if (orderStatus === "CANCELLED") return false;
			return 3000;
		},
	});
}
