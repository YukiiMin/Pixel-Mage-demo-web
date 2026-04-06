"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest, getStoredUserId } from "@/lib/api-config";

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
			const result = await apiRequest<
				| {
						content?: AdminCollection[];
				  }
				| AdminCollection[]
			>(API_ENDPOINTS.collections.publicList);
			const data = result.data;
			if (Array.isArray(data)) return data;
			return data?.content ?? [];
		},
		staleTime: 60_000,
	});
}

export function useCreateAdminCollection() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (dto: CreateAdminCollectionDto) => {
			const adminId = getStoredUserId();
			if (!adminId) {
				throw new Error("Không xác định được adminId hiện tại");
			}
			const result = await apiRequest<AdminCollection>(
				`${API_ENDPOINTS.adminCollections.create}?adminId=${adminId}`,
				{
					method: "POST",
					body: JSON.stringify(dto),
				},
			);
			return result.data;
		},
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: adminCollectionKeys.all }),
	});
}

export function useToggleCollectionVisibility() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			isVisible,
		}: {
			id: number;
			isVisible: boolean;
		}) => {
			await apiRequest<void>(
				`${API_ENDPOINTS.adminCollections.updateVisibility(id)}?isVisible=${String(isVisible)}`,
				{
					method: "PUT",
				},
			);
		},
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: adminCollectionKeys.all }),
	});
}
