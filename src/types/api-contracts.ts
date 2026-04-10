// Centralized API Contract Types - Synced with Backend
// Based on BE_SYNC_REPORT_2026_04_03.md and PixelMage_API_Types_Contract.md

import type { OrderStatus, PaymentStatus } from "@/features/orders/types";

export interface DashboardResponse {
	totalUsers: number;
	totalOrders: number;
	totalRevenue: number;
	totalCardTemplates: number;
	revenueByDay: { date: string; revenue: number }[];
	revenueByPackType: { packName: string; revenue: number }[];
	recentOrders: {
		orderId: number;
		customerName: string;
		amount: number;
		status: string;
		createdAt: string;
	}[];
}

export interface PackResponse {
	productId: number;
	name: string;
	description: string;
	price: number;
	images?: string;
	isLimited: boolean;
	totalMinted?: number;
	availableQuantity?: number;
	rarity?: string;
	attributes?: string;
	cardTemplateId?: number;
	isGacha?: boolean;
}

export interface CardContentResponse {
	id: number;
	templateId: number;
	cardName?: string; // Optional depending on join
	nfcUid: string;
	isActive: boolean;
	secretPhrase?: string; // May be omitted depending on role
	// Additional fields for Card Gallery
	contentType?: string;
	title?: string;
	textData?: string;
	contentUrl?: string;
	thumbnailUrl?: string;
	order?: number;
	isPublic?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CardFrameworkResponse {
	frameworkId: string;
	name: string;
	description: string;
	imageUrl?: string;
	totalCards: number;
	isActive: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface CardTemplateResponse {
	cardTemplateId: number;
	name: string;
	cardCode?: string;
	description?: string;
	imagePath?: string;
	rarity: string;
	frameworkId?: string;
	frameworkName?: string;
	totalContentPieces?: number;
	publicContentCount?: number;
	privateContentCount?: number;
	dropRate?: number;
	isOwned?: boolean;
	ownerCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface CardTemplateResponseSummary {
	cardTemplateId: number;
	name: string;
	cardCode?: string;
	description?: string;
	imagePath?: string;
	rarity: string;
	frameworkId?: string;
	frameworkName?: string;
	totalContentPieces?: number;
	publicContentCount?: number;
	privateContentCount?: number;
	dropRate?: number;
	isOwned?: boolean;
	ownerCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface OrderResponse {
	id: number;
	customerId: number;
	customerName?: string; // Resolved by backend
	orderedAt: string; // ISO datetime
	totalAmount: number;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	items: OrderItemResponse[];
}

export interface OrderItemResponse {
	id: number;
	productId: number;
	productName?: string;
	quantity: number;
	unitPrice: number;
	subtotal: number;
}
