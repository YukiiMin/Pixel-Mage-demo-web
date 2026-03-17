import { type NextRequest, NextResponse } from "next/server";

const BE_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.BACKEND_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080"
).replace(/\/$/, "");

const ACCESS_COOKIE = "pm_access_token";
const LOGIN_COOKIE = "pm_logged_in";
const USER_ID_COOKIE = "pm_user_id";
const EMAIL_COOKIE = "pm_email";
const NAME_COOKIE = "pm_name";

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

function clearCookie(response: NextResponse, name: string): void {
  response.cookies.set({
    name,
    value: "",
    httpOnly: name !== LOGIN_COOKIE,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const incomingCookie = request.headers.get("cookie");

  if (token || incomingCookie) {
    try {
      const headers = new Headers();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      if (incomingCookie) {
        headers.set("cookie", incomingCookie);
      }

      await fetch(`${BE_BASE_URL}/api/accounts/auth/logout`, {
        method: "POST",
        headers,
        cache: "no-store",
      });
    } catch {
      // Ignore upstream logout failures and clear local session anyway.
    }
  }

  const response = NextResponse.json({ authenticated: false }, { status: 200 });
  clearCookie(response, ACCESS_COOKIE);
  clearCookie(response, LOGIN_COOKIE);
  clearCookie(response, USER_ID_COOKIE);
  clearCookie(response, EMAIL_COOKIE);
  clearCookie(response, NAME_COOKIE);

  return response;
}
