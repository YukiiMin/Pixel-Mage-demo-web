import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type {
	Achievement,
	EarnedAchievement,
} from "@/features/collection/types";

export function useAchievements(): UseQueryResult<Achievement[]> {
	return useQuery({
		queryKey: ["achievements"],
		queryFn: async () => {
			const res = await apiRequest<Achievement[]>(
				API_ENDPOINTS.achievements.list,
			);
			return res.data;
		},
		staleTime: 60_000,
	});
}

export function useMyAchievements(
	userId: number | null,
): UseQueryResult<EarnedAchievement[]> {
	return useQuery({
		queryKey: ["my-achievements", userId],
		queryFn: async () => {
			if (!userId) throw new Error("No user ID");
			const res = await apiRequest<EarnedAchievement[]>(
				API_ENDPOINTS.achievements.my,
			);
			return res.data;
		},
		enabled: !!userId,
		staleTime: 60_000,
	});
}
