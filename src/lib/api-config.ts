import type { ApiEnvelope, ApiRequestResult } from "../types/api";
import { ApiHttpError } from "../types/api";

const DEFAULT_API_BASE_URL =
	"https://pixelmageecomerceproject-production.up.railway.app";

export const API_CONFIG = {
	baseUrl:
		process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
		DEFAULT_API_BASE_URL,
	timeoutMs: 15000,
	defaultHeaders: {
		"Content-Type": "application/json",
	},
} as const;

export const API_ENDPOINTS = {
	accountManagement: {
		registration: "/api/accounts/registration",
		login: "/api/accounts/login",
		list: "/api/accounts",
		byId: (id: number | string) => `/api/accounts/${id}`,
		byEmail: (email: string) => `/api/accounts/email/${email}`,
		exists: (email: string) => `/api/accounts/exists/${email}`,
		authProvider: (email: string) => `/api/accounts/auth/provider/${email}`,
		canLink: "/api/accounts/auth/can-link",
		logout: "/api/accounts/auth/logout",
		googleAuth: "/api/accounts/auth/google",
	},
	roleManagement: {
		list: "/api/roles",
		create: "/api/roles",
		byId: (id: number | string) => `/api/roles/${id}`,
		byName: (roleName: string) => `/api/roles/name/${roleName}`,
		exists: (roleName: string) => `/api/roles/exists/${roleName}`,
	},
	supplierManagement: {
		list: "/api/suppliers",
		create: "/api/suppliers",
		byId: (id: number | string) => `/api/suppliers/${id}`,
		byName: (name: string) => `/api/suppliers/name/${name}`,
		byEmail: (email: string) => `/api/suppliers/email/${email}`,
		exists: (email: string) => `/api/suppliers/exists/${email}`,
	},
	warehouseManagement: {
		list: "/api/warehouses",
		create: "/api/warehouses",
		byId: (id: number | string) => `/api/warehouses/${id}`,
	},
	productManagement: {
		list: "/api/products",
		create: "/api/products",
		byId: (id: number | string) => `/api/products/${id}`,
	},
	inventoryManagement: {
		list: "/api/inventory",
		createByProductId: (productId: number | string) =>
			`/api/inventory/${productId}`,
		byId: (id: number | string) => `/api/inventory/${id}`,
		byWarehouse: (warehouseId: number | string) =>
			`/api/inventory/warehouse/${warehouseId}`,
		myCards: "/api/inventory/my-cards",
		myCardByTemplate: (templateId: number | string) =>
			`/api/inventory/my-cards/${templateId}`,
	},
	warehouseTransactions: {
		list: "/api/warehouse-transactions",
		create: "/api/warehouse-transactions",
		byId: (id: number | string) => `/api/warehouse-transactions/${id}`,
		byWarehouse: (warehouseId: number | string) =>
			`/api/warehouse-transactions/warehouse/${warehouseId}`,
		byProduct: (productId: number | string) =>
			`/api/warehouse-transactions/product/${productId}`,
	},
	purchaseOrders: {
		list: "/api/purchase-orders",
		create: "/api/purchase-orders",
		byId: (id: number | string) => `/api/purchase-orders/${id}`,
		byPoNumber: (poNumber: string) =>
			`/api/purchase-orders/po-number/${poNumber}`,
		byStatus: (status: string) => `/api/purchase-orders/status/${status}`,
		bySupplier: (supplierId: number | string) =>
			`/api/purchase-orders/supplier/${supplierId}`,
		exists: (poNumber: string) => `/api/purchase-orders/exists/${poNumber}`,
		lineItems: (poId: number | string) => `/api/purchase-orders/${poId}/lines`,
		lineItemById: (poId: number | string, lineId: number | string) =>
			`/api/purchase-orders/${poId}/lines/${lineId}`,
	},
	cardTemplates: {
		list: "/api/card-templates",
		create: "/api/card-templates",
		byId: (id: number | string) => `/api/card-templates/${id}`,
	},
	cardPriceTiers: {
		list: "/api/card-price-tiers",
		create: "/api/card-price-tiers",
		byId: (id: number | string) => `/api/card-price-tiers/${id}`,
		byTemplate: (templateId: number | string) =>
			`/api/card-price-tiers/template/${templateId}`,
	},
	cardManagement: {
		list: "/api/cards/list",
		create: "/api/cards/create",
		bind: "/api/cards/bind",
		byId: (id: number | string) => `/api/cards/${id}`,
		byNfcUid: (nfcUid: string) => `/api/cards/nfc/${nfcUid}`,
		updateStatus: (id: number | string) => `/api/cards/${id}/status`,
	},
	cardContents: {
		list: "/api/card-contents",
		create: "/api/card-contents",
		byId: (id: number | string) => `/api/card-contents/${id}`,
		byCard: (cardId: number | string) => `/api/card-contents/card/${cardId}`,
	},
	nfcManagement: {
		scan: "/api/nfc/scan",
		link: "/api/nfc/link",
		unlink: "/api/nfc/unlink",
	},
	packManagement: {
		list: "/api/packs",
		available: "/api/packs/available",
		create: "/api/packs/create",
		byId: (id: number | string) => `/api/packs/${id}`,
		updateStatus: (id: number | string) => `/api/packs/${id}/status`,
	},
	orderManagement: {
		list: "/api/orders",
		create: "/api/orders",
		byId: (id: number | string) => `/api/orders/${id}`,
		byCustomer: (customerId: number | string) =>
			`/api/orders/customer/${customerId}`,
		byStatus: (status: string) => `/api/orders/status/${status}`,
		cancel: (id: number | string) => `/api/orders/${id}/cancel`,
	},
	orderItems: {
		list: "/api/order-items",
		create: "/api/order-items",
		byId: (id: number | string) => `/api/order-items/${id}`,
		byOrder: (orderId: number | string) => `/api/order-items/order/${orderId}`,
		byPack: (packId: number | string) => `/api/order-items/pack/${packId}`,
	},
	payments: {
		createPaymentIntent: "/api/payments/create-payment-intent",
		confirmPayment: (paymentIntentId: string) =>
			`/api/payments/confirm-payment/${paymentIntentId}`,
		createSetupIntent: "/api/payments/create-setup-intent",
		savedMethods: (customerId: number | string) =>
			`/api/payments/saved-payment-methods/${customerId}`,
		payWithSavedCard: "/api/payments/pay-with-saved-card",
		byOrder: (orderId: number | string) => `/api/payments/order/${orderId}`,
		history: (customerId: number | string) =>
			`/api/payments/history/${customerId}`,
		detachPaymentMethod: (paymentMethodId: string) =>
			`/api/payments/detach-payment-method/${paymentMethodId}`,
	},
	vnPay: {
		createPayment: "/api/vnpay/create-payment",
		paymentReturn: "/api/vnpay/payment-return",
	},
	collections: {
		createByCustomer: (customerId: number | string) =>
			`/api/collections/${customerId}`,
		byId: (collectionId: number | string) => `/api/collections/${collectionId}`,
		byCustomer: (customerId: number | string) =>
			`/api/collections/customer/${customerId}`,
		publicList: "/api/collections/public",
		ownedCards: (customerId: number | string) =>
			`/api/collections/owned-cards/${customerId}`,
		createItemByCustomer: (customerId: number | string) =>
			`/api/collections/items/${customerId}`,
		itemsByCollection: (collectionId: number | string) =>
			`/api/collections/items/${collectionId}`,
		updateByCustomerAndCollection: (
			customerId: number | string,
			collectionId: number | string,
		) => `/api/collections/${customerId}/${collectionId}`,
		deleteItem: (
			customerId: number | string,
			collectionId: number | string,
			cardId: number | string,
		) => `/api/collections/items/${customerId}/${collectionId}/${cardId}`,
		deleteCollection: (
			customerId: number | string,
			collectionId: number | string,
		) => `/api/collections/${customerId}/${collectionId}`,
	},
	collectionProgress: {
		list: "/api/collections/progress",
		detail: "/api/collections/progress/detail",
	},
	adminCollections: {
		create: "/api/admin/collections",
		updateVisibility: (id: number | string) =>
			`/api/admin/collections/${id}/visibility`,
	},
	stories: {
		adminCreate: "/api/admin/stories",
		adminById: (id: number | string) => `/api/admin/stories/${id}`,
		list: "/api/stories",
		byId: (id: number | string) => `/api/stories/${id}`,
	},
	tarotReadings: {
		spreads: "/api/v1/readings/spreads",
		createSession: "/api/v1/readings/sessions",
		draw: (id: number | string) => `/api/v1/readings/sessions/${id}/draw`,
		interpret: (id: number | string) =>
			`/api/v1/readings/sessions/${id}/interpret`,
	},
	marketplace: {
		products: ["/api/products"] as const,
	},
} as const;

