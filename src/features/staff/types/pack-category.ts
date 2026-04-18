// Pack Category & Product Types — Aligned with BE refactored architecture
// BE: PackCategory.java, Product.java

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────
export type ProductType = "GACHA_PACK" | "SINGLE_CARD";

// ─────────────────────────────────────────────
// Pack Category (Hub for pack generation config)
// ─────────────────────────────────────────────
export interface PackCategory {
	packCategoryId: number;
	name: string;
	description?: string;
	imageUrl?: string;
	cardsPerPack: number;
	rarityRates: string; // JSON string: {"COMMON":60,"RARE":30,"LEGENDARY":10}
	isActive: boolean;
	cardPools?: CardPoolItem[];
}

export interface CardPoolItem {
	cardTemplateId: number;
	name: string;
	rarity: string;
	imagePath?: string;
}

export interface PackCategoryRequest {
	name: string;
	description?: string;
	imageUrl?: string;
	cardsPerPack: number;
	rarityRates: string; // JSON string
	isActive?: boolean;
	cardTemplateIds?: number[];
}

export interface RarityRates {
	COMMON?: number;
	RARE?: number;
	LEGENDARY?: number;
	[key: string]: number | undefined;
}

// ─────────────────────────────────────────────
// Product (Showcase layer — what users see in shop)
// ─────────────────────────────────────────────
export interface AdminProduct {
	productId: number;
	name: string;
	description?: string;
	price: number;
	imageUrl?: string;
	productType: ProductType;
	isVisible: boolean;
	isActive: boolean;
	packCategory?: PackCategoryInfo;
	cardTemplate?: CardTemplateInfo;
	// Enriched by backend service layer
	stockCount?: number;
	poolSize?: number;
}

export interface PackCategoryInfo {
	packCategoryId: number;
	name: string;
	imageUrl?: string;
}

export interface CardTemplateInfo {
	cardTemplateId: number;
	name: string;
	rarity: string;
	imagePath?: string;
}

export interface ProductRequest {
	name?: string;
	description?: string;
	price?: number;
	imageUrl?: string;
	productType: ProductType;
	isVisible?: boolean;
	isActive?: boolean;
	packCategoryId?: number;
	cardTemplateId?: number;
}
