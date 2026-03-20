export type ProductCategory = "deck" | "booster" | "collectible";

export type ProductRarity = "common" | "rare" | "epic" | "legendary";

export interface MarketplaceProduct {
	id: string;
	name: string;
	description: string;
	price: number;
	category: ProductCategory;
	rarity: ProductRarity;
	isLimited: boolean;
	releaseDate: string;
	imageEmoji: string;
}

export interface MyCardItem {
	id: string;
	name: string;
	description: string;
	quantity: number;
	rarity: ProductRarity;
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
