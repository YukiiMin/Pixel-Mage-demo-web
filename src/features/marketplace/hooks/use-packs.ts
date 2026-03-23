import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { Pack } from "@/types/commerce";

export function usePacks(): UseQueryResult<Pack[]> {
	return useQuery({
		queryKey: ["packs"],
		queryFn: () =>
			apiRequest<Pack[]>(API_ENDPOINTS.marketplace.packs).then((r) => r.data),
		staleTime: 60_000,
	});
}
