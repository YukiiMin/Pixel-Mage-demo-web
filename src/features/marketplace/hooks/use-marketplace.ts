"use client";

import { useMemo, useState } from "react";
import type { Pack, ProductCategory, Rarity } from "@/types/commerce";
import { usePacks } from "./use-packs";

export type ProductSort = "newest" | "price-asc" | "price-desc";
export type MarketplaceStatus = "idle" | "loading" | "ready" | "error";

export function useMarketplace() {
	const { data: packs = [], isLoading, isError, error } = usePacks();

	const status: MarketplaceStatus = isLoading
		? "loading"
		: isError
			? "error"
			: "ready";

	// Determine status message
	let statusMessage = "";
	if (isLoading) {
		statusMessage = "Đang tải sản phẩm từ hệ thống...";
	} else if (isError) {
		const errObj = error as { status?: number };
		if (errObj && errObj.status === 401) {
			statusMessage = "Bạn cần đăng nhập để truy cập ưu đãi.";
		} else if (errObj && errObj.status === 403) {
			statusMessage = "Tài khoản hiện tại chưa có quyền truy cập.";
		} else {
			statusMessage = "Không thể tải dữ liệu marketplace từ BE.";
		}
	}

	const [searchTerm, setSearchTerm] = useState("");
	// Category left here for API compatibility or future product mixed usage,
	// but for packs it might just be ignored.
	const [category, setCategory] = useState<ProductCategory | "all">("all");
	const [rarity, setRarity] = useState<Rarity | "all">("all");
	const [limitedOnly, setLimitedOnly] = useState(false);
	const [sortBy, setSortBy] = useState<ProductSort>("newest");

	const filteredPacks = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		const result = packs.filter((pack) => {
			// 🔒 Chỉ hiển thị sản phẩm đang visible và active với khách hàng
			if (!pack.isVisible || !pack.isActive) return false;
			const matchLimited = !limitedOnly || pack.isLimited;
			const matchSearch =
				normalizedSearch.length === 0 ||
				pack.name.toLowerCase().includes(normalizedSearch) ||
				pack.description.toLowerCase().includes(normalizedSearch);

			return matchLimited && matchSearch;
		});

		const sorted = [...result].sort((a, b) => {
			if (sortBy === "price-asc") {
				return a.price - b.price;
			}
			if (sortBy === "price-desc") {
				return b.price - a.price;
			}
			return b.productId - a.productId;
		});

		return sorted;
	}, [limitedOnly, packs, searchTerm, sortBy]);

	const stats = useMemo(() => {
		const total = filteredPacks.length;
		const avgPrice =
			total === 0
				? 0
				: Math.round(
						filteredPacks.reduce((sum, item) => sum + item.price, 0) / total,
					);
		const limitedCount = filteredPacks.filter((item) => item.isLimited).length;

		return { total, avgPrice, limitedCount };
	}, [filteredPacks]);

	return {
		status,
		statusMessage,
		filteredPacks, // Renamed from filteredProducts
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

export function getRarityLabel(rarity: string): string {
	if (rarity === "LEGENDARY") return "Legendary";
	if (rarity === "RARE") return "Rare";
	return "Common";
}
