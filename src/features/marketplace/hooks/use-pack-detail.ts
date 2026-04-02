import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { ProductResponse } from "@/types/commerce";

export function usePackDetail(packId: number | null): UseQueryResult<ProductResponse> {
	return useQuery({
		queryKey: ["pack-detail", packId],
		queryFn: () =>
			apiRequest<ProductResponse>(API_ENDPOINTS.productManagement.byId(packId!)).then(
				(r) => r.data,
			),
		enabled: packId !== null,
		staleTime: 30_000,
	});
}
