import { type NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "pm_access_token";
const REFRESH_COOKIE = "pm_refresh_token";
const LOGIN_COOKIE = "pm_logged_in";
const EMAIL_COOKIE = "pm_email";
const NAME_COOKIE = "pm_name";

const COOKIE_MAX_AGE_SECONDS = 60 * 15; // 15 minutes for access token

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
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

  return response;
}
