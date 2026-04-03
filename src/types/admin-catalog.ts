export interface ProductRequestDTO {
	name?: string;
	description?: string;
	price?: number;
	imageUrl?: string;
}

export interface ProductResponse {
	productId: number;
	name: string;
	description: string;
	price: number;
	imageUrl?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface PackRequestDTO {
	productId?: number;
	createdByAccountId?: number;
	cardIds?: number[];
}

export interface PackResponse {
	packId?: number;
	productId?: number;
	productName?: string;
	status?: "STOCKED" | "RESERVED" | "SOLD";
	createdByAccountId?: number;
	createdAt?: string;
	packDetails?: {
		cardId?: number;
		cardName?: string;
		positionIndex?: number;
	}[];
}

export interface CardTemplateRequestDTO {
	name?: string;
	description?: string;
	designPath?: string;
	arcanaType?: "MAJOR" | "MINOR";
	suit?: "WANDS" | "CUPS" | "SWORDS" | "PENTACLES";
	cardNumber?: number;
	rarity?: "COMMON" | "RARE" | "LEGENDARY";
	imagePath?: string;
	frameworkId?: number;
}

export interface CardTemplateResponse {
	cardTemplateId: number;
	name: string;
	description?: string;
	arcanaType?: string;
	suit?: string;
	cardNumber?: number;
	rarity?: string;
	imagePath?: string;
	frameworkId?: number;
	frameworkName?: string;
}

export interface CardContentRequestDTO {
	cardTemplateId: number;
	title?: string;
	contentType: "STORY" | "IMAGE" | "VIDEO" | "GIF" | "LINK";
	contentData: string;
	displayOrder?: number;
	isActive?: boolean;
}

export interface CardContentResponse {
	contentId: number;
	cardTemplateId: number;
	cardTemplateName?: string;
	title?: string;
	contentType: string;
	contentData: string;
	displayOrder?: number;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}
