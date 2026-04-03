"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────
export interface AdminCollection {
	id: number;
	name: string;
	description?: string;
	coverImageUrl?: string;
	isVisible: boolean;
	cardTemplateIds: number[];
	appliedToUserCount: number;
	createdAt: string;
}

export interface CreateAdminCollectionDto {
	name: string;
	description?: string;
	coverImageUrl?: string;
	cardTemplateIds: number[];
}

// ──────────────────────────────────────────────────
// Query Keys
// ──────────────────────────────────────────────────
export const adminCollectionKeys = {
	all: ["admin-collections"] as const,
	list: () => [...adminCollectionKeys.all, "list"] as const,
};

// ──────────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────────
export function useAdminCollections() {
	return useQuery({
		queryKey: adminCollectionKeys.list(),
		queryFn: async () => {
			const result = await apiRequest<AdminCollection[]>(API_ENDPOINTS.adminCollections.create);
			return result.data ?? [];
		},
		staleTime: 60_000,
	});
}

export function useCreateAdminCollection() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (dto: CreateAdminCollectionDto) => {
			const result = await apiRequest<AdminCollection>(API_ENDPOINTS.adminCollections.create, {
				method: "POST",
				body: JSON.stringify(dto),
			});
			return result.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: adminCollectionKeys.all }),
	});
}

export function useToggleCollectionVisibility() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
			await apiRequest<void>(API_ENDPOINTS.adminCollections.updateVisibility(id), {
				method: "PATCH",
				body: JSON.stringify({ isVisible }),
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: adminCollectionKeys.all }),
	});
}