export function buildApiUrl(path: string): string {
	if (!path.startsWith("/")) {
		return `${API_CONFIG.baseUrl}/${path}`;
	}
	return `${API_CONFIG.baseUrl}${path}`;
}

export function getStoredAccessToken(): string | null {
	if (typeof window === "undefined") {
		return null;
	}

	const tokenKeys = ["token", "accessToken", "jwt", "authToken"];
	for (const key of tokenKeys) {
		const value = window.localStorage.getItem(key);
		if (value) {
			return value;
		}
	}

	return null;
}

export function setStoredAuthSession(payload: {
	token: string;
	userId?: number | null;
	email?: string | null;
	name?: string | null;
}): void {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem("token", payload.token);
	window.localStorage.setItem("accessToken", payload.token);
	if (payload.userId && payload.userId > 0) {
		window.localStorage.setItem("userId", String(payload.userId));
		window.localStorage.setItem("accountId", String(payload.userId));
	}
	if (payload.email) {
		window.localStorage.setItem("email", payload.email);
	}
	if (payload.name) {
		window.localStorage.setItem("name", payload.name);
	}
}

export function clearStoredAuthSession(): void {
	if (typeof window === "undefined") {
		return;
	}

	const keys = [
		"token",
		"accessToken",
		"jwt",
		"authToken",
		"userId",
		"accountId",
		"customerId",
		"email",
		"name",
	];
	for (const key of keys) {
		window.localStorage.removeItem(key);
	}
}

