// Staff/Admin feature types

export interface AccountRow {
	id: number | string;
	customerId?: number;
	name: string;
	email: string;
	phoneNumber?: string;
	avatarUrl?: string;
	role?: { roleName?: string } | string;
	roleName?: string;
	active?: boolean;
	isActive?: boolean;
	emailVerified?: boolean;
	createdAt?: string;
}

export interface PageData {
	content: AccountRow[];
	totalPages: number;
	totalElements: number;
	number: number;
}

export interface CardItem {
	cardId: number;
	cardTemplateId: number;
	cardName: string;
	rarity: "COMMON" | "RARE" | "LEGENDARY";
	imagePath?: string;
}

export interface OrderItem {
	orderId: number;
	totalAmount: number;
	status: string;
	createdAt: string;
}

export interface UserStats {
	digitalCardsCount: number;
	cardsByRarity: {
		legendary: number;
		rare: number;
		common: number;
	};
	totalOrdersCount: number;
	totalSpent: number;
	walletBalance: number;
}

export interface StaffFormState {
	email: string;
	name: string;
	password: string;
	phoneNumber: string;
}
