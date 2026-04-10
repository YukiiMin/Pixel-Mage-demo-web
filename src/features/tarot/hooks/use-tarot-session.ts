"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import {
	type SessionPhase,
	useTarotSessionStore,
} from "@/features/tarot/stores/use-tarot-session-store";
import type { ReadingSession } from "@/features/tarot/types";

const PHASE_ORDER: SessionPhase[] = [
	"SHUFFLING",
	"DRAWING",
	"REVEAL",
	"INTERPRET",
	"COMPLETE",
];

export function useSessionDetail(sessionId: number | null) {
	return useQuery({
		queryKey: ["tarot-session-detail", sessionId],
		queryFn: () =>
			apiRequest<ReadingSession>(
				API_ENDPOINTS.tarotReadings.sessionById(sessionId!),
			).then((r) => r.data),
		enabled: !!sessionId,
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			return status === "INTERPRETING" ? 2000 : false;
		},
	});
}

export function useTarotSession() {
	const phase = useTarotSessionStore((state) => state.phase);
	const setPhase = useTarotSessionStore((state) => state.setPhase);
	const reset = useTarotSessionStore((state) => state.reset);

	const goTo = useCallback(
		(nextPhase: SessionPhase) => {
			setPhase(nextPhase);
		},
		[setPhase],
	);

	const goToNextPhase = useCallback(() => {
		const currentIndex = PHASE_ORDER.indexOf(phase);
		const nextPhase = PHASE_ORDER[currentIndex + 1];
		if (nextPhase) {
			setPhase(nextPhase);
		}
	}, [phase, setPhase]);

	return {
		phase,
		phaseOrder: PHASE_ORDER,
		goTo,
		goToNextPhase,
		reset,
	};
}
