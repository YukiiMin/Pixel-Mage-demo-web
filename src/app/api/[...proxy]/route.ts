import { type NextRequest, NextResponse } from "next/server";

const BE_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.BACKEND_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080"
).replace(/\/$/, "");

const UPSTREAM_TIMEOUT_MS = 15000;

const NO_BODY_METHODS = new Set(["GET", "HEAD"]);

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

  const bePathname = `/api/${segments.join("/")}`;
  const search = request.nextUrl.search;
  const targetUrl = `${BE_BASE_URL}${bePathname}${search}`;

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
    : await request.text().then((t) => t || undefined);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let beResponse: Response;
  try {
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

  const responseText = await beResponse.text();
  const contentType =
    beResponse.headers.get("content-type") ?? "application/json";

  return new NextResponse(responseText, {
    status: beResponse.status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
    },
  });
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
