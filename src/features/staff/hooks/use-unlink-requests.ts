import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { UnlinkRequest } from "@/types/staff";

export function useUnlinkRequests(): UseQueryResult<UnlinkRequest[]> {
	return useQuery({
		queryKey: ["unlink-requests"],
		queryFn: () =>
			apiRequest<UnlinkRequest[]>(API_ENDPOINTS.staffUnlinkRequests.list).then(
				(r) => r.data,
			),
		staleTime: 30_000,
	});
}
