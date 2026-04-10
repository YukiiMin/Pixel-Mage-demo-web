import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { OrderDetail } from "@/features/orders/types";

export function useOrders(
	userId: number | null,
): UseQueryResult<OrderDetail[]> {
	return useQuery({
		queryKey: ["orders", userId],
		queryFn: () =>
			apiRequest<OrderDetail[]>(
				API_ENDPOINTS.orderManagement.byCustomer(userId!),
			).then((r) => r.data),
		enabled: !!userId,
		staleTime: 30_000,
	});
}
