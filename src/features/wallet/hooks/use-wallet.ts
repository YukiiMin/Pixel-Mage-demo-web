import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { WalletBalance } from "@/features/profile/types/wallet";

export function useWalletBalance(userId: number | null) {
	return useQuery({
		queryKey: ["wallet", userId],
		queryFn: () =>
			apiRequest<WalletBalance>(API_ENDPOINTS.wallet.balance).then(
				(r) => r.data,
			),
		enabled: !!userId,
	});
}

export function useExchangePoints(userId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiRequest<void>(API_ENDPOINTS.wallet.exchange, { method: "POST" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wallet", userId] });
			queryClient.invalidateQueries({ queryKey: ["vouchers", userId] });
		},
	});
}
