"use client";

import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { useQuery } from "@tanstack/react-query";
import type { AccountRow, PageData } from "../types";

interface UseAccountsOptions {
	page?: number;
	pageSize?: number;
	roleFilter?: "ALL" | "USER" | "STAFF" | "ADMIN";
}

// Normalize role string
function normalizeRole(rawRole?: { roleName?: string } | string): string {
	const roleValue =
		typeof rawRole === "string"
			? rawRole
			: typeof rawRole === "object" && rawRole
				? rawRole.roleName
				: undefined;
	return (roleValue || "USER").replace("ROLE_", "").toUpperCase();
}

// Fetch accounts list
async function fetchAccounts(options: UseAccountsOptions): Promise<{
	accounts: AccountRow[];
	totalPages: number;
	totalElements: number;
}> {
	const { page = 0, pageSize = 15, roleFilter = "ALL" } = options;

	const params = new URLSearchParams({
		page: String(page),
		size: String(pageSize),
	});
	if (roleFilter !== "ALL") params.set("role", roleFilter);

	const res = await apiRequest<PageData | AccountRow[]>(
		`${API_ENDPOINTS.accountManagement.list}?${params}`,
		{ method: "GET" },
	);

	const d = res.data;
	if (d && "content" in d) {
		const pageData = d as PageData;
		const normalized = (pageData.content ?? []).map((acc: AccountRow) => ({
			...acc,
			id: acc.id ?? acc.customerId ?? acc.email ?? "unknown",
			roleName: normalizeRole(acc.roleName || acc.role),
			active: Boolean(acc.active ?? acc.isActive),
			emailVerified: acc.emailVerified ?? true,
		}));
		return {
			accounts: normalized,
			totalPages: pageData.totalPages ?? 1,
			totalElements: pageData.totalElements ?? normalized.length,
		};
	} else if (Array.isArray(d)) {
		const normalized = d.map((acc: AccountRow) => ({
			...acc,
			id: acc.id ?? acc.customerId ?? acc.email ?? "unknown",
			roleName: normalizeRole(acc.roleName || acc.role),
			active: Boolean(acc.active ?? acc.isActive),
			emailVerified: acc.emailVerified ?? true,
		}));
		return {
			accounts: normalized,
			totalPages: 1,
			totalElements: normalized.length,
		};
	}

	return { accounts: [], totalPages: 1, totalElements: 0 };
}

export function useAccounts(options: UseAccountsOptions = {}) {
	const { page = 0, pageSize = 15, roleFilter = "ALL" } = options;

	return useQuery({
		queryKey: ["accounts", "list", page, pageSize, roleFilter],
		queryFn: () => fetchAccounts(options),
		staleTime: 30_000,
	});
}
