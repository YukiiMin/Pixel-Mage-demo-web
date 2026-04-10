"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { AccountRow, CardItem, OrderItem, UserStats } from "../types";

interface AccountDetailResult {
	account: AccountRow | null;
	stats: UserStats | null;
}

// Fetch detailed account info
async function fetchAccountDetail(
	accountId: number | string,
): Promise<AccountRow | null> {
	try {
		const res = await apiRequest<AccountRow>(
			API_ENDPOINTS.accountManagement.byId(accountId),
			{ method: "GET" },
		);
		return res.data;
	} catch (err) {
		console.error("Failed to fetch account detail:", err);
		return null;
	}
}

// Fetch user statistics from real APIs
async function fetchUserStats(
	userId: number | string,
): Promise<UserStats | null> {
	try {
		// Fetch user's owned cards
		const cardsRes = await apiRequest<CardItem[]>(
			API_ENDPOINTS.collections.ownedCards(userId),
			{ method: "GET" },
		).catch(() => ({ data: [] as CardItem[] }));

		const cards = cardsRes.data ?? [];
		const cardsByRarity = {
			legendary: cards.filter((c: CardItem) => c.rarity === "LEGENDARY").length,
			rare: cards.filter((c: CardItem) => c.rarity === "RARE").length,
			common: cards.filter((c: CardItem) => c.rarity === "COMMON").length,
		};

		// Fetch user's orders
		const ordersRes = await apiRequest<OrderItem[]>(
			API_ENDPOINTS.orderManagement.byCustomer(userId),
			{ method: "GET" },
		).catch(() => ({ data: [] as OrderItem[] }));

		const orders = ordersRes.data ?? [];
		const totalSpent = orders
			.filter((o: OrderItem) => o.status === "PAID" || o.status === "COMPLETED")
			.reduce((sum: number, o: OrderItem) => sum + (o.totalAmount || 0), 0);

		// Fetch wallet balance (admin endpoint)
		const walletRes = await apiRequest<{ balance?: number }>(
			API_ENDPOINTS.wallet.adminById(userId),
			{ method: "GET" },
		).catch(() => ({ data: { balance: 0 } }));

		return {
			digitalCardsCount: cards.length,
			cardsByRarity,
			totalOrdersCount: orders.length,
			totalSpent,
			walletBalance: walletRes.data?.balance ?? 0,
		};
	} catch (err) {
		console.error("Failed to fetch user stats:", err);
		return null;
	}
}

// Combined fetch: account + stats in parallel
async function fetchAccountWithStats(
	account: AccountRow,
): Promise<AccountDetailResult> {
	const userId = account.customerId ?? account.id;

	const [detail, stats] = await Promise.all([
		fetchAccountDetail(userId),
		fetchUserStats(userId),
	]);

	return {
		account: detail
			? {
					...account,
					...detail,
					roleName: detail.roleName || account.roleName || "USER",
					active: Boolean(detail.active ?? detail.isActive ?? account.active),
					emailVerified: detail.emailVerified ?? account.emailVerified ?? true,
				}
			: account,
		stats,
	};
}

interface UseAccountDetailOptions {
	account: AccountRow | null;
	enabled?: boolean;
}

export function useAccountDetail(options: UseAccountDetailOptions) {
	const { account, enabled = true } = options;

	return useQuery({
		queryKey: ["accounts", "detail", account?.id],
		queryFn: () =>
			account ? fetchAccountWithStats(account) : { account: null, stats: null },
		enabled: !!account?.id && enabled,
		staleTime: 30_000,
	});
}
