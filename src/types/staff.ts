// Staff domain types

export type UnlinkRequestStatus =
	| "PENDING"
	| "EMAIL_CONFIRMED"
	| "APPROVED"
	| "REJECTED";

export interface UnlinkRequest {
	id: number;
	userId: number;
	userName: string;
	userEmail: string;
	cardId: number;
	cardName: string;
	requestedAt: string; // ISO datetime
	status: UnlinkRequestStatus;
	staffNote: string | null;
	processedAt: string | null;
}

export interface RejectUnlinkPayload {
	staffNote: string;
}
