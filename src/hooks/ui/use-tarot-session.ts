"use client";

import { useCallback } from "react";
import { useTarotSessionStore } from "@/stores/useTarotSessionStore";
import type { SessionPhase } from "@/types/tarot";

const PHASE_ORDER: SessionPhase[] = [
	"SHUFFLING",
	"SELECTING",
	"REVEALING",
	"INTERPRETING",
	"COMPLETE",
];

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
