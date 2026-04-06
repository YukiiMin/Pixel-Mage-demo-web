import { type NextRequest, NextResponse } from "next/server";

const LOCAL_BE = (process.env.BACKEND_URL || "http://localhost:8080").replace(
	/\/$/,
	"",
);
const NGROK_BE = (process.env.BACKEND_URL_NGROK || "").replace(/\/$/, "");

function getBeBaseUrl(request: NextRequest): string {
	const selector = request.cookies.get("pm_backend_selector")?.value;

	if (selector === "ngrok" && NGROK_BE) {
		return NGROK_BE;
	}
	if (selector === "local") {
		return LOCAL_BE;
	}

	// Default fallback priority: Railway (prod) → Ngrok → Local
	return (
		process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
		NGROK_BE ||
		LOCAL_BE
	).replace(/\/$/, "");
}

const UPSTREAM_TIMEOUT_MS = 15000;

const NO_BODY_METHODS = new Set(["GET", "HEAD", "DELETE"]);

function toAuthorizationValue(token: string): string {
	const trimmed = token.trim();
	if (!trimmed) {
		return "";
	}

	return /^Bearer\s+/i.test(trimmed) ? trimmed : `Bearer ${trimmed}`;
}

function isUnsafePathSegment(segment: string): boolean {
	if (!segment) {
		return true;
	}

	if (segment === "." || segment === "..") {
		return true;
	}

	if (segment.includes("/") || segment.includes("\\")) {
		return true;
	}

	const lower = segment.toLowerCase();
	if (lower.includes("%2f") || lower.includes("%5c") || lower.includes("://")) {
		return true;
	}

	return false;
}

function isProd(): boolean {
	return process.env.NODE_ENV === "production";
}

async function attemptRefresh(request: NextRequest): Promise<string | null> {
	const refreshToken = request.cookies.get("pm_refresh_token")?.value;
	if (!refreshToken) return null;

	const beBaseUrl = getBeBaseUrl(request);
	const targetUrl = `${beBaseUrl}/api/accounts/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`;
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

	try {
		const beResponse = await fetch(targetUrl, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				accept: "application/json",
			},
			cache: "no-store",
			signal: controller.signal,
		});

		if (!beResponse.ok) return null;

		const upstreamText = await beResponse.text();
		try {
			const upstreamPayload = JSON.parse(upstreamText);
			const payloadRecord = upstreamPayload as Record<string, unknown> | null;
			const data = payloadRecord?.data as Record<string, unknown> | null;
			const newAccessToken = String(
				payloadRecord?.accessToken ?? data?.accessToken ?? "",
			)
				.trim()
				.replace(/^Bearer\s+/i, "");

			return newAccessToken || null;
		} catch {
			return null;
		}
	} catch {
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
}

