export type ProductCategory = "deck" | "booster" | "collectible";

export type Rarity = "COMMON" | "RARE" | "LEGENDARY";
export type CollectionType = "STANDARD" | "LIMITED" | "HIDDEN";

export interface MarketplaceProduct {
	id: string;
	name: string;
	description: string;
	price: number;
	category: ProductCategory;
	rarity: Rarity;
	isLimited: boolean;
	releaseDate: string;
	imageEmoji: string;
}

export interface MyCardItem {
	id: string;
	name: string;
	description: string;
	quantity: number;
	rarity: Rarity;
	status: string;
	updatedAt: string;
}

export interface CollectionProgressItem {
	collectionId: string;
	collectionName: string;
	completedItems: number;
	totalItems: number;
	completionRate: number;
}
