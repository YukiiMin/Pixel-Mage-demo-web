"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccountById, listAccounts } from "@/lib/api/accounts";
import { queryKeys } from "@/lib/api/query-keys";

export function useAccountsQuery(enabled = true) {
	return useQuery({
		queryKey: queryKeys.accounts.all,
		queryFn: listAccounts,
		enabled,
	});
}

export function useAccountByIdQuery(id: number, enabled = true) {
	return useQuery({
		queryKey: queryKeys.accounts.detail(id),
		queryFn: () => getAccountById(id),
		enabled: enabled && id > 0,
	});
}
