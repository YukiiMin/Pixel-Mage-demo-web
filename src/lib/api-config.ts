import type { ApiEnvelope, ApiRequestResult } from "../types/api";
import { ApiHttpError } from "../types/api";

const DEFAULT_API_BASE_URL =
	process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
	process.env.BACKEND_URL_NGROK ||
	process.env.BACKEND_URL ||
	"http://localhost:8080";
const AUTH_LOGIN_MARKER_COOKIE = "pm_logged_in";

export const API_CONFIG = {
	baseUrl:
		process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.replace(/\/$/, "") ??
		DEFAULT_API_BASE_URL,
	timeoutMs: 15000,
	defaultHeaders: {
		Accept: "application/json",
	},
} as const;

export const API_ENDPOINTS = {
	accountManagement: {
		registration: "/api/accounts/auth/registration",
		login: "/api/accounts/auth/login",
		refresh: "/api/accounts/auth/refresh",
		verifyEmail: "/api/accounts/auth/verify",
		list: "/api/accounts/list",
		toggleStatus: (id: number | string) => `/api/accounts/${id}/status`,
		createStaff: "/api/accounts/staff",
		byId: (id: number | string) => `/api/accounts/${id}`,
		byEmail: (email: string) =>
			`/api/accounts/email/${encodeURIComponent(email)}`,
		exists: (email: string) => `/api/accounts/exists/${email}`,
		authProvider: (email: string) => `/api/accounts/auth/provider/${email}`,
		canLink: "/api/accounts/auth/can-link",
		logout: "/api/accounts/auth/logout",
		googleAuth: "/api/accounts/auth/google",
		updateProfile: (id: number | string) => `/api/accounts/${id}`,
		changePassword: (id: number | string) => `/api/accounts/${id}/password`,
		forgotPassword: "/api/accounts/auth/forgot-password",
		resetPassword: "/api/accounts/auth/reset-password",
		/** Mobile → Web handoff: issue short-lived checkout token */
		checkoutToken: "/api/accounts/auth/checkout-token",
		/** Web App: verify + consume checkout token */
		verifyCheckoutToken: (ct: string) =>
			`/api/accounts/auth/verify-checkout-token?ct=${encodeURIComponent(ct)}`,
	},
	roleManagement: {
		list: "/api/roles",
		create: "/api/roles",
		byId: (id: number | string) => `/api/roles/${id}`,
		byName: (roleName: string) => `/api/roles/name/${roleName}`,
		exists: (roleName: string) => `/api/roles/exists/${roleName}`,
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
		myCards: "/api/inventory/my-cards",
		myCardByTemplate: (templateId: number | string) =>
			`/api/inventory/my-cards/${templateId}`,
	},
	cardTemplates: {
		list: "/api/card-templates",
		create: "/api/card-templates",
		byId: (id: number | string) => `/api/card-templates/${id}`,
		byRarity: (rarity: string) => `/api/card-templates/by-rarity/${rarity}`,
		byArcana: (arcanaType: string) =>
			`/api/card-templates/by-arcana/${arcanaType}`,
	},
	cardFrameworks: {
		list: "/api/card-frameworks",
	},
	adminDashboard: {
		stats: "/api/admin/stats",
	},
	adminCache: {
		clear: "/api/admin/cache/clear",
	},
	themeMusic: {
		active: "/api/theme-music/active",
		list: "/api/theme-music",
		upload: "/api/theme-music/upload",
		activate: (id: number) => `/api/theme-music/${id}/activate`,
		delete: (id: number) => `/api/theme-music/${id}`,
	},
	cardManagement: {
		list: "/api/cards/list",
		publicList: "/api/cards/public/list",
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
		/** Public: active contents for a template */
		byTemplate: (templateId: number | string) =>
			`/api/card-contents/template/${templateId}`,
		/** Admin/Staff: ALL contents for a template (including hidden) */
		adminByTemplate: (templateId: number | string) =>
			`/api/card-contents/admin/template/${templateId}`,
		/** Admin/Staff: overview all card contents across all templates */
		adminList: "/api/card-contents/admin",
		toggleActive: (id: number | string, isActive: boolean) =>
			`/api/card-contents/${id}/toggle-active?isActive=${String(isActive)}`,
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
		/** POST /api/payments/initiate — initiate a payment (gateway param optional) */
		initiate: "/api/payments/initiate",
		/** POST /api/payments/confirm-payment */
		confirmPayment: "/api/payments/confirm-payment",
		byOrder: (orderId: number | string) => `/api/payments/order/${orderId}`,
		history: (customerId: number | string) =>
			`/api/payments/history/${customerId}`,
	},
	paymentManagement: {
		initiate: "/api/payments/initiate",
		confirmPayment: "/api/payments/confirm-payment",
		byOrder: (orderId: number | string) => `/api/payments/order/${orderId}`,
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
		list: (userId: number | string) => `/api/stories?userId=${userId}`,
		byId: (id: number | string, userId: number | string) =>
			`/api/stories/${id}?userId=${userId}`,
		staffById: (id: number | string) => `/api/staff/stories/${id}`,
		adminCreate: "/api/admin/stories",
		adminUpdate: (id: number | string) => `/api/admin/stories/${id}`,
		adminDelete: (id: number | string) => `/api/admin/stories/${id}`,
	},
	tarotReadings: {
		spreads: "/api/v1/readings/spreads",
		createSession: "/api/v1/readings/sessions",
		sessions: "/api/v1/readings/sessions",
		draw: (id: number | string) => `/api/v1/readings/sessions/${id}/draw`,
		interpret: (id: number | string) =>
			`/api/v1/readings/sessions/${id}/interpret`,
		sessionById: (id: number | string) => `/api/v1/readings/sessions/${id}`,
		cancelSession: (id: number | string) => `/api/v1/readings/sessions/${id}`,
	},
	wallet: {
		balance: "/api/wallet/balance",
		exchange: "/api/wallet/exchange",
		history: "/api/wallet/history",
		adminList: "/api/admin/wallets",
		adminById: (userId: number | string) => `/api/admin/wallets/${userId}`,
	},
	vouchers: {
		my: "/api/vouchers/my",
		validate: "/api/vouchers/validate",
	},
	adminVouchers: {
		list: "/api/admin/vouchers",
		create: "/api/admin/vouchers",
		byId: (id: number | string) => `/api/admin/vouchers/${id}`,
		toggle: (id: number | string) => `/api/admin/vouchers/${id}/toggle`,
	},
	achievements: {
		list: "/api/achievements",
		my: "/api/achievements/my",
	},
	adminAchievements: {
		list: "/api/achievements",
		create: "/api/achievements",
		byId: (id: number | string) => `/api/achievements/${id}`,
		toggle: (id: number | string) => `/api/achievements/${id}`,
	},
	unlinkRequests: {
		create: "/api/unlink-requests",
		verify: "/api/unlink-requests/verify",
	},
	staffUnlinkRequests: {
		list: "/api/staff/unlink-requests",
		approve: (id: number | string) =>
			`/api/staff/unlink-requests/${id}/approve`,
		reject: (id: number | string) => `/api/staff/unlink-requests/${id}/reject`,
	},
	marketplace: {
		catalog: ["/api/packs/available", "/api/products"] as const,
		packs: "/api/packs/available",
		packById: (id: number | string) => `/api/packs/${id}`,
	},
} as const;