export function getStoredUserId(): number | null {
	if (typeof window === "undefined") {
		return null;
	}

	const idKeys = ["userId", "accountId", "customerId"];
	for (const key of idKeys) {
		const rawValue = window.localStorage.getItem(key);
		if (!rawValue) {
			continue;
		}

		const parsedValue = Number(rawValue);
		if (Number.isInteger(parsedValue) && parsedValue > 0) {
			return parsedValue;
		}
	}

	return null;
}

export function createApiHeaders(token?: string): HeadersInit {
	const resolvedToken = token ?? getStoredAccessToken();
	if (!resolvedToken) {
		return API_CONFIG.defaultHeaders;
	}

	return {
		...API_CONFIG.defaultHeaders,
		Authorization: `Bearer ${resolvedToken}`,
	};
}

export interface ApiRequestOptions extends Omit<RequestInit, "headers"> {
	headers?: Record<string, string>;
	token?: string;
	timeoutMs?: number;
}

function tryParseResponseBody(text: string): unknown {
	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

function unwrapApiData<T>(payload: unknown): T {
	if (
		payload &&
		typeof payload === "object" &&
		"data" in (payload as Record<string, unknown>)
	) {
		return (payload as ApiEnvelope<T>).data;
	}

	return payload as T;
}

export async function apiRequest<T>(
	path: string,
	options: ApiRequestOptions = {},
): Promise<ApiRequestResult<T>> {
	const controller = new AbortController();
	const timeoutMs = options.timeoutMs ?? API_CONFIG.timeoutMs;
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(buildApiUrl(path), {
			...options,
			headers: {
				...createApiHeaders(options.token),
				...(options.headers ?? {}),
			},
			signal: controller.signal,
		});

		const responseText = await response.text();
		const rawPayload = tryParseResponseBody(responseText);
		const data = unwrapApiData<T>(rawPayload);

		if (!response.ok) {
			throw new ApiHttpError(
				response.status,
				rawPayload,
				`API request failed with status ${response.status}`,
			);
		}

		return {
			status: response.status,
			data,
			raw: rawPayload,
		};
	} finally {
		clearTimeout(timeoutId);
	}
}
