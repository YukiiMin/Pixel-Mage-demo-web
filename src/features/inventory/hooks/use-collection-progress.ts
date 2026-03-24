"use client";

import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { CollectionProgressItem } from "@/types/commerce";

function normalizeCollectionProgress(
	payload: unknown,
): CollectionProgressItem[] {
	const source = Array.isArray(payload)
		? payload
		: payload && typeof payload === "object"
			? ((payload as { data?: unknown; items?: unknown }).data ??
				(payload as { data?: unknown; items?: unknown }).items)
			: undefined;

	if (!Array.isArray(source)) {
		return [];
	}

	return source
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}

			const raw = item as Record<string, unknown>;
			const collectionId = String(raw.collectionId ?? raw.id ?? "").trim();
			const collectionName = String(
				raw.collectionName ?? raw.name ?? "",
			).trim();
			if (!collectionId || !collectionName) {
				return null;
			}

			const completedItems =
				Number(raw.completedItems ?? raw.completed ?? 0) || 0;
			const totalItems = Number(raw.totalItems ?? raw.total ?? 0) || 0;
			const completionRate =
				totalItems > 0
					? Math.round((completedItems / totalItems) * 100)
					: Number(raw.completionRate ?? 0) || 0;

			return {
				collectionId,
				collectionName,
				completedItems,
				totalItems,
				completionRate,
			};
		})
		.filter((item): item is CollectionProgressItem => item !== null);
}

export function useCollectionProgress(
	userId: number | null,
): UseQueryResult<CollectionProgressItem[]> {
	return useQuery({
		queryKey: ["collection-progress", userId],
		queryFn: async () => {
			if (!userId) throw new Error("No user ID");
			const response = await apiRequest<unknown>(
				`${API_ENDPOINTS.collectionProgress.list}?customerId=${userId}`,
				{
					method: "GET",
					cache: "no-store",
				},
			);
			return normalizeCollectionProgress(response.data);
		},
		enabled: !!userId,
		staleTime: 30_000,
	});
}
