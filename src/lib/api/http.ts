import { clearAccessToken, getAccessToken } from "@/lib/auth/session";

const DEFAULT_API_BASE_URL =
	"https://pixelmageecomerceproject-production.up.railway.app";

type Primitive = string | number | boolean;

type RequestQuery = Record<string, Primitive | Primitive[] | null | undefined>;

interface RequestOptions {
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	body?: unknown;
	query?: RequestQuery;
	headers?: HeadersInit;
	auth?: boolean;
	cache?: RequestCache;
	signal?: AbortSignal;
}

export class ApiError extends Error {
	status: number;
	data: unknown;

	constructor(status: number, message: string, data: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
	}
}

function getBaseUrl() {
	return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function appendQuery(path: string, query?: RequestQuery) {
	if (!query) return path;

	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(query)) {
		if (value == null) continue;

		if (Array.isArray(value)) {
			for (const item of value) {
				params.append(key, String(item));
			}
			continue;
		}

		params.set(key, String(value));
	}

	const queryString = params.toString();
	if (!queryString) return path;

	return `${path}${path.includes("?") ? "&" : "?"}${queryString}`;
}

async function parseResponseBody(response: Response) {
	const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

	if (contentType.includes("application/json")) {
		return response.json();
	}

	const text = await response.text();
	return text.length > 0 ? text : null;
}

export async function apiRequest<T>(
	path: string,
	{
		method = "GET",
		body,
		query,
		headers,
		auth = true,
		cache = "no-store",
		signal,
	}: RequestOptions = {},
): Promise<T> {
	const requestPath = appendQuery(path, query);
	const url = `${getBaseUrl()}${requestPath}`;

	const requestHeaders = new Headers(headers);
	requestHeaders.set("Accept", "application/json");

	if (body !== undefined) {
		requestHeaders.set("Content-Type", "application/json");
	}

	if (auth) {
		const token = getAccessToken();
		if (token) {
			requestHeaders.set("Authorization", `Bearer ${token}`);
		}
	}

	const response = await fetch(url, {
		method,
		headers: requestHeaders,
		body: body === undefined ? undefined : JSON.stringify(body),
		cache,
		signal,
	});

	const data = await parseResponseBody(response);

	if (!response.ok) {
		if (response.status === 401) {
			clearAccessToken();
		}

		throw new ApiError(
			response.status,
			`Request failed with status ${response.status}`,
			data,
		);
	}

	return data as T;
}

export const apiGet = <T>(path: string, options?: Omit<RequestOptions, "method">) =>
	apiRequest<T>(path, { ...options, method: "GET" });

export const apiPost = <T>(
	path: string,
	body?: unknown,
	options?: Omit<RequestOptions, "method" | "body">,
) => apiRequest<T>(path, { ...options, method: "POST", body });

export const apiPut = <T>(
	path: string,
	body?: unknown,
	options?: Omit<RequestOptions, "method" | "body">,
) => apiRequest<T>(path, { ...options, method: "PUT", body });

export const apiDelete = <T>(
	path: string,
	options?: Omit<RequestOptions, "method">,
) => apiRequest<T>(path, { ...options, method: "DELETE" });
