"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestState } from "@/components/ui/request-state";
import { useRolesQuery } from "@/hooks/api/useRolesQuery";
import { hasAccessToken } from "@/lib/auth/session";

export default function AdminRolesPage() {
	const authenticated = hasAccessToken();
	const rolesQuery = useRolesQuery(authenticated);

	const totalRoles = useMemo(() => rolesQuery.data?.length ?? 0, [rolesQuery.data]);

	if (!authenticated) {
		return (
			<RequestState
				variant="error"
				title="Authentication required"
				description="Please login first. This page reads protected roles APIs."
			/>
		);
	}

	if (rolesQuery.isLoading) {
		return <RequestState variant="loading" title="Loading roles..." />;
	}

	if (rolesQuery.isError) {
		return (
			<RequestState
				variant="error"
				title="Unable to load roles"
				description="The roles service is unavailable or your token expired."
				actionLabel="Retry"
				onAction={() => rolesQuery.refetch()}
			/>
		);
	}

	if (!rolesQuery.data || rolesQuery.data.length === 0) {
		return (
			<RequestState
				title="No roles found"
				description="Create roles to start managing account permissions."
			/>
		);
	}

	return (
		<div className="space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Admin Roles</h1>
				<p className="text-sm text-muted-foreground">
					Connected to <code>/api/roles</code> with protected auth flow.
				</p>
			</header>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Total roles: <span className="font-semibold text-foreground">{totalRoles}</span>
					</p>
				</CardContent>
			</Card>

			<div className="overflow-hidden rounded-lg border border-border/70">
				<table className="w-full text-left text-sm">
					<thead className="bg-muted/30">
						<tr>
							<th className="px-4 py-3 font-medium">ID</th>
							<th className="px-4 py-3 font-medium">Role Name</th>
						</tr>
					</thead>
					<tbody>
						{rolesQuery.data.map((role) => (
							<tr key={role.id} className="border-t border-border/50">
								<td className="px-4 py-3">{role.id}</td>
								<td className="px-4 py-3">{role.roleName}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
