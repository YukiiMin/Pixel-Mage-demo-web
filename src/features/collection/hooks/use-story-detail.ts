import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { ApiHttpError } from "@/types/api";
import type { StoryDetail } from "@/types/collection";

export function useStoryDetail(
	id: number | null,
	userId: number | null,
): UseQueryResult<StoryDetail> {
	return useQuery({
		queryKey: ["story-detail", id, userId],
		queryFn: async () => {
			if (!id || !userId) throw new Error("Missing params");
			const res = await apiRequest<StoryDetail>(
				API_ENDPOINTS.stories.byId(id, userId),
			);
			return res.data;
		},
		enabled: !!id && !!userId,
		staleTime: 60_000,
		retry: (failureCount, error) => {
			if (error instanceof ApiHttpError && error.status === 403) return false;
			return failureCount < 2;
		},
	});
}