export function buildApiUrl(path: string): string {
	if (!path || typeof path !== "string") return "";

	// If already absolute, return as is
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	const _baseUrl = API_CONFIG.baseUrl.replace(/\/$/, "");
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	// We MUST use the local relative path to hit the Next.js proxy (/api/[...proxy]/route.ts)
	// This ensures HttpOnly cookies are correctly attached and CORS is avoided.
	return normalizedPath;
}

export function clearStoredAuthSession(): void {
	if (typeof window === "undefined") {
		return;
	}

	try {
		document.cookie = `${AUTH_LOGIN_MARKER_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
		document.cookie = "pm_user_id=; Max-Age=0; Path=/; SameSite=Lax";
		document.cookie = "pm_user_role=; Max-Age=0; Path=/; SameSite=Lax";
	} catch (_e) {}
}

export function setStoredAuthSession(userId: number, role?: string): void {
	if (typeof window === "undefined") return;

	const expiry = 60 * 60 * 24 * 7; // 7 days
	document.cookie = `${AUTH_LOGIN_MARKER_COOKIE}=1; Max-Age=${expiry}; Path=/; SameSite=Lax`;
	document.cookie = `pm_user_id=${userId}; Max-Age=${expiry}; Path=/; SameSite=Lax`;
	if (role) {
		document.cookie = `pm_user_role=${role}; Max-Age=${expiry}; Path=/; SameSite=Lax`;
	}
}

export function getStoredUserId(): number | null {
	if (typeof window === "undefined") return null;
	const match = document.cookie
		.split(";")
		.map((p) => p.trim())
		.find((p) => p.startsWith("pm_user_id="));
	if (!match) return null;
	const id = Number(match.split("=")[1]);
	return Number.isInteger(id) && id > 0 ? id : null;
}

export function getStoredUserRole(): string | null {
	if (typeof window === "undefined") return null;
	return readCookieValue("pm_user_role");
}

function readCookieValue(name: string): string | null {
	if (typeof window === "undefined") {
		return null;
	}

	const key = `${name}=`;
	const match = document.cookie
		.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(key));

	if (!match) {
		return null;
	}

	try {
		return match.slice(key.length) || null;
	} catch {
		return null;
	}
}

export function hasStoredAuthSession(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	if (readCookieValue(AUTH_LOGIN_MARKER_COOKIE) === "1") {
		return true;
	}

	return getStoredUserId() !== null;
}

export function createApiHeaders(token?: string): HeadersInit {
	const headers = { ...API_CONFIG.defaultHeaders } as Record<string, string>;
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	return headers;
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
	if (!path || typeof path !== "string") {
		throw new Error("API path is required.");
	}

	const controller = new AbortController();
	const timeoutMs = options.timeoutMs ?? API_CONFIG.timeoutMs;
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const baseHeaders = createApiHeaders(options.token);
		const mergedHeaders = {
			...baseHeaders,
			...(options.headers ?? {}),
		};

		// Bind body intelligently:
		// - No body → strip Content-Type (avoid text/plain on DELETE etc.)
		// - FormData → let browser set Content-Type with boundary automatically
		// - string → assume JSON string, set Content-Type: application/json
		// - object → stringify and set Content-Type: application/json
		let finalBody = options.body;
		if (!finalBody) {
			delete (mergedHeaders as Record<string, string>)["Content-Type"];
			delete (mergedHeaders as Record<string, string>)["content-type"];
		} else if (finalBody instanceof FormData) {
			// Let browser handle Content-Type with correct multipart boundary
			delete (mergedHeaders as Record<string, string>)["Content-Type"];
			delete (mergedHeaders as Record<string, string>)["content-type"];
		} else {
			// string or object body → treat as JSON
			if (typeof finalBody === "object") {
				finalBody = JSON.stringify(finalBody);
			}
			const hasContentType =
				(mergedHeaders as Record<string, string>)["Content-Type"] ||
				(mergedHeaders as Record<string, string>)["content-type"];
			if (!hasContentType) {
				(mergedHeaders as Record<string, string>)["Content-Type"] =
					"application/json";
			}
		}

		const response = await fetch(buildApiUrl(path), {
			...options,
			body: finalBody,
			credentials: options.credentials ?? "include",
			referrerPolicy: options.referrerPolicy ?? "no-referrer",
			headers: mergedHeaders as HeadersInit,
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
