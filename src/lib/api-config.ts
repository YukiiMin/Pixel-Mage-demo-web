import type { ApiEnvelope, ApiRequestResult } from "../types/api";
import { ApiHttpError } from "../types/api";

const DEFAULT_API_BASE_URL = "http://localhost:8080";
const AUTH_LOGIN_MARKER_COOKIE = "pm_logged_in";

export const API_CONFIG = {
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL,
  timeoutMs: 15000,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
} as const;

export const AUTH_SESSION_CHANGED_EVENT = "auth-session-changed";

let authSyncChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  authSyncChannel = new BroadcastChannel("auth_sync_channel");
  authSyncChannel.onmessage = (event) => {
    if (event.data === "login") {
      // Re-fetch session from backend quietly if another tab logs in
      getAuthSession({ syncStorage: true, broadcast: false }).catch(() => {});
    } else if (event.data === "logout") {
      // Clear locally without broadcasting back
      clearStoredAuthSession({ broadcast: false });
    }
  };
}

export const API_ENDPOINTS = {
  accountManagement: {
    registration: "/api/accounts/auth/registration",
    login: "/api/accounts/auth/login",
    list: "/api/accounts",
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
    catalog: ["/api/packs/available", "/api/products"] as const,
  },
} as const;

export function buildApiUrl(path: string): string {
  if (path.startsWith("/api/")) {
    return path;
  }

  if (!path.startsWith("/")) {
    return `${API_CONFIG.baseUrl}/${path}`;
  }
  return `${API_CONFIG.baseUrl}${path}`;
}

export function getStoredAccessToken(): string | null {
  return null;
}

export function setStoredAuthSession(
  payload: {
    token?: string | null;
    userId?: number | null;
    email?: string | null;
    name?: string | null;
  },
  options: { broadcast?: boolean } = {}
): void {
  if (typeof window === "undefined") {
    return;
  }

  const broadcast = options.broadcast ?? true;

  const localKeys = [
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
  for (const key of localKeys) {
    window.localStorage.removeItem(key);
  }

  const sessionKeys = ["userId", "accountId", "customerId", "email", "name"];
  for (const key of sessionKeys) {
    window.sessionStorage.removeItem(key);
  }

  if (payload.userId && payload.userId > 0) {
    window.sessionStorage.setItem("userId", String(payload.userId));
    window.sessionStorage.setItem("accountId", String(payload.userId));
    window.sessionStorage.setItem("customerId", String(payload.userId));
  }
  if (payload.email) {
    window.sessionStorage.setItem("email", payload.email);
  }
  if (payload.name) {
    window.sessionStorage.setItem("name", payload.name);
  }
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));

  if (broadcast && authSyncChannel) {
    authSyncChannel.postMessage("login");
  }
}

export function clearStoredAuthSession(options: { broadcast?: boolean } = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  const broadcast = options.broadcast ?? true;

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
    window.sessionStorage.removeItem(key);
  }
  document.cookie = `${AUTH_LOGIN_MARKER_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  document.cookie = "pm_user_id=; Max-Age=0; Path=/; SameSite=Lax";
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));

  if (broadcast && authSyncChannel) {
    authSyncChannel.postMessage("logout");
  }
}

export function getStoredUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  // 1. Check sessionStorage / localStorage (fastest, in-memory)
  const idKeys = ["userId", "accountId", "customerId"];
  for (const key of idKeys) {
    const rawValue =
      window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
    if (!rawValue) {
      continue;
    }

    const parsedValue = Number(rawValue);
    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  // 2. Read pm_user_id cookie (non-HttpOnly, set by BFF login route)
  const cookieMatch = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("pm_user_id="));
  if (cookieMatch) {
    const cookieId = Number(cookieMatch.split("=")[1]);
    if (Number.isInteger(cookieId) && cookieId > 0) {
      // Sync back into sessionStorage so future calls skip this cookie read.
      window.sessionStorage.setItem("userId", String(cookieId));
      window.sessionStorage.setItem("accountId", String(cookieId));
      window.sessionStorage.setItem("customerId", String(cookieId));
      return cookieId;
    }
  }

  return null;
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

  return match.slice(key.length) || null;
}

function writeSessionProfile(profile: {
  userId?: number | null;
  email?: string | null;
  name?: string | null;
}): void {
  if (typeof window === "undefined") {
    return;
  }

  const keys = ["userId", "accountId", "customerId", "email", "name"];
  for (const key of keys) {
    window.sessionStorage.removeItem(key);
  }

  if (profile.userId && profile.userId > 0) {
    const id = String(profile.userId);
    window.sessionStorage.setItem("userId", id);
    window.sessionStorage.setItem("accountId", id);
    window.sessionStorage.setItem("customerId", id);
  }
  if (profile.email) {
    window.sessionStorage.setItem("email", profile.email);
  }
  if (profile.name) {
    window.sessionStorage.setItem("name", profile.name);
  }
}

export interface AuthSessionSnapshot {
  authenticated: boolean;
  userId: number | null;
  email: string | null;
  name: string | null;
}

export async function getAuthSession(
  options: { syncStorage?: boolean; broadcast?: boolean } = {},
): Promise<AuthSessionSnapshot | null> {
  const syncStorage = options.syncStorage ?? true;
  const broadcast = options.broadcast ?? false;

  try {
    const session = await apiRequest<unknown>("/api/auth/session", {
      method: "GET",
      cache: "no-store",
    });

    const raw =
      session.data && typeof session.data === "object"
        ? (session.data as Record<string, unknown>)
        : null;
    if (!raw) {
      return null;
    }

    const authenticated = Boolean(raw.authenticated);
    if (!authenticated) {
      return null;
    }

    const userIdRaw = Number(raw.userId ?? 0);
    const userId = Number.isInteger(userIdRaw) && userIdRaw > 0 ? userIdRaw : null;
    const email = String(raw.email ?? "").trim() || null;
    const name = String(raw.name ?? "").trim() || null;

    if (syncStorage && typeof window !== "undefined") {
      writeSessionProfile({ userId, email, name });
      window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
    }

    return {
      authenticated: true,
      userId,
      email,
      name,
    };
  } catch {
    return null;
  }
}

export async function ensureStoredUserId(): Promise<number | null> {
  const existing = getStoredUserId();
  if (existing) {
    return existing;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const session = await getAuthSession({ syncStorage: true });
  if (session?.userId) {
    return session.userId;
  }

  return null;
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
  if (!path || typeof path !== "string") {
    throw new Error("API path is required.");
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? API_CONFIG.timeoutMs;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildApiUrl(path), {
      ...options,
      credentials: options.credentials ?? "same-origin",
      referrerPolicy: options.referrerPolicy ?? "no-referrer",
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
