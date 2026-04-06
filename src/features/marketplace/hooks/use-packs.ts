import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { ProductResponse } from "@/types/commerce";

export function usePacks(): UseQueryResult<ProductResponse[]> {
	return useQuery({
		queryKey: ["packs"],
		queryFn: () =>
			apiRequest<ProductResponse[]>(API_ENDPOINTS.marketplace.catalog[1]).then(
				(r) => r.data,
			),
		staleTime: 60_000,
	});
}
