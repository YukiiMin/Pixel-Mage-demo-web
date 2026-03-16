import { type NextRequest, NextResponse } from "next/server";

const BE_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
	"https://pixelmageecomerceproject-production.up.railway.app";

const NO_BODY_METHODS = new Set(["GET", "HEAD"]);

async function forwardRequest(
	request: NextRequest,
	segments: string[],
): Promise<NextResponse> {
	const bePathname = `/${segments.join("/")}`;
	const search = request.nextUrl.search;
	const targetUrl = `${BE_BASE_URL}${bePathname}${search}`;

	const method = request.method.toUpperCase();

	const forwardHeaders = new Headers();
	forwardHeaders.set("Content-Type", "application/json");

	const authorization = request.headers.get("authorization");
	if (authorization) {
		forwardHeaders.set("authorization", authorization);
	}

	const body =
		NO_BODY_METHODS.has(method)
			? undefined
			: await request.text().then((t) => t || undefined);

	let beResponse: Response;
	try {
		beResponse = await fetch(targetUrl, {
			method,
			headers: forwardHeaders,
			body,
			cache: "no-store",
		});
	} catch {
		return NextResponse.json(
			{ message: "Upstream service is unreachable." },
			{ status: 502 },
		);
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
