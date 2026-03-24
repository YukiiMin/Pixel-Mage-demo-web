import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { Story } from "@/types/collection";

export function useStories(userId: number | null): UseQueryResult<Story[]> {
	return useQuery({
		queryKey: ["stories", userId],
		queryFn: async () => {
			if (!userId) throw new Error("No user ID");
			const res = await apiRequest<Story[]>(API_ENDPOINTS.stories.list(userId));
			return res.data;
		},
		enabled: !!userId,
		staleTime: 30_000,
	});
}
