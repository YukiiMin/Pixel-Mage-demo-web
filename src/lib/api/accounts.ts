import { z } from "zod";
import { apiGet, apiPost, apiPut } from "@/lib/api/http";
import type {
	Account,
	AuthPayload,
	LoginPayload,
	RegistrationPayload,
	UpdateAccountPayload,
} from "@/types/api";

const accountSchema = z.object({
	id: z.coerce.number(),
	email: z.string(),
	name: z.string().default(""),
	phoneNumber: z.string().nullable().optional().default(null),
	roleId: z.coerce.number().nullable().optional().default(null),
	provider: z.string().nullable().optional().default(null),
});

const accountListSchema = z.array(accountSchema);

function unwrapPayload<T>(payload: T): unknown {
	if (payload && typeof payload === "object" && "data" in payload) {
		return (payload as { data: unknown }).data;
	}

	return payload;
}

function parseAccountList(payload: unknown): Account[] {
	const unwrapped = unwrapPayload(payload);

	if (
		unwrapped &&
		typeof unwrapped === "object" &&
		"content" in unwrapped &&
		Array.isArray((unwrapped as { content: unknown }).content)
	) {
		return accountListSchema.parse((unwrapped as { content: unknown[] }).content);
	}

	return accountListSchema.parse(unwrapped);
}

function parseAccount(payload: unknown): Account {
	const unwrapped = unwrapPayload(payload);
	return accountSchema.parse(unwrapped);
}

export async function listAccounts(): Promise<Account[]> {
	const payload = await apiGet<unknown>("/api/accounts");
	return parseAccountList(payload);
}

export async function getAccountById(id: number): Promise<Account> {
	const payload = await apiGet<unknown>(`/api/accounts/${id}`);
	return parseAccount(payload);
}

export async function updateAccount(
	id: number,
	body: UpdateAccountPayload,
): Promise<Account> {
	const payload = await apiPut<unknown>(`/api/accounts/${id}`, body);
	return parseAccount(payload);
}

export async function registerAccount(
	body: RegistrationPayload,
): Promise<Account> {
	const payload = await apiPost<unknown>("/api/accounts/registration", body, {
		auth: false,
	});
	return parseAccount(payload);
}

export async function login(body: LoginPayload): Promise<AuthPayload> {
	const payload = await apiPost<unknown>("/api/accounts/login", body, {
		auth: false,
	});

	const unwrapped = unwrapPayload(payload);

	if (typeof unwrapped === "string") {
		return { token: unwrapped };
	}

	if (unwrapped && typeof unwrapped === "object") {
		const tokenCandidate =
			(unwrapped as { token?: unknown }).token ??
			(unwrapped as { accessToken?: unknown }).accessToken;

		if (typeof tokenCandidate === "string") {
			const accountCandidate =
				"account" in unwrapped
					? accountSchema.safeParse(
						(unwrapped as { account?: unknown }).account,
					)
					: null;

			return {
				token: tokenCandidate,
				account: accountCandidate?.success ? accountCandidate.data : undefined,
			};
		}
	}

	throw new Error("Login response does not contain a token.");
}

export async function logout(): Promise<void> {
	await apiPost("/api/accounts/auth/logout", {});
}
