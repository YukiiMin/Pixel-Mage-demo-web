"use client";

import { useProfile } from "@/features/auth/hooks/use-auth";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import {
	clearStoredAuthSession,
	getStoredUserId,
	getStoredUserRole,
	hasStoredAuthSession,
} from "@/lib/api-config";
import {
	BarChart3,
	BookOpen,
	ChevronDown,
	CreditCard,
	LayoutDashboard,
	Layers,
	Link2Off,
	LogOut,
	NfcIcon,
	Package,
	PackagePlus,
	ShoppingBag,
	Ticket,
	Trophy,
	User,
	Users,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { getInitials } from "./header/_config";

// Favicon URL for the project
const FAVICON_URL =
	"https://res.cloudinary.com/yukiimin-cloud/image/upload/v1775797205/favicon_pto0em.png";

const staffLinks = [
	{ label: "Sản phẩm & Pack", href: "/staff/products", icon: Package },
	{ label: "Quản lý Đơn hàng", href: "/staff/orders", icon: ShoppingBag },
	{ label: "Yêu cầu huỷ liên kết", href: "/staff/unlink-requests", icon: Link2Off },
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
	const userEmail = profile?.email || "";
	const initials = displayName !== "..." ? getInitials(displayName) : "??";
	const avatarUrl = profile?.avatarUrl || null;

	// Đồng bộ role
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
						<SidebarMenuButton
							size="lg"
							asChild
							className="hover:bg-transparent"
						>
							<Link
								href="/"
								className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
							>
								<div className="flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-all overflow-hidden">
									<img
										src={FAVICON_URL}
										alt="PixelMage"
										className="h-6 w-6 object-contain"
									/>
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
						<SidebarMenu className="gap-1.5">
							{navLinks.map((item) => {
								// Fix Active State logic
								const isRootAdmin =
									item.href === "/admin" || item.href === "/staff";
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
												active
													? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold text-base py-2.5"
													: "text-base py-2.5"
											}
										>
											<Link href={item.href}>
												<item.icon className="h-5 w-5" />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* ADMIN — Pack & Product Group */}

			</SidebarContent>

			{/* FOOTER - Clean: Notification + User Dropdown */}
			<SidebarFooter className="border-t border-border/20 p-2">
				<div className="flex flex-col gap-2">
					{/* Row 1: Notification Bell - Centered */}
					<div className="flex justify-center py-1">
						<NotificationBell userRole={role || undefined} />
					</div>

					{/* Row 2: User Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent transition-colors">
								{/* Avatar */}
								{avatarUrl ? (
									<img
										src={avatarUrl}
										alt={displayName}
										className="h-6 w-6 rounded-full object-cover border border-border/50 flex-shrink-0"
									/>
								) : (
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary border border-border/50 flex-shrink-0">
										{initials}
									</div>
								)}

								{/* User Info - Chỉ hiện khi expanded */}
								{state === "expanded" && (
									<>
										<div className="flex-1 min-w-0 text-left">
											<p className="truncate text-xs font-medium text-foreground">
												{displayName}
											</p>
											<p className="truncate text-[10px] text-muted-foreground lowercase">
												{role}
											</p>
										</div>
										<ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
									</>
								)}
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" side="top" className="w-56">
							<DropdownMenuLabel className="flex flex-col gap-0.5">
								<span className="font-semibold truncate">{displayName}</span>
								{userEmail && (
									<span className="text-xs font-normal text-muted-foreground truncate">
										{userEmail}
									</span>
								)}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link
									href="/profile"
									className="flex items-center gap-2 cursor-pointer"
								>
									<User className="h-4 w-4" />
									<span>Hồ sơ cá nhân</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />

							{/* Logout with Confirm Dialog */}
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<DropdownMenuItem
										onSelect={(e) => e.preventDefault()}
										className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
									>
										<LogOut className="h-4 w-4" />
										<span>Đăng xuất</span>
									</DropdownMenuItem>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Xác nhận đăng xuất?</AlertDialogTitle>
										<AlertDialogDescription>
											Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Hủy</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleLogout}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										>
											Đăng xuất
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