async function forwardRequest(
	request: NextRequest,
	segments: string[],
): Promise<NextResponse> {
	if (!Array.isArray(segments) || segments.length === 0) {
		return NextResponse.json({ message: "Invalid API path." }, { status: 400 });
	}

	if (segments.some((segment) => isUnsafePathSegment(segment))) {
		return NextResponse.json({ message: "Invalid API path." }, { status: 400 });
	}

	const beBaseUrl = getBeBaseUrl(request);
	const bePathname = `/api/${segments.join("/")}`;
	const search = request.nextUrl.search;
	const targetUrl = `${beBaseUrl}${bePathname}${search}`;

	const method = request.method.toUpperCase();

	const baseHeaders = new Headers();
	const incomingContentType = request.headers.get("content-type");
	if (incomingContentType) {
		baseHeaders.set("content-type", incomingContentType);
	}

	const incomingAccept = request.headers.get("accept");
	if (incomingAccept) {
		baseHeaders.set("accept", incomingAccept);
	}

	const incomingCookie = request.headers.get("cookie");
	if (incomingCookie) {
		baseHeaders.set("cookie", incomingCookie);
	}

	const authorization = request.headers.get("authorization");
	const cookieToken = request.cookies.get("pm_access_token")?.value;

	if (authorization?.trim()) {
		baseHeaders.set("authorization", authorization.trim());
	} else if (cookieToken?.trim()) {
		const bearer = toAuthorizationValue(cookieToken);
		if (bearer) {
			baseHeaders.set("authorization", bearer);
		}
	}

	const body = NO_BODY_METHODS.has(method)
		? undefined
		: await request.arrayBuffer();

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

	let beResponse: Response;
	try {
		console.log(`[PROXY DEBUG] Forwarding ${method} to ${targetUrl}`);
		beResponse = await fetch(targetUrl, {
			method,
			headers: baseHeaders,
			body,
			cache: "no-store",
			redirect: "manual",
			signal: controller.signal,
		});
	} catch {
		return NextResponse.json(
			{ message: "Upstream service is unreachable." },
			{ status: 502 },
		);
	} finally {
		clearTimeout(timeoutId);
	}

	let finalResponse = beResponse;
	let newAccessTokenConfigured: string | null = null;
	let authExpired = false;

	if (beResponse.status === 401) {
		const newAccessToken = await attemptRefresh(request);
		if (newAccessToken) {
			baseHeaders.set("authorization", `Bearer ${newAccessToken}`);
			const retryController = new AbortController();
			const retryTimeoutId = setTimeout(
				() => retryController.abort(),
				UPSTREAM_TIMEOUT_MS,
			);
			try {
				const retryResponse = await fetch(targetUrl, {
					method,
					headers: baseHeaders,
					body,
					cache: "no-store",
					redirect: "manual",
					signal: retryController.signal,
				});
				finalResponse = retryResponse;
				newAccessTokenConfigured = newAccessToken;
			} catch {
				authExpired = true;
			} finally {
				clearTimeout(retryTimeoutId);
			}
		} else {
			authExpired = true;
		}
	}

	const responseBody = await finalResponse.arrayBuffer();

	const nextResponse = new NextResponse(responseBody, {
		status: finalResponse.status,
		headers: {
			"cache-control": "no-store",
		},
	});

	// Safely forward headers from backend to frontend
	finalResponse.headers.forEach((value, key) => {
		const lowerKey = key.toLowerCase();
		if (
			!["set-cookie", "content-encoding", "transfer-encoding"].includes(
				lowerKey,
			)
		) {
			nextResponse.headers.set(key, value);
		}
	});

	nextResponse.headers.set("X-Backend-URL", beBaseUrl);
	nextResponse.headers.set("X-Proxy-Status", "active");
	nextResponse.headers.set(
		"Access-Control-Expose-Headers",
		"X-Backend-URL, X-Proxy-Status",
	);

	if (newAccessTokenConfigured) {
		nextResponse.cookies.set({
			name: "pm_access_token",
			value: newAccessTokenConfigured,
			httpOnly: true,
			secure: isProd(),
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 15,
		});
	}

	if (authExpired && beResponse.status === 401) {
		nextResponse.headers.set("X-Auth-Expired", "true");
		nextResponse.cookies.delete("pm_access_token");
		nextResponse.cookies.delete("pm_logged_in");
		nextResponse.cookies.delete("pm_user_id");
		nextResponse.cookies.delete("pm_refresh_token");
	}

	return nextResponse;
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ proxy: string[] }> },
) {
	const { proxy } = await params;
	return forwardRequest(request, proxy);
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ proxy: string[] }> },
) {
	const { proxy } = await params;
	return forwardRequest(request, proxy);
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ proxy: string[] }> },
) {
	const { proxy } = await params;
	return forwardRequest(request, proxy);
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ proxy: string[] }> },
) {
	const { proxy } = await params;
	return forwardRequest(request, proxy);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ proxy: string[] }> },
) {
	const { proxy } = await params;
	return forwardRequest(request, proxy);
}
