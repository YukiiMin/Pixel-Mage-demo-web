// Card Gallery Types - Customer-facing Card Gallery & Card Content System
// Aligned with PixelMage business requirements for guest user attraction

import type { PageResponse } from "@/types/api";
import type { CardTemplate, Rarity } from "@/types/commerce";

// Re-export Rarity for convenience
export { Rarity };

// ─────────────────────────────────────────────
// Card Framework Types (Card Sets / Card-template-types)
// ─────────────────────────────────────────────
export interface CardFramework {
	frameworkId: string;
	name: string;
	description: string;
	imageUrl?: string;
	totalCards: number;
	isActive: boolean;
	createdAt: string;
	updatedAt?: string;
}

// ─────────────────────────────────────────────
// Card Content Types (Rich media content for Card Templates)
// ─────────────────────────────────────────────
export type CardContentType = "TEXT" | "IMAGE" | "VIDEO" | "GIF" | "AUDIO" | "STORY";


export interface CardContent {
	contentId: string;
	cardTemplateId: number;
	contentType: CardContentType;
	title?: string;
	textData?: string;
	contentUrl?: string; // Cloudinary URL for images/videos/GIFs
	thumbnailUrl?: string; // Thumbnail for video content
	order: number; // Display order within card template
	isPublic: boolean; // Whether content is visible to guests
	createdAt: string;
	updatedAt?: string;
}

// ─────────────────────────────────────────────
// Enhanced Card Template with Gallery-specific fields
// ─────────────────────────────────────────────
export interface CardTemplateWithContent extends CardTemplate {
	frameworkId: string;
	frameworkName?: string;
	totalContentPieces: number;
	publicContentCount: number;
	privateContentCount: number;
	cardContents?: CardContent[];
	dropRate?: number; // Drop rate percentage in packs
	isOwned?: boolean; // Whether current user owns this card
	ownerCount?: number; // How many users own this card
}

// ─────────────────────────────────────────────
// Filter and Search Types
// ─────────────────────────────────────────────
export interface CardGalleryFilters {
	frameworkId?: string;
	search?: string;
	rarity?: Rarity | "ALL";
	element?: string | "ALL";
	edition?: string | "ALL";
	sortBy?: "name" | "rarity" | "createdAt" | "dropRate";
	sortOrder?: "asc" | "desc";
	page?: number;
	limit?: number;
}

export interface CardGalleryResponse
	extends PageResponse<CardTemplateWithContent> {
	frameworks?: CardFramework[];
	filters: CardGalleryFilters;
	stats?: {
		totalCards: number;
		ownedCards: number;
		completionRate: number;
	};
}

// ─────────────────────────────────────────────
// UI State Types
// ─────────────────────────────────────────────
export interface CardGalleryState {
	frameworks: CardFramework[];
	selectedFramework?: CardFramework;
	cards: CardTemplateWithContent[];
	filters: CardGalleryFilters;
	loading: boolean;
	error?: string;
	selectedCard?: CardTemplateWithContent;
	showContentModal: boolean;
	isAuthenticated: boolean;
}

// ─────────────────────────────────────────────
// Content Access Control
// ─────────────────────────────────────────────
export interface ContentAccessLevel {
	canViewFullContent: boolean;
	canViewPartialContent: boolean;
	requiredAction: "LOGIN" | "REGISTER" | "SUBSCRIBE" | "NONE";
	blurredContent?: CardContent[];
	visibleContent?: CardContent[];
}

// ─────────────────────────────────────────────
// Buy Card Flow Types
// ─────────────────────────────────────────────
export interface PackWithDropRate {
	packId: number;
	name: string;
	description: string;
	price: number;
	imageUrl?: string;
	dropRates: {
		cardTemplateId: number;
		cardTemplateName: string;
		rarity: Rarity;
		percentage: number;
	}[];
	totalCards: number;
	inStock: boolean;
}

export interface BuyCardFlow {
	cardTemplate: CardTemplateWithContent;
	availablePacks: PackWithDropRate[];
	selectedPack?: PackWithDropRate;
	checkoutStep: "SELECT_PACK" | "CHECKOUT" | "PAYMENT" | "SUCCESS";
}
