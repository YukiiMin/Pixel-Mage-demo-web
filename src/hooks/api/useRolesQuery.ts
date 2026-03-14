"use client";

import { useQuery } from "@tanstack/react-query";
import { listRoles, getRoleById } from "@/lib/api/roles";
import { queryKeys } from "@/lib/api/query-keys";

export function useRolesQuery(enabled = true) {
	return useQuery({
		queryKey: queryKeys.roles.all,
		queryFn: listRoles,
		enabled,
	});
}

export function useRoleByIdQuery(id: number, enabled = true) {
	return useQuery({
		queryKey: queryKeys.roles.detail(id),
		queryFn: () => getRoleById(id),
		enabled: enabled && id > 0,
	});
}
