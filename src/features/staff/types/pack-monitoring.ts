// Pack Monitoring Types - Aligned with BE entities and existing type system
// Based on: Pack.java, PackDetail.java, Card.java entities from backend

import type { PageResponse } from "@/types/api";
import type { CardTemplate, PackStatus, Rarity } from "@/types/commerce";

// ─────────────────────────────────────────────
// Card Status (from BE CardProductStatus enum)
// ─────────────────────────────────────────────
export type CardStatus =
	| "PENDING_BIND"
	| "READY"
	| "SOLD"
	| "LINKED"
	| "DEACTIVATED";

// ─────────────────────────────────────────────
// Core Entity Types (aligned with BE entities)
// ─────────────────────────────────────────────
export interface Card {
	cardId: number;
	nfcUid: string;
	softwareUuid: string;
	cardTemplate: CardTemplate;
	status: CardStatus;
	serialNumber?: string;
	productionBatch?: string;
	cardCondition?: string;
	owner?: AccountInfo;
	linkedAt?: string; // ISO datetime
	soldAt?: string; // ISO datetime
	createdAt: string; // ISO datetime
	updatedAt: string; // ISO datetime
}

export interface PackDetail {
	packDetailId: number;
	pack?: PackSummary; // Optional for mock data to avoid circular references
	card: Card;
	positionIndex: number; // 1-5 position in pack
}

export interface Product {
	productId: number;
	name: string;
	description?: string;
	price: number;
	imageUrl?: string;
}

export interface Pack {
	packId: number;
	product: Product;
	status: PackStatus;
	createdBy: AccountInfo;
	createdAt: string; // ISO datetime
	packDetails: PackDetail[];
	order?: OrderInfo;
}

// ─────────────────────────────────────────────
// Summary Types for API responses
// ─────────────────────────────────────────────
export interface PackSummary {
	packId: number;
	product: Product;
	status: PackStatus;
	createdBy: AccountInfo;
	createdAt: string;
}

export interface AccountInfo {
	accountId: number;
	name: string;
	email: string;
}

export interface OrderInfo {
	orderId: number;
	customer: AccountInfo;
	orderDate: string; // ISO datetime
}

// ─────────────────────────────────────────────
// Monitoring Statistics
// ─────────────────────────────────────────────
export interface PackMonitoringStats {
	totalPacks: number;
	stockedPacks: number;
	reservedPacks: number;
	soldPacks: number;
	totalCards: number;
	linkedCards: number;
	pendingCards: number;
	soldCards: number;
}

// ─────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────
export interface PackMonitoringResponse extends PageResponse<Pack> {
	stats?: PackMonitoringStats;
}

export interface PackDetailResponse {
	pack: Pack;
	relatedPacks?: PackSummary[];
}

// ─────────────────────────────────────────────
// Filter/Query Types
// ─────────────────────────────────────────────
export interface PackMonitoringFilters {
	search?: string;
	status?: PackStatus | "ALL";
	page?: number;
	size?: number;
	createdBy?: number;
	customerId?: number;
	dateFrom?: string; // ISO date
	dateTo?: string; // ISO date
}

// ─────────────────────────────────────────────
// UI Helper Types
// ─────────────────────────────────────────────
export interface PackCardSummary {
	total: number;
	byRarity: Record<Rarity, number>;
	byStatus: Record<CardStatus, number>;
	linkedCount: number;
	readyCount: number;
	soldCount: number;
}

export interface PackTimeline {
	packId: number;
	events: PackTimelineEvent[];
}

export interface PackTimelineEvent {
	id: string;
	type: "CREATED" | "RESERVED" | "SOLD" | "CARD_LINKED" | "CARD_SCANNED";
	timestamp: string; // ISO datetime
	description: string;
	actor?: AccountInfo;
	metadata?: Record<string, unknown>;
}
