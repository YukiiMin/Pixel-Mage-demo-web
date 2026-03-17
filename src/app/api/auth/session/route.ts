import { type NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "pm_access_token";
const USER_ID_COOKIE = "pm_user_id";
const EMAIL_COOKIE = "pm_email";
const NAME_COOKIE = "pm_name";

function decodeValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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
    const payload = JSON.parse(decoded) as Record<string, unknown>;

    const userId =
      parsePositiveInt(payload.userId) ??
      parsePositiveInt(payload.accountId) ??
      parsePositiveInt(payload.customerId) ??
      parsePositiveInt(payload.id) ??
      parsePositiveInt(payload.uid) ??
      parsePositiveInt(payload.nameid) ??
      parsePositiveInt(
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      ) ??
      parsePositiveInt(
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"
        ],
      );
    const email = String(payload.email ?? payload.sub ?? "").trim() || null;
    const name = String(payload.name ?? payload.fullName ?? "").trim() || null;
    return { userId, email, name };
  } catch {
    return { userId: null, email: null, name: null };
  }
}

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const cookieUserId = parsePositiveInt(request.cookies.get(USER_ID_COOKIE)?.value);
  const email = decodeValue(request.cookies.get(EMAIL_COOKIE)?.value);
  const name = decodeValue(request.cookies.get(NAME_COOKIE)?.value);
  const decoded = extractFromJwt(token);
  const resolvedUserId = cookieUserId ?? decoded.userId ?? null;
  const resolvedEmail = email ?? decoded.email ?? null;
  const resolvedName = name ?? decoded.name ?? null;

  const res = NextResponse.json(
    {
      authenticated: true,
      userId: resolvedUserId,
      email: resolvedEmail,
      name: resolvedName,
    },
    { status: 200 },
  );

  if (resolvedUserId && !cookieUserId) {
    res.cookies.set({
      name: USER_ID_COOKIE,
      value: String(resolvedUserId),
      httpOnly: false,
      secure: isProd(),
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });
  }

  return res;
}
