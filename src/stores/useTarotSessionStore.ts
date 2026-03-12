import { create } from "zustand";

export type TarotTopic = "love" | "career" | "general" | "finance";
export type SpreadType = "1-card" | "3-cards" | "celtic-cross";
export type DeckMode = "EXPLORE" | "YOUR_DECK";
export type SessionPhase =
	| "SHUFFLING"
	| "SELECTING"
	| "REVEALING"
	| "INTERPRETING"
	| "COMPLETE";

export interface TarotCard {
	id: number;
	name: string;
	image: string;
	isReversed: boolean;
	meaning: string;
}

export interface SelectedSlot {
	card: TarotCard;
	index: number;
}

interface TarotSetup {
	topic: TarotTopic | null;
	question: string;
	spreadType: SpreadType;
	deckMode: DeckMode;
}

interface TarotSessionState {
	// Setup
	setup: TarotSetup;
	setTopic: (t: TarotTopic) => void;
	setQuestion: (q: string) => void;
	setSpreadType: (s: SpreadType) => void;
	setDeckMode: (m: DeckMode) => void;

	// Session
	phase: SessionPhase;
	setPhase: (p: SessionPhase) => void;
	selectedCards: SelectedSlot[];
	addCard: (slot: SelectedSlot) => void;
	revealedCount: number;
	setRevealedCount: (n: number) => void;
	interpretation: string;
	setInterpretation: (t: string) => void;

	// Helpers
	requiredCards: () => number;
	reset: () => void;
}

const initialSetup: TarotSetup = {
	topic: null,
	question: "",
	spreadType: "3-cards",
	deckMode: "EXPLORE",
};

export const useTarotSessionStore = create<TarotSessionState>((set, get) => ({
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
			setup: { ...initialSetup },
			phase: "SHUFFLING",
			selectedCards: [],
			revealedCount: 0,
			interpretation: "",
		}),
}));
