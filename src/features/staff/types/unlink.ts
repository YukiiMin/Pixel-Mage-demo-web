// Staff domain types
// Aligned with BE: UnlinkRequestResponse (PixelMage API Contract)

export type UnlinkRequestStatus =
	| "PENDING"
	| "EMAIL_CONFIRMED"
	| "APPROVED"
	| "REJECTED";

/**
 * Matches BE's `UnlinkRequestResponse`:
 * { id, nfcUid, status, createdAt, resolvedAt, staffNote }
 *
 * Legacy UI fields (userName, userEmail, cardName, requestedAt) are kept as
 * optional so existing table renders gracefully until BE enriches the DTO.
 */
export interface UnlinkRequest {
	// ── Core BE fields ──────────────────────────────────────────
	id: number;
	nfcUid: string;
	status: UnlinkRequestStatus;
	createdAt: string; // ISO datetime — use this as requestedAt
	resolvedAt?: string | null;
	staffNote?: string | null;

	// ── Optional enriched fields (not in current BE DTO) ────────
	userName?: string;
	userEmail?: string;
	cardName?: string;
	/** @deprecated use createdAt */
	requestedAt?: string;
	/** @deprecated use resolvedAt */
	processedAt?: string | null;
}

export interface RejectUnlinkPayload {
	staffNote: string;
}
