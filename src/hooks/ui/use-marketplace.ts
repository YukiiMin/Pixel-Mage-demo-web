"use client";

import { useEffect, useMemo, useState } from "react";
import {
	API_ENDPOINTS,
	apiRequest,
	getStoredAccessToken,
} from "@/lib/api-config";
import { getApiErrorMessage, isApiHttpError } from "@/types/api";
import type {
	MarketplaceProduct,
	ProductCategory,
	ProductRarity,
} from "@/types/commerce";

export type ProductSort = "newest" | "price-asc" | "price-desc";
export type MarketplaceStatus =
	| "idle"
	| "loading"
	| "ready"
	| "unavailable"
	| "error";

function normalizeCategory(value: unknown): ProductCategory {
	if (value === "deck" || value === "booster" || value === "collectible") {
		return value;
	}
	return "collectible";
}

function normalizeRarity(value: unknown): ProductRarity {
	if (
		value === "common" ||
		value === "rare" ||
		value === "epic" ||
		value === "legendary"
	) {
		return value;
	}
	return "common";
}

function normalizeProducts(payload: unknown): MarketplaceProduct[] {
	const source = Array.isArray(payload)
		? payload
		: payload && typeof payload === "object"
			? ((payload as { data?: unknown; items?: unknown }).data ??
				(payload as { data?: unknown; items?: unknown }).items)
			: undefined;

	if (!Array.isArray(source)) {
		return [];
	}

	return source
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}

			const raw = item as Record<string, unknown>;
			const id = String(raw.id ?? raw.productId ?? "").trim();
			const name = String(raw.name ?? raw.productName ?? "").trim();
			const description = String(raw.description ?? raw.summary ?? "").trim();
			const price = Number(raw.price ?? raw.unitPrice ?? 0);

			if (!id || !name || !Number.isFinite(price)) {
				return null;
			}

			return {
				id,
				name,
				description,
				price,
				category: normalizeCategory(raw.category),
				rarity: normalizeRarity(raw.rarity),
				isLimited: Boolean(raw.isLimited ?? raw.limited),
				releaseDate: String(
					raw.releaseDate ?? raw.createdAt ?? new Date().toISOString(),
				),
				imageEmoji: "🃏",
			};
		})
		.filter((product): product is MarketplaceProduct => product !== null);
}

interface ProductFetchResult {
	products: MarketplaceProduct[] | null;
	error: unknown;
}

async function fetchProductsFromBackend(): Promise<ProductFetchResult> {
	let lastError: unknown = null;

	for (const endpoint of API_ENDPOINTS.marketplace.products) {
		try {
			const token = getStoredAccessToken() ?? undefined;
			const response = await apiRequest<unknown>(endpoint, {
				method: "GET",
				cache: "no-store",
				token,
			});

			return {
				products: normalizeProducts(response.data),
				error: null,
			};
		} catch (error) {
			lastError = error;
		}
	}

	return {
		products: null,
		error: lastError,
	};
}

export function useMarketplace() {
	const [products, setProducts] = useState<MarketplaceProduct[]>([]);
	const [status, setStatus] = useState<MarketplaceStatus>("idle");
	const [statusMessage, setStatusMessage] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [category, setCategory] = useState<ProductCategory | "all">("all");
	const [rarity, setRarity] = useState<ProductRarity | "all">("all");
	const [limitedOnly, setLimitedOnly] = useState(false);
	const [sortBy, setSortBy] = useState<ProductSort>("newest");

	useEffect(() => {
		let active = true;

		const loadProducts = async () => {
			setStatus("loading");
			setStatusMessage("Đang tải sản phẩm từ hệ thống...");

			const { products: backendProducts, error } =
				await fetchProductsFromBackend();
			if (!active) {
				return;
			}

			if (backendProducts === null) {
				setProducts([]);
				setStatus("unavailable");

				if (isApiHttpError(error) && error.status === 401) {
					setStatusMessage(
						"Bạn cần đăng nhập để truy cập API sản phẩm. Chức năng chưa cập nhật cho khách chưa đăng nhập.",
					);
					return;
				}

				if (isApiHttpError(error) && error.status === 403) {
					setStatusMessage(
						"Tài khoản hiện tại chưa có quyền truy cập API sản phẩm. Chức năng chưa cập nhật.",
					);
					return;
				}

				setStatusMessage(
					`${getApiErrorMessage(error, "Marketplace chưa kết nối được API sản phẩm từ BE đã deploy.")} Chức năng chưa cập nhật.`,
				);
				return;
			}

			if (backendProducts.length === 0) {
				setProducts([]);
				setStatus("unavailable");
				setStatusMessage(
					"BE đã phản hồi nhưng chưa có dữ liệu sản phẩm. Chức năng chưa cập nhật.",
				);
				return;
			}

			setProducts(backendProducts);
			setStatus("ready");
			setStatusMessage("");
		};

		loadProducts().catch(() => {
			if (!active) {
				return;
			}
			setProducts([]);
			setStatus("error");
			setStatusMessage("Không thể tải dữ liệu marketplace từ BE.");
		});

		return () => {
			active = false;
		};
	}, []);

	const filteredProducts = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		const result = products.filter((product) => {
			const matchCategory = category === "all" || product.category === category;
			const matchRarity = rarity === "all" || product.rarity === rarity;
			const matchLimited = !limitedOnly || product.isLimited;
			const matchSearch =
				normalizedSearch.length === 0 ||
				product.name.toLowerCase().includes(normalizedSearch) ||
				product.description.toLowerCase().includes(normalizedSearch);

			return matchCategory && matchRarity && matchLimited && matchSearch;
		});

		const sorted = [...result].sort((a, b) => {
			if (sortBy === "price-asc") {
				return a.price - b.price;
			}
			if (sortBy === "price-desc") {
				return b.price - a.price;
			}
			return (
				new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
			);
		});

		return sorted;
	}, [category, limitedOnly, products, rarity, searchTerm, sortBy]);

	const stats = useMemo(() => {
		const total = filteredProducts.length;
		const avgPrice =
			total === 0
				? 0
				: Math.round(
						filteredProducts.reduce((sum, item) => sum + item.price, 0) / total,
					);
		const limitedCount = filteredProducts.filter(
			(item) => item.isLimited,
		).length;

		return { total, avgPrice, limitedCount };
	}, [filteredProducts]);

	return {
		status,
		statusMessage,
		filteredProducts,
		searchTerm,
		setSearchTerm,
		category,
		setCategory,
		rarity,
		setRarity,
		limitedOnly,
		setLimitedOnly,
		sortBy,
		setSortBy,
		stats,
	};
}

export function formatVnd(amount: number): string {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function getRarityLabel(rarity: MarketplaceProduct["rarity"]): string {
	if (rarity === "legendary") return "Legendary";
	if (rarity === "epic") return "Epic";
	if (rarity === "rare") return "Rare";
	return "Common";
}
