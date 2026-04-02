import { BarChart3, CreditCard, LayoutDashboard, LayoutGrid, Link2Off, Package, User, Users } from "lucide-react";

export const sectionLinks = [
	{ label: "Trang chủ", hash: "/" },
	{ label: "Tính năng", hash: "#features" },
	{ label: "Cách dùng", hash: "#how-it-works" },
	{ label: "Tải App", hash: "#download" },
];

// Always visible in nav bar (not auth-gated)
export const publicNavLinks = [
	{ label: "Marketplace", href: "/marketplace" },
	{ label: "Explore Deck", href: "/tarot" },
];

// Only shown for authenticated users in dropdown
export const authDropdownLinks = [
	{ label: "My Reading", href: "/tarot", icon: LayoutGrid },
	{ label: "My Cards", href: "/my-cards", icon: CreditCard },
	{ label: "Đơn hàng", href: "/orders", icon: Package },
	{ label: "Hồ sơ", href: "/profile", icon: User },
];

/** Links for STAFF role (cả STAFF lẫn ADMIN đều thấy) */
export const staffNavLinks = [
	{ label: "Gacha Products", href: "/staff/products", icon: Package },
	{ label: "Unlink Requests", href: "/staff/unlink-requests", icon: Link2Off },
];

/** Links chỉ dành cho ADMIN */
export const adminNavLinks = [
	{ label: "Dashboard", href: "/staff/admin", icon: LayoutDashboard },
	{ label: "Accounts", href: "/staff/admin/accounts", icon: Users },
	{ label: "Card Manager", href: "/staff/admin/cards", icon: CreditCard },
	{ label: "Analytics", href: "/staff/admin/analytics", icon: BarChart3 },
];

export const authAvatarIcon = LayoutGrid;

export function resolveSectionHref(pathname: string, hash: string): string {
	if (!hash.startsWith("#")) return hash;
	return pathname === "/" ? hash : `/${hash}`;
}

export function getInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

