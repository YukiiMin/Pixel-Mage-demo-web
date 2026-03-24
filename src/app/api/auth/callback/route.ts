import { type NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "pm_access_token";
const REFRESH_COOKIE = "pm_refresh_token";
const LOGIN_COOKIE = "pm_logged_in";
const EMAIL_COOKIE = "pm_email";
const NAME_COOKIE = "pm_name";
const USER_ID_COOKIE = "pm_user_id";

const COOKIE_MAX_AGE_SECONDS = 60 * 15; // 15 minutes for access token

function isProd(): boolean {
	return process.env.NODE_ENV === "production";
}

function parsePositiveInt(value: unknown): number | null {
	const parsed = Number(value ?? 0);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function extractFromJwt(token: string): {
	userId: number | null;
	email: string | null;
	name: string | null;
} {
	try {
		const payloadPart = token.split(".")[1];
		if (!payloadPart) {
			return { userId: null, email: null, name: null };
		}
		const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
		const decoded = Buffer.from(padded, "base64").toString("utf8");
		const jwtPayload = JSON.parse(decoded) as Record<string, unknown>;

		const userId =
			parsePositiveInt(jwtPayload.userId) ??
			parsePositiveInt(jwtPayload.accountId) ??
			parsePositiveInt(jwtPayload.customerId) ??
			parsePositiveInt(jwtPayload.id) ??
			parsePositiveInt(jwtPayload.uid) ??
			parsePositiveInt(jwtPayload.nameid) ??
			parsePositiveInt(
				jwtPayload[
					"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
				],
			) ??
			parsePositiveInt(
				jwtPayload[
					"http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"
				],
			);
		const email =
			String(jwtPayload.email ?? jwtPayload.sub ?? "").trim() || null;
		const name =
			String(jwtPayload.name ?? jwtPayload.fullName ?? "").trim() || null;
		return { userId, email, name };
	} catch {
		return { userId: null, email: null, name: null };
	}
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	const data = await request.json();
	const { accessToken, refreshToken, email, name } = data;

	if (!accessToken) {
		return NextResponse.json(
			{ message: "Missing access token." },
			{ status: 400 },
		);
	}

	const response = NextResponse.json({ success: true }, { status: 200 });

	response.cookies.set({
		name: ACCESS_COOKIE,
		value: accessToken,
		httpOnly: true,
		secure: isProd(),
		sameSite: "lax",
		path: "/",
		maxAge: COOKIE_MAX_AGE_SECONDS,
	});

	if (refreshToken) {
		response.cookies.set({
			name: REFRESH_COOKIE,
			value: refreshToken,
			httpOnly: true,
			secure: isProd(),
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 30, // 30 days
		});
	}

	response.cookies.set({
		name: LOGIN_COOKIE,
		value: "1",
		httpOnly: false,
		secure: isProd(),
		sameSite: "lax",
		path: "/",
		maxAge: COOKIE_MAX_AGE_SECONDS,
	});

	if (email) {
		response.cookies.set({
			name: EMAIL_COOKIE,
			value: encodeURIComponent(email),
			httpOnly: true,
			secure: isProd(),
			sameSite: "lax",
			path: "/",
			maxAge: COOKIE_MAX_AGE_SECONDS,
		});
	}

	if (name) {
		response.cookies.set({
			name: NAME_COOKIE,
			value: encodeURIComponent(name),
			httpOnly: true,
			secure: isProd(),
			sameSite: "lax",
			path: "/",
			maxAge: COOKIE_MAX_AGE_SECONDS,
		});
	}

	const { userId } = extractFromJwt(accessToken);
	if (userId) {
		response.cookies.set({
			name: USER_ID_COOKIE,
			value: String(userId),
			httpOnly: false,
			secure: isProd(),
			sameSite: "lax",
			path: "/",
			maxAge: COOKIE_MAX_AGE_SECONDS,
		});
	}

	return response;
}
