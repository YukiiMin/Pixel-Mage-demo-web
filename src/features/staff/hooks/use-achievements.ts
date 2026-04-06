"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────
export interface Achievement {
	id: number;
	name: string;
	description: string;
	iconUrl?: string;
	condition: string;
	conditionValue?: number;
	rewardType: "PACK" | "POINT" | "NONE";
	rewardValue?: number;
	rewardPackId?: number;
	isActive: boolean;
	createdAt: string;
}

export interface CreateAchievementDto {
	name: string;
	description: string;
	iconUrl?: string;
	condition: string;
	conditionValue?: number;
	rewardType: "PACK" | "POINT" | "NONE";
	rewardValue?: number;
	rewardPackId?: number;
}

// ──────────────────────────────────────────────────
// Query Keys
// ──────────────────────────────────────────────────
export const achievementKeys = {
	all: ["admin-achievements"] as const,
	list: () => [...achievementKeys.all, "list"] as const,
};

// ──────────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────────
export function useAdminAchievements() {
	return useQuery({
		queryKey: achievementKeys.list(),
		queryFn: async () => {
			const result = await apiRequest<Achievement[]>(
				API_ENDPOINTS.adminAchievements.list,
			);
			return result.data ?? [];
		},
		staleTime: 60_000,
	});
}

export function useCreateAchievement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (dto: CreateAchievementDto) => {
			const result = await apiRequest<Achievement>(
				API_ENDPOINTS.adminAchievements.create,
				{
					method: "POST",
					body: JSON.stringify(dto),
				},
			);
			return result.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }),
	});
}

export function useUpdateAchievement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			dto,
		}: {
			id: number;
			dto: Partial<CreateAchievementDto>;
		}) => {
			const result = await apiRequest<Achievement>(
				API_ENDPOINTS.adminAchievements.byId(id),
				{
					method: "PUT",
					body: JSON.stringify(dto),
				},
			);
			return result.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }),
	});
}

export function useDeleteAchievement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			await apiRequest<void>(API_ENDPOINTS.adminAchievements.byId(id), {
				method: "DELETE",
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }),
	});
}

export function useToggleAchievement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			await apiRequest<void>(API_ENDPOINTS.adminAchievements.toggle(id), {
				method: "PATCH",
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }),
	});
}
