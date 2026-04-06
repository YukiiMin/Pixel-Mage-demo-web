"use client";

import { getInitials } from "@/components/layout/header/_config";
import { useProfile } from "@/features/auth/hooks/use-auth";
import {
    clearStoredAuthSession,
    getStoredUserId,
    getStoredUserRole,
    hasStoredAuthSession,
} from "@/lib/api-config";
import {
    BarChart3,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    LayoutDashboard,
    Link2Off,
    LogOut,
    NfcIcon,
    Package,
    Settings,
    Sparkles,
    Ticket,
    Trophy,
    Users,
    Wallet
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ────────────────────────────────────────────
// Navigation config per role
// ────────────────────────────────────────────
const staffLinks = [
	{ label: "Gacha Products", href: "/staff/products", icon: Package },
	{ label: "Unlink Requests", href: "/staff/unlink-requests", icon: Link2Off },
];

const adminOnlyLinks = [
	{ label: "Dashboard", href: "/staff/admin", icon: LayoutDashboard },
	{ label: "Accounts", href: "/staff/admin/accounts", icon: Users },
	{ label: "Wallet Management", href: "/staff/admin/wallet", icon: Wallet },
	{ label: "Card Management", href: "/staff/admin/cards", icon: CreditCard },
	{
		label: "Physical Cards",
		href: "/staff/admin/physical-cards",
		icon: NfcIcon,
	},
	{ label: "Collections", href: "/staff/admin/collections", icon: BookOpen },
	{ label: "Vouchers", href: "/staff/admin/vouchers", icon: Ticket },
	{ label: "Achievements", href: "/staff/admin/achievements", icon: Trophy },
	{ label: "Analytics", href: "/staff/admin/analytics", icon: BarChart3 },
	{ label: "Pack Monitoring", href: "/staff/admin/pack-monitoring", icon: Package },
];

// ────────────────────────────────────────────
// Staff Shell
// ────────────────────────────────────────────
export function StaffShell({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();

	const [userId, setUserId] = useState<number | null>(null);
	const [role, setRole] = useState<string | null>(null);
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (!hasStoredAuthSession()) {
			router.replace("/login");
			return;
		}
		const storedRole = getStoredUserRole();
		if (storedRole !== "STAFF" && storedRole !== "ADMIN") {
			router.replace("/");
			return;
		}
		setRole(storedRole);
		setUserId(getStoredUserId());
	}, [router]);

	const { data: profile } = useProfile(userId);
	const displayName = profile?.name || profile?.email || "...";
	const initials = displayName !== "..." ? getInitials(displayName) : "??";

	// --- Sync role if profile returns a different one ---
	useEffect(() => {
		if (profile?.role && profile.role !== role) {
			setRole(profile.role);
		}
	}, [profile, role]);

	const handleLogout = () => {
		clearStoredAuthSession();
		router.push("/login");
	};

	const isAdmin = role === "ADMIN";
	const navLinks = [...(isAdmin ? adminOnlyLinks : []), ...staffLinks];

	const NavItem = ({
		href,
		icon: Icon,
		label,
	}: {
		href: string;
		icon: React.ElementType;
		label: string;
	}) => {
		// Fix: don't highlight Dashboard if we are in a sub-item like /accounts
		const isRootAdmin = href === "/staff/admin";
		const active = isRootAdmin
			? pathname === href
			: pathname === href || pathname.startsWith(href + "/");

		return (
			<Link
				href={href}
				onClick={() => setMobileOpen(false)}
				className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
					active
						? "gradient-gold-purple-bg text-primary-foreground shadow-[0_0_12px_rgba(168,85,247,0.4)]"
						: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
				}`}
			>
				<Icon className="h-4 w-4 shrink-0" />
				{!collapsed && <span>{label}</span>}
			</Link>
		);
	};

	const Sidebar = () => (
		<aside
			className={`flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${
				collapsed ? "w-16" : "w-60"
			}`}
		>
			{/* Logo */}
			<div
				className={`flex h-16 items-center border-b border-sidebar-border px-4 ${
					collapsed ? "justify-center" : "justify-between"
				}`}
			>
				{!collapsed && (
					<Link href="/" className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-primary" />
						<span
							className="text-lg font-bold gradient-gold-purple"
							style={{ fontFamily: "var(--font-heading)" }}
						>
							PixelMage
						</span>
					</Link>
				)}
				<button
					type="button"
					onClick={() => setCollapsed((c) => !c)}
					className="rounded-lg p-1.5 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
					aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
				>
					{collapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
				</button>
			</div>

			{/* Role badge */}
			{!collapsed && (
				<div className="px-4 py-3">
					<span
						className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
							isAdmin
								? "bg-primary/20 text-primary"
								: "bg-secondary/20 text-secondary-foreground"
						}`}
					>
						<Settings className="h-3 w-3" />
						{isAdmin ? "Admin" : "Staff"}
					</span>
				</div>
			)}

			{/* Nav */}
			<nav className="flex-1 space-y-1 overflow-y-auto p-3">
				{navLinks.map((link) => (
					<NavItem key={link.href} {...link} />
				))}
			</nav>

			{/* User info + logout */}
			<div className="border-t border-sidebar-border p-3">
				{!collapsed ? (
					<div className="flex items-center gap-2.5 rounded-xl p-2">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-gold-purple-bg text-xs font-bold text-primary-foreground">
							{initials}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-xs font-semibold text-foreground">
								{displayName}
							</p>
							<p className="truncate text-[10px] text-muted-foreground">
								{profile?.email}
							</p>
						</div>
						<button
							type="button"
							onClick={handleLogout}
							className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
							aria-label="Đăng xuất"
						>
							<LogOut className="h-4 w-4" />
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={handleLogout}
						className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
						aria-label="Đăng xuất"
					>
						<LogOut className="h-4 w-4" />
					</button>
				)}
			</div>
		</aside>
	);

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			{/* Desktop sidebar */}
			<div className="hidden md:flex md:h-full md:shrink-0">
				<Sidebar />
			</div>

			{/* Mobile sidebar overlay */}
			{mobileOpen && (
				<div
					className="fixed inset-0 z-40 md:hidden"
					onClick={() => setMobileOpen(false)}
					aria-hidden="true"
				>
					<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
					<div className="relative z-50 h-full w-60">
						<Sidebar />
					</div>
				</div>
			)}

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Mobile top bar */}
				<header className="flex h-16 items-center justify-between border-b border-border/40 bg-card/40 px-4 backdrop-blur-sm md:hidden">
					<button
						type="button"
						onClick={() => setMobileOpen(true)}
						className="rounded-lg p-2 text-muted-foreground hover:bg-accent transition-colors"
						aria-label="Mở menu"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
					<Link href="/" className="flex items-center gap-2">
						<Sparkles className="h-4 w-4 text-primary" />
						<span className="font-bold gradient-gold-purple text-sm">
							PixelMage Staff
						</span>
					</Link>
					<div className="flex h-7 w-7 items-center justify-center rounded-full gradient-gold-purple-bg text-xs font-bold text-primary-foreground">
						{initials}
					</div>
				</header>

				{/* Desktop top bar */}
				<header className="hidden md:flex h-14 items-center justify-between border-b border-border/20 bg-card/20 px-6 backdrop-blur-sm">
					<div>
						<h2 className="text-sm font-semibold text-foreground capitalize">
							{navLinks.find((l) => pathname.startsWith(l.href))?.label ??
								"Dashboard"}
						</h2>
					</div>
					<p className="text-xs text-muted-foreground">
						Đăng nhập với vai trò{" "}
						<span className="font-semibold text-primary">{role}</span>
					</p>
				</header>

				<main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
