"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { ProductResponse } from "@/types/commerce";

export type ShopSort = "newest" | "price-asc" | "price-desc" | "stock";

async function fetchProducts(): Promise<ProductResponse[]> {
	const res = await apiRequest<ProductResponse[]>(
		API_ENDPOINTS.productManagement.publicList,
	);
	return res.data ?? [];
}

export function useShop() {
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<ShopSort>("newest");
	const [filterLimited, setFilterLimited] = useState(false);

	const {
		data: products = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["shop-products"],
		queryFn: fetchProducts,
		staleTime: 60_000,
	});

	const filteredProducts = useMemo(() => {
		// 🔒 Chỉ hiển thị sản phẩm đang visible và active với khách hàng
		let result = products.filter((p) => p.isVisible && p.isActive);

		// Search filter
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(term) ||
					p.description.toLowerCase().includes(term),
			);
		}

		// Limited filter
		if (filterLimited) {
			result = result.filter((p) => p.isLimited);
		}

		// Sort
		result.sort((a, b) => {
			switch (sortBy) {
				case "price-asc":
					return a.price - b.price;
				case "price-desc":
					return b.price - a.price;
				case "stock":
					return b.stockCount - a.stockCount;
				case "newest":
				default:
					return b.productId - a.productId;
			}
		});

		return result;
	}, [products, searchTerm, filterLimited, sortBy]);

	const stats = useMemo(() => {
		const totalProducts = products.length;
		const totalStock = products.reduce((sum, p) => sum + p.stockCount, 0);
		const limitedCount = products.filter((p) => p.isLimited).length;

		return { totalProducts, totalStock, limitedCount };
	}, [products]);

	return {
		products: filteredProducts,
		isLoading,
		isError,
		searchTerm,
		setSearchTerm,
		sortBy,
		setSortBy,
		filterLimited,
		setFilterLimited,
		stats,
	};
}
