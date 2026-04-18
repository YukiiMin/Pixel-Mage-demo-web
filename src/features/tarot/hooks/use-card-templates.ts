"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";

export interface CardTemplateItem {
	cardTemplateId: number;
	name: string;
	imagePath: string | null;
	designPath: string | null;
	arcanaType: "MAJOR" | "MINOR";
	suit: string | null;
	cardNumber: number | null;
	rarity: "COMMON" | "RARE" | "LEGENDARY";
}

interface PageResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
}

/** Fetch toàn bộ card templates từ framework 1 (78 lá Rider-Waite) */
export function useCardTemplates(frameworkId = 1) {
	return useQuery({
		queryKey: ["card-templates-deck", frameworkId],
		queryFn: async () => {
			const res = await apiRequest<PageResponse<CardTemplateItem>>(
				`${API_ENDPOINTS.cardTemplates.list}?frameworkId=${frameworkId}&size=100&page=0`,
			);
			// Nếu API trả về page wrapper
			const payload = res.data as unknown;
			if (
				payload &&
				typeof payload === "object" &&
				"content" in (payload as Record<string, unknown>)
			) {
				return (payload as PageResponse<CardTemplateItem>).content;
			}
			// Nếu trả về array thẳng
			if (Array.isArray(payload)) {
				return payload as CardTemplateItem[];
			}
			return [] as CardTemplateItem[];
		},
		staleTime: 1000 * 60 * 10, // cache 10 phút
	});
}
