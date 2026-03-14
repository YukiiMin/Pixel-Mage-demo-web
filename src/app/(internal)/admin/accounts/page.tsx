"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestState } from "@/components/ui/request-state";
import { useAccountsQuery } from "@/hooks/api/useAccountsQuery";
import { hasAccessToken } from "@/lib/auth/session";

export default function AdminAccountsPage() {
	const authenticated = hasAccessToken();
	const accountsQuery = useAccountsQuery(authenticated);

	const totalAccounts = useMemo(
		() => accountsQuery.data?.length ?? 0,
		[accountsQuery.data],
	);

	if (!authenticated) {
		return (
			<RequestState
				variant="error"
				title="Authentication required"
				description="Please login first. This page reads protected account APIs."
			/>
		);
	}

	if (accountsQuery.isLoading) {
		return <RequestState variant="loading" title="Loading accounts..." />;
	}

	if (accountsQuery.isError) {
		return (
			<RequestState
				variant="error"
				title="Unable to load accounts"
				description="The account service is unavailable or your token expired."
				actionLabel="Retry"
				onAction={() => accountsQuery.refetch()}
			/>
		);
	}

	if (!accountsQuery.data || accountsQuery.data.length === 0) {
		return (
			<RequestState
				title="No accounts found"
				description="Create or import accounts to start managing users."
			/>
		);
	}

	return (
		<div className="space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Admin Accounts</h1>
				<p className="text-sm text-muted-foreground">
					Connected to <code>/api/accounts</code> with protected auth flow.
				</p>
			</header>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Total accounts: <span className="font-semibold text-foreground">{totalAccounts}</span>
					</p>
				</CardContent>
			</Card>

			<div className="overflow-hidden rounded-lg border border-border/70">
				<table className="w-full text-left text-sm">
					<thead className="bg-muted/30">
						<tr>
							<th className="px-4 py-3 font-medium">ID</th>
							<th className="px-4 py-3 font-medium">Email</th>
							<th className="px-4 py-3 font-medium">Name</th>
							<th className="px-4 py-3 font-medium">Provider</th>
							<th className="px-4 py-3 font-medium">Role ID</th>
						</tr>
					</thead>
					<tbody>
						{accountsQuery.data.map((account) => (
							<tr key={account.id} className="border-t border-border/50">
								<td className="px-4 py-3">{account.id}</td>
								<td className="px-4 py-3">{account.email}</td>
								<td className="px-4 py-3">{account.name || "-"}</td>
								<td className="px-4 py-3">{account.provider || "LOCAL"}</td>
								<td className="px-4 py-3">{account.roleId ?? "-"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
