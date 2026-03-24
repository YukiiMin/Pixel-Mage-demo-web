import { type NextRequest, NextResponse } from "next/server";

const BE_BASE_URL = (
	process.env.API_BASE_URL ??
	process.env.BACKEND_BASE_URL ??
	process.env.NEXT_PUBLIC_API_BASE_URL ??
	"http://localhost:8080"
).replace(/\/$/, "");

const ACCESS_COOKIE = "pm_access_token";
const REFRESH_COOKIE = "pm_refresh_token";

const COOKIE_MAX_AGE_SECONDS = 60 * 15; // Access token age (15 minutes)

function isProd(): boolean {
	return process.env.NODE_ENV === "production";
}

function parseJsonSafe(text: string): unknown {
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return null;
	}
}

function normalizeAccessToken(rawToken: unknown): string | null {
	const token = String(rawToken ?? "")
		.trim()
		.replace(/^Bearer\s+/i, "");
	return token || null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

	if (!refreshToken) {
		return NextResponse.json(
			{ message: "No refresh token available." },
			{ status: 401 },
		);
	}

	let upstream: Response;
	try {
		const beUrl = `${BE_BASE_URL}/api/accounts/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`;
		upstream = await fetch(beUrl, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				accept: "application/json",
			},
			cache: "no-store",
		});
	} catch {
		return NextResponse.json(
			{ message: "Upstream service is unreachable." },
			{ status: 502 },
		);
	}

	const upstreamText = await upstream.text();
	const upstreamPayload = parseJsonSafe(upstreamText);

	if (!upstream.ok) {
		return new NextResponse(
			upstreamText || JSON.stringify({ message: "Refresh failed." }),
			{
				status: upstream.status,
				headers: {
					"content-type":
						upstream.headers.get("content-type") ?? "application/json",
				},
			},
		);
	}

	const payloadRecord = upstreamPayload as Record<string, unknown> | null;
	const data = payloadRecord?.data as Record<string, unknown> | null;
	const newAccessToken = normalizeAccessToken(
		payloadRecord?.accessToken ?? data?.accessToken,
	);

	if (!newAccessToken) {
		return NextResponse.json(
			{ message: "Refresh response missing access token." },
			{ status: 502 },
		);
	}

	const response = NextResponse.json({ refreshed: true }, { status: 200 });

	response.cookies.set({
		name: ACCESS_COOKIE,
		value: newAccessToken,
		httpOnly: true,
		secure: isProd(),
		sameSite: "lax",
		path: "/",
		maxAge: COOKIE_MAX_AGE_SECONDS, // Reset access token expiration
	});

	return response;
}
