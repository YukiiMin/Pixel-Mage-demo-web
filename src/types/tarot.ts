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

export interface TarotSetup {
	topic: TarotTopic | null;
	question: string;
	spreadType: SpreadType;
	deckMode: DeckMode;
}
