import { z } from "zod";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/http";
import type { CreateRolePayload, Role, UpdateRolePayload } from "@/types/api";

const roleSchema = z.object({
	id: z.coerce.number(),
	roleName: z.string(),
});

const roleListSchema = z.array(roleSchema);

function unwrapPayload<T>(payload: T): unknown {
	if (payload && typeof payload === "object" && "data" in payload) {
		return (payload as { data: unknown }).data;
	}

	return payload;
}

function parseRole(payload: unknown): Role {
	return roleSchema.parse(unwrapPayload(payload));
}

function parseRoleList(payload: unknown): Role[] {
	const unwrapped = unwrapPayload(payload);

	if (
		unwrapped &&
		typeof unwrapped === "object" &&
		"content" in unwrapped &&
		Array.isArray((unwrapped as { content: unknown }).content)
	) {
		return roleListSchema.parse((unwrapped as { content: unknown[] }).content);
	}

	return roleListSchema.parse(unwrapped);
}

export async function listRoles(): Promise<Role[]> {
	const payload = await apiGet<unknown>("/api/roles");
	return parseRoleList(payload);
}

export async function getRoleById(id: number): Promise<Role> {
	const payload = await apiGet<unknown>(`/api/roles/${id}`);
	return parseRole(payload);
}

export async function createRole(body: CreateRolePayload): Promise<Role> {
	const payload = await apiPost<unknown>("/api/roles", body);
	return parseRole(payload);
}

export async function updateRole(
	id: number,
	body: UpdateRolePayload,
): Promise<Role> {
	const payload = await apiPut<unknown>(`/api/roles/${id}`, body);
	return parseRole(payload);
}

export async function deleteRole(id: number): Promise<void> {
	await apiDelete(`/api/roles/${id}`);
}
