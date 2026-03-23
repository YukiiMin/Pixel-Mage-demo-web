import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { Pack } from "@/types/commerce";

export function usePackDetail(packId: number | null): UseQueryResult<Pack> {
	return useQuery({
		queryKey: ["pack-detail", packId],
		queryFn: () =>
			apiRequest<Pack>(API_ENDPOINTS.marketplace.packById(packId!)).then(
				(r) => r.data,
			),
		enabled: packId !== null,
		staleTime: 30_000,
	});
}
