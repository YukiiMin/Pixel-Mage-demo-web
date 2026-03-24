import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Ignore static files and api routes
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	const isLoggedIn = request.cookies.has("pm_logged_in");

	// 1. Auth routes (login/register)
	if (
		pathname === "/login" ||
		pathname === "/register" ||
		pathname.startsWith("/auth/")
	) {
		if (isLoggedIn) {
			return NextResponse.redirect(new URL("/marketplace", request.url));
		}
		return NextResponse.next();
	}

	// 2. Protected routes prefixes
	const customerRoutes = [
		"/my-cards",
		"/orders",
		"/profile",
		"/tarot",
		"/stories",
		"/achievements",
		"/wallet",
	];

	const isCustomerRoute = customerRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
	const isStaffRoute = pathname === "/staff" || pathname.startsWith("/staff/");
	const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

	if (!isCustomerRoute && !isStaffRoute && !isAdminRoute) {
		return NextResponse.next();
	}

	// If it's a protected route and not logged in
	if (!isLoggedIn) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// We only need role for staff/admin routes
	if (isStaffRoute || isAdminRoute) {
		const role =
			request.cookies.get("pm_user_role")?.value?.toUpperCase() ?? "CUSTOMER";

		if (isAdminRoute) {
			if (role === "STAFF") {
				return NextResponse.redirect(new URL("/staff", request.url));
			}
			if (role !== "ADMIN") {
				return NextResponse.redirect(new URL("/marketplace", request.url));
			}
		}

		if (isStaffRoute) {
			if (role !== "STAFF" && role !== "ADMIN") {
				return NextResponse.redirect(new URL("/marketplace", request.url));
			}
		}
	}

	return NextResponse.next();
}
