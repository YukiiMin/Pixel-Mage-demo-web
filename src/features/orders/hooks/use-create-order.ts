import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type {
	CreateOrderRequest,
	CreateOrderResponse,
} from "@/features/orders/types";

export function useCreateOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (req: CreateOrderRequest) =>
			apiRequest<CreateOrderResponse>(API_ENDPOINTS.orderManagement.create, {
				method: "POST",
				body: JSON.stringify(req),
			}).then((r) => r.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
	});
}
