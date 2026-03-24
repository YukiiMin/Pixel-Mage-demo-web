import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { OrderDetail } from "@/types/order";

// GET /api/orders/{id} đã bao gồm orderItems (EAGER load)
// KHÔNG gọi thêm /api/order-items/order/{orderId} — endpoint không tồn tại
export function useOrderDetail(
	orderId: number | null,
): UseQueryResult<OrderDetail> {
	return useQuery({
		queryKey: ["order-detail", orderId],
		queryFn: () =>
			apiRequest<OrderDetail>(
				API_ENDPOINTS.orderManagement.byId(orderId!),
			).then((r) => r.data),
		enabled: !!orderId,
		staleTime: 10_000,
	});
}
