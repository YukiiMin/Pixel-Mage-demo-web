"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { ReadingSession } from "@/features/tarot/types";

export function useTarotReadingHistory(userId: number | null) {
	return useQuery({
		queryKey: ["tarot-sessions", userId],
		queryFn: () =>
			apiRequest<ReadingSession[]>(API_ENDPOINTS.tarotReadings.sessions).then(
				(r) => r.data,
			),
		enabled: !!userId,
		select: (sessions) => sessions.filter((s) => s.status === "COMPLETED"),
		staleTime: 60_000,
	});
}
