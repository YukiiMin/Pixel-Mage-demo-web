import {
	BarChart3,
	CreditCard,
	LayoutDashboard,
	LayoutGrid,
	Link2Off,
	Package,
	User,
	Users,
} from "lucide-react";

export const sectionLinks = [
	{ label: "Tính năng", hash: "#features" },
	{ label: "Cách dùng", hash: "#how-it-works" },
	{ label: "Tải App", hash: "#download" },
];

// Always visible in nav bar (not auth-gated) - Public customer features only
export const publicNavLinks = [
	{ label: "Marketplace", href: "/marketplace" },
	{ label: "Thẻ Bài", href: "/card-gallery" },
	{ label: "Tarot AI", href: "/tarot" },
	{ label: "Câu chuyện", href: "/stories" },
];

// Staff navigation (visible when user has STAFF or ADMIN role)
export const staffNavLinks = [
	{ label: "Sản phẩm", href: "/staff/products", icon: Package },
	{ label: "Yêu cầu hủy", href: "/staff/unlink-requests", icon: Link2Off },
];

// Admin navigation (visible only when user has ADMIN role)
export const adminNavLinks = [
	{ label: "Dashboard", href: "/admin", icon: LayoutDashboard },
	{ label: "Tài khoản", href: "/admin/accounts", icon: Users },
	{ label: "Quản lý Thẻ", href: "/admin/cards", icon: CreditCard },
	{ label: "Phân tích", href: "/admin/analytics", icon: BarChart3 },
	{ label: "Theo dõi Gói", href: "/admin/pack-monitoring", icon: Package },
	{ label: "Voucher", href: "/admin/vouchers", icon: CreditCard },
	{ label: "Ví", href: "/admin/wallet", icon: CreditCard },
	{ label: "Bộ sưu tập", href: "/admin/collections", icon: LayoutGrid },
	{ label: "Thẻ vật lý", href: "/admin/physical-cards", icon: CreditCard },
	{ label: "Thành tựu", href: "/admin/achievements", icon: LayoutGrid },
];

// Only shown for authenticated users in dropdown - Account pages only
export const authDropdownLinks = [
	{ label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
	{ label: "Hồ sơ cá nhân", href: "/profile", icon: User },
	{ label: "Ví của tôi", href: "/wallet", icon: CreditCard },
	{ label: "Bộ sưu tập thẻ", href: "/my-cards", icon: CreditCard },
	{ label: "Thành tựu", href: "/achievements", icon: LayoutGrid },
	{ label: "Lịch sử đơn hàng", href: "/orders", icon: Package },
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
