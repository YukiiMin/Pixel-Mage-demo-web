import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { AccountProfile } from "@/features/tarot/types";

export function useAccountProfile(
	userId: number | null,
): UseQueryResult<AccountProfile> {
	return useQuery({
		queryKey: ["account", userId],
		queryFn: () =>
			apiRequest<AccountProfile>(
				API_ENDPOINTS.accountManagement.byId(userId!),
			).then((r) => r.data),
		enabled: !!userId,
		staleTime: 30_000,
	});
}
