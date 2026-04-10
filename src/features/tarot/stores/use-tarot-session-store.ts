"use client";
import { create } from "zustand";
import type { ReadingCard } from "@/features/tarot/types";

export type SessionPhase =
	| "SETUP"
	| "SHUFFLING"
	| "DRAWING"
	| "REVEAL"
	| "INTERPRET"
	| "COMPLETE";

interface TarotSessionState {
	// Setup Draft State
	selectedSpreadId: number | null;
	setSelectedSpread: (id: number) => void;
	mainQuestion: string;
	setMainQuestion: (q: string) => void;

	// Active Session State
	activeSessionId: number | null;
	spreadId: number | null;
	mode: "EXPLORE" | "YOUR_DECK" | null;
	readingCards: ReadingCard[];
	phase: SessionPhase;

	setActiveSession: (
		sessionId: number,
		spreadId: number,
		mode: "EXPLORE" | "YOUR_DECK",
		mainQuestion?: string,
	) => void;
	setReadingCards: (cards: ReadingCard[]) => void;

	setPhase: (phase: SessionPhase) => void;
	clearSession: () => void;
	reset: () => void;
}

const initialState = {
	activeSessionId: null,
	spreadId: null,
	mode: null,
	selectedSpreadId: null,
	mainQuestion: "",
	readingCards: [],
	phase: "SHUFFLING" as SessionPhase,
};

export const useTarotSessionStore = create<TarotSessionState>((set) => ({
	...initialState,
	setSelectedSpread: (id) => set({ selectedSpreadId: id }),
	setMainQuestion: (q) => set({ mainQuestion: q }),
	setActiveSession: (sessionId, spreadId, mode, mainQuestion = "") =>
		set({
			activeSessionId: sessionId,
			spreadId,
			mode,
			mainQuestion,
		}),
	setReadingCards: (cards) => set({ readingCards: cards }),
	setPhase: (phase) => set({ phase }),
	clearSession: () =>
		set({
			activeSessionId: null,
			readingCards: [],
			phase: "SHUFFLING",
		}),
	reset: () => set({ ...initialState }),
}));
