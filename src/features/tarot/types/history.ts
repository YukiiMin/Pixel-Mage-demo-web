import type { DeckMode, SpreadType, TarotTopic } from "@/features/tarot/types";

export interface TarotReadingHistoryCard {
	cardId: number;
	name: string;
	nameVi: string;
	isReversed: boolean;
}

export interface TarotReadingHistoryItem {
	id: string;
	createdAt: string;
	topic: TarotTopic | null;
	question: string;
	spreadType: SpreadType;
	deckMode: DeckMode;
	cards: TarotReadingHistoryCard[];
	interpretation: string;
}

export interface SaveTarotReadingInput {
	topic: TarotTopic | null;
	question: string;
	spreadType: SpreadType;
	deckMode: DeckMode;
	cards: TarotReadingHistoryCard[];
	interpretation: string;
}
