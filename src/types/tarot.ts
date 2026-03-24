export type TarotTopic = "love" | "career" | "general" | "finance";
export type SpreadType = "1-card" | "3-cards" | "celtic-cross";
export type DeckMode = "EXPLORE";

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

// Spread từ BE (dùng minCardsRequired — KHÔNG phải requiredCardCount)
export interface Spread {
	spreadId: number;
	name: string;
	description: string;
	positionCount: number;
	minCardsRequired: number;
}

// Account (chỉ field cần cho guest check)
export interface AccountProfile {
	id: number;
	email: string;
	name: string;
	guestReadingUsedAt: string | null;
}

// Session từ BE
export type ReadingSessionStatus =
	| "PENDING"
	| "INTERPRETING"
	| "COMPLETED"
	| "EXPIRED";

export interface ReadingSession {
	sessionId: number;
	spreadId: number;
	mode: "EXPLORE" | "YOUR_DECK";
	mainQuestion: string;
	status: ReadingSessionStatus;
	createdAt: string;
	interpretation?: string;
	drawnCards?: ReadingCard[];
}

export interface InterpretResponse {
	interpretation: string;
	session: ReadingSession;
}

// Create session request
export interface CreateSessionRequest {
	spreadId: number;
	mainQuestion: string;
	mode: "EXPLORE";
}

// ReadingCard từ BE (draw response)
export interface ReadingCard {
	readingCardId: number;
	cardTemplate: {
		cardTemplateId: number;
		name: string;
		imageUrl: string;
		rarity: "COMMON" | "RARE" | "LEGENDARY";
	};
	positionIndex: number;
	positionName: string;
	isReversed: boolean;
}
