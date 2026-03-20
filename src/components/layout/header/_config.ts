import { CreditCard, LayoutGrid, Package, User } from "lucide-react";

export const sectionLinks = [
	{ label: "Trang chủ", hash: "/" },
	{ label: "Tính năng", hash: "#features" },
	{ label: "Cách dùng", hash: "#how-it-works" },
	{ label: "Tải App", hash: "#download" },
];

// Always visible in nav bar (not auth-gated)
export const publicNavLinks = [{ label: "Marketplace", href: "/marketplace" }];

// Only shown in auth dropdown
export const authDropdownLinks = [
	{ label: "My Cards", href: "/my-cards", icon: CreditCard },
	{ label: "Đơn hàng", href: "/orders", icon: Package },
	{ label: "Hồ sơ", href: "/profile", icon: User },
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
