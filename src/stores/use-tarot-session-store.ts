"use client";
import { create } from "zustand";
import type {
	DeckMode,
	ReadingCard,
	SelectedSlot,
	SessionPhase,
	SpreadType,
	TarotSetup,
	TarotTopic,
} from "@/types/tarot";

interface TarotSessionState {
	// --- MỚI (Tương lai) ---
	selectedSpreadId: number | null;
	mainQuestion: string;
	activeSessionId: number | null;
	drawnCards: ReadingCard[];
	setSelectedSpread: (spreadId: number) => void;
	setMainQuestion: (q: string) => void;
	setActiveSession: (sessionId: number) => void;
	setDrawnCards: (cards: ReadingCard[]) => void;
	clearSession: () => void;

	// --- CŨ (Hiện tại đang dùng) ---
	setup: TarotSetup;
	setTopic: (t: TarotTopic) => void;
	setQuestion: (q: string) => void;
	setSpreadType: (s: SpreadType) => void;
	setDeckMode: (m: DeckMode) => void;

	phase: SessionPhase; // Dùng kiểu cũ tạm chờ refactor
	setPhase: (p: SessionPhase) => void;
	selectedCards: SelectedSlot[];
	addCard: (slot: SelectedSlot) => void;
	revealedCount: number;
	setRevealedCount: (n: number) => void;
	interpretation: string;
	setInterpretation: (t: string) => void;

	requiredCards: () => number;
	reset: () => void;
}

const initialSetup: TarotSetup = {
	topic: null,
	question: "",
	spreadType: "3-cards",
	deckMode: "EXPLORE",
};

const initialState = {
	selectedSpreadId: null,
	mainQuestion: "",
	activeSessionId: null,
	drawnCards: [],
};

export const useTarotSessionStore = create<TarotSessionState>((set, get) => ({
	...initialState,
	setSelectedSpread: (spreadId) => set({ selectedSpreadId: spreadId }),
	setMainQuestion: (q) => set({ mainQuestion: q }),
	setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
	setDrawnCards: (cards) => set({ drawnCards: cards }),
	clearSession: () =>
		set({ activeSessionId: null, drawnCards: [], phase: "SHUFFLING" }),

	// --- CŨ ---
	setup: { ...initialSetup },
	setTopic: (t) => set((s) => ({ setup: { ...s.setup, topic: t } })),
	setQuestion: (q) => set((s) => ({ setup: { ...s.setup, question: q } })),
	setSpreadType: (s) =>
		set((st) => ({ setup: { ...st.setup, spreadType: s } })),
	setDeckMode: (m) => set((s) => ({ setup: { ...s.setup, deckMode: m } })),

	phase: "SHUFFLING",
	setPhase: (p) => set({ phase: p }),
	selectedCards: [],
	addCard: (slot) =>
		set((s) => ({ selectedCards: [...s.selectedCards, slot] })),
	revealedCount: 0,
	setRevealedCount: (n) => set({ revealedCount: n }),
	interpretation: "",
	setInterpretation: (t) => set({ interpretation: t }),

	requiredCards: () => {
		const spread = get().setup.spreadType;
		if (spread === "1-card") return 1;
		if (spread === "3-cards") return 3;
		return 10;
	},

	reset: () =>
		set({
			...initialState,
			setup: { ...initialSetup },
			phase: "SHUFFLING",
			selectedCards: [],
			revealedCount: 0,
			interpretation: "",
		}),
}));
