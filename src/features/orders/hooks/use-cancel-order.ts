import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";

export function useCancelOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (orderId: number) =>
			apiRequest<void>(API_ENDPOINTS.orderManagement.cancel(orderId), {
				method: "PUT",
			}),
		onSuccess: (_data, orderId) => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] });
		},
	});
}
