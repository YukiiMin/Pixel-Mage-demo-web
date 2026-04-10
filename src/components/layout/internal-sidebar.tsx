"use client";

import { useProfile } from "@/features/auth/hooks/use-auth";
import { clearStoredAuthSession, getStoredUserId, getStoredUserRole, hasStoredAuthSession } from "@/lib/api-config";
import {
	BarChart3,
	BookOpen,
	CreditCard,
	LayoutDashboard,
	Link2Off,
	LogOut,
	Moon,
	NfcIcon,
	Package,
	Sparkles,
	Sun,
	Ticket,
	Trophy,
	Users,
	Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getInitials } from "./header/_config"; // Keep using existing logic for user initials

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

const staffLinks = [
	{ label: "Gacha Products", href: "/staff/products", icon: Package },
	{ label: "Unlink Requests", href: "/staff/unlink-requests", icon: Link2Off },
];

const adminOnlyLinks = [
	{ label: "Dashboard", href: "/admin", icon: LayoutDashboard },
	{ label: "Accounts", href: "/admin/accounts", icon: Users },
	{ label: "Wallet Management", href: "/admin/wallet", icon: Wallet },
	{ label: "Card Management", href: "/admin/cards", icon: CreditCard },
	{ label: "Physical Cards", href: "/admin/physical-cards", icon: NfcIcon },
	{ label: "Collections", href: "/admin/collections", icon: BookOpen },
	{ label: "Vouchers", href: "/admin/vouchers", icon: Ticket },
	{ label: "Achievements", href: "/admin/achievements", icon: Trophy },
	{ label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
	{ label: "Pack Monitoring", href: "/admin/pack-monitoring", icon: Package },
];

export function InternalSidebar() {
	const router = useRouter();
	const pathname = usePathname();
	const { setTheme, theme } = useTheme();
	const { state } = useSidebar();

	const [userId, setUserId] = useState<number | null>(null);
	const [role, setRole] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
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

	// Đồng bộ role thực tế từ API (nhỡ stored role bị lệch)
	useEffect(() => {
		if (profile?.role && profile.role !== role) {
			setRole(profile.role);
		}
	}, [profile, role]);

	const handleLogout = () => {
		clearStoredAuthSession();
		router.push("/login");
	};

	if (!mounted) {
		return null; // Tránh lỗi hydration mismatch
	}

	const isAdmin = role === "ADMIN";
	const navLinks = [...(isAdmin ? adminOnlyLinks : []), ...staffLinks];

	return (
		<Sidebar collapsible="icon" className="border-r border-border/40 text-sm">
			{/* BRANDING HEADER */}
			<SidebarHeader className="border-b border-border/20 py-2">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
							<Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
								<div className="flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all">
									<Sparkles className="size-5" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none px-1 min-w-0 flex-1 truncate group-data-[collapsible=icon]:hidden">
									<span className="font-heading font-bold text-[18px] gradient-gold-purple tracking-wide truncate">
										PixelMage
									</span>
									<span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
										{isAdmin ? "Admin Portal" : "Staff Portal"}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* MENU CONTENT */}
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase mt-2">
						Tổng quan hệ thống
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navLinks.map((item) => {
								// Fix Active State logic
								const isRootAdmin = item.href === "/admin" || item.href === "/staff";
								const active = isRootAdmin
									? pathname === item.href
									: pathname.startsWith(item.href);

								return (
									<SidebarMenuItem key={item.label}>
										<SidebarMenuButton
											asChild
											isActive={active}
											tooltip={item.label}
											className={
												active ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : ""
											}
										>
											<Link href={item.href}>
												<item.icon className="h-4 w-4" />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* FOOTER & PROFILE */}
			<SidebarFooter className="border-t border-border/20 p-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="flex flex-col gap-2">
							{/* Theme Toggle (Dùng riêng layout cho compact mode) */}
							<button
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
								className="flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
								aria-label="Toggle Theme"
							>
								{theme === "dark" ? (
									<Sun className="h-4 w-4 text-orange-400" />
								) : (
									<Moon className="h-4 w-4 text-slate-700" />
								)}
								{state === "expanded" && (
									<span className="text-xs font-medium">Chế độ hiển thị</span>
								)}
							</button>

							{/* User & Logout */}
							<div className="flex items-center gap-2 mt-2">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
									{initials}
								</div>
								{state === "expanded" && (
									<div className="flex-1 min-w-0">
										<p className="truncate text-xs font-medium text-foreground">
											{displayName}
										</p>
										<p className="truncate text-[10px] text-muted-foreground lowercase">
											{role}
										</p>
									</div>
								)}
								{(state === "expanded" || state === "collapsed") && (
									<button
										onClick={handleLogout}
										title="Đăng xuất"
										className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex w-fit"
									>
										<LogOut className="h-4 w-4" />
									</button>
								)}
							</div>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
