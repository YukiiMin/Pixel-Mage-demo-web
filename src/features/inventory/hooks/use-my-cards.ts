"use client";

import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { MyCardItem } from "@/types/commerce";

function normalizeRarity(value: unknown): MyCardItem["rarity"] {
	if (
		value === "COMMON" ||
		value === "RARE" ||
		value === "LEGENDARY" ||
		value === "common" ||
		value === "rare" ||
		value === "legendary"
	) {
		return (
			typeof value === "string" ? value.toUpperCase() : "COMMON"
		) as MyCardItem["rarity"];
	}
	return "COMMON";
}

function normalizeMyCards(payload: unknown): MyCardItem[] {
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
			const id = String(raw.id ?? raw.cardId ?? raw.templateId ?? "").trim();
			const name = String(
				raw.name ?? raw.cardName ?? raw.templateName ?? "",
			).trim();
			if (!id || !name) {
				return null;
			}

			return {
				id,
				name,
				description: String(raw.description ?? raw.summary ?? ""),
				quantity: Math.max(
					0,
					Number(raw.quantity ?? raw.ownedQuantity ?? 0) || 0,
				),
				rarity: normalizeRarity(raw.rarity),
				status: String(raw.status ?? raw.cardStatus ?? "UNKNOWN"),
				updatedAt: String(
					raw.updatedAt ?? raw.lastChecked ?? new Date().toISOString(),
				),
			};
		})
		.filter((item): item is MyCardItem => item !== null);
}

export function useMyCards(
	userId: number | null,
): UseQueryResult<MyCardItem[]> {
	return useQuery({
		queryKey: ["my-cards", userId],
		queryFn: async () => {
			if (!userId) throw new Error("No user ID");
			const response = await apiRequest<unknown>(
				`${API_ENDPOINTS.inventoryManagement.myCards}?userId=${userId}`,
				{
					method: "GET",
					cache: "no-store",
				},
			);
			return normalizeMyCards(response.data);
		},
		enabled: !!userId,
		staleTime: 30_000,
	});
}
