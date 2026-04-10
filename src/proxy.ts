// src/proxy.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 1. Bỏ qua các file tĩnh và API routes (tối ưu hóa hiệu năng)
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// 2. Lấy thông tin xác thực từ Cookies đã được set bởi backend/BFF
	const isLoggedIn = request.cookies.has("pm_logged_in");
	const role =
		request.cookies.get("pm_user_role")?.value?.toUpperCase() ?? "USER";

	// 3. Phân luồng Auth Routes (Chỉ cho phép khách chưa đăng nhập)
	const authRoutes = [
		"/login",
		"/register",
		"/forgot-password",
		"/reset-password",
		"/verify",
	];
	const isAuthRoute = authRoutes.some((route) => pathname === route);

	if (isAuthRoute) {
		if (isLoggedIn) {
			// Đã đăng nhập mà cố vào login -> đẩy về trang chủ hoặc marketplace
			return NextResponse.redirect(new URL("/marketplace", request.url));
		}
		return NextResponse.next();
	}

	// 4. Định nghĩa các tập Route (Map chuẩn với Route Groups mới)
	const customerRoutes = [
		"/my-cards",
		"/orders",
		"/profile",
		"/tarot",
		"/checkout",
		"/achievements",
		"/card-gallery",
		"/stories",
		"/wallet",
	];

	// Hàm Helper để check chính xác URL gốc HOẶC các sub-URL bên trong
	const isMatch = (paths: string[], targetPath: string) => {
		return paths.some(
			(route) => targetPath === route || targetPath.startsWith(`${route}/`),
		);
	};

	const isCustomerRoute = isMatch(customerRoutes, pathname);
	const isStaffRoute = pathname === "/staff" || pathname.startsWith("/staff/");
	const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

	// 5. Logic Bảo Vệ Route (RBAC Guards)
	if (isCustomerRoute || isStaffRoute || isAdminRoute) {
		// Chốt chặn 1: Bắt buộc đăng nhập cho mọi protected routes
		if (!isLoggedIn) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		// Chốt chặn 2: Phân quyền Staff
		if (isStaffRoute) {
			if (role !== "STAFF" && role !== "ADMIN") {
				return NextResponse.redirect(new URL("/marketplace", request.url));
			}
		}

		// Chốt chặn 3: Phân quyền Admin (Khắt khe nhất)
		if (isAdminRoute) {
			if (role === "STAFF") {
				return NextResponse.redirect(new URL("/staff", request.url)); // Staff đi lạc vào Admin -> Đẩy về Staff
			}
			if (role !== "ADMIN") {
				return NextResponse.redirect(new URL("/marketplace", request.url)); // Customer đi lạc vào Admin -> Đẩy về public
			}
		}
	}

	// Hợp lệ, cho phép đi tiếp
	return NextResponse.next();
}

// Cấu hình Matcher cho Next.js Middleware để chặn ở tầng Edge tối ưu nhất
export const config = {
	matcher: [
		/*
		 * Match tất cả request paths ngoại trừ:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
