import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { Spread } from "@/features/tarot/types";

export function useSpreads(): UseQueryResult<Spread[]> {
	return useQuery({
		queryKey: ["spreads"],
		queryFn: () =>
			apiRequest<Spread[]>(API_ENDPOINTS.tarotReadings.spreads).then(
				(r) => r.data,
			),
		staleTime: 5 * 60_000, // spreads ít thay đổi
	});
}
