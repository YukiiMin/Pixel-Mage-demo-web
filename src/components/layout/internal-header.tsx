"use client";

import { getStoredUserRole, hasStoredAuthSession } from "@/lib/api-config";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Favicon URL for the project
const FAVICON_URL = "https://res.cloudinary.com/yukiimin-cloud/image/upload/v1775797205/favicon_pto0em.png";

// Breadcrumb mapping for routes
const routeLabels: Record<string, string> = {
	"/admin": "Tổng quan",
	"/admin/accounts": "Quản lý tài khoản",
	"/admin/wallet": "Quản lý ví",
	"/admin/cards": "Quản lý thẻ",
	"/admin/physical-cards": "Thẻ vật lý NFC",
	"/admin/collections": "Bộ sưu tập",
	"/admin/vouchers": "Vouchers",
	"/admin/achievements": "Thành tựu",
	"/admin/analytics": "Phân tích",
	"/admin/pack-monitoring": "Giám sát Pack",
	"/staff": "Tổng quan",
	"/staff/products": "Gacha Products",
	"/staff/unlink-requests": "Yêu cầu Unlink",
};

export function InternalHeader() {
	const router = useRouter();
	const pathname = usePathname();

	const [role, setRole] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

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
	}, [router]);

	// Get current page label for breadcrumb
	const currentPageLabel = routeLabels[pathname] || "Trang";
	const isAdmin = role === "ADMIN";
	const portalName = isAdmin ? "Admin" : "Staff";

	if (!mounted) {
		return null;
	}

	return (
		<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between bg-background/80 px-4 backdrop-blur-md border-b border-border/40 transition-[width,height] ease-linear">
			{/* LEFT SECTION: Sidebar Trigger + Breadcrumb */}
			<div className="flex items-center gap-3 flex-1 min-w-0">
				<SidebarTrigger className="-ml-1 h-8 w-8" />
				<Separator orientation="vertical" className="h-4 hidden sm:block" />

				{/* Breadcrumb */}
				<nav className="flex items-center gap-2 text-sm text-muted-foreground hidden sm:flex">
					<Link
						href={isAdmin ? "/admin" : "/staff"}
						className="hover:text-foreground transition-colors flex items-center gap-1.5"
					>
						<img
							src={FAVICON_URL}
							alt="PixelMage"
							className="h-4 w-4 object-contain"
						/>
						<span className="font-medium">{portalName}</span>
					</Link>
					<span className="text-muted-foreground/50">/</span>
					<span className="text-foreground font-medium truncate max-w-[200px]">
						{currentPageLabel}
					</span>
				</nav>
			</div>

			{/* CENTER SECTION: Global Search */}
			<div className="flex-1 flex justify-center px-4">
				<div className="relative w-full max-w-96">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Tìm kiếm..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-12 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
					/>
					<kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
						<span className="text-xs">⌘</span>K
					</kbd>
				</div>
			</div>

			{/* RIGHT SECTION: Quick Action Only */}
			<div className="flex items-center gap-2 flex-1 justify-end">
				<Button size="sm" className="hidden sm:flex items-center gap-1 h-8">
					<Plus className="h-3.5 w-3.5" />
					<span>Hành động</span>
				</Button>
			</div>
		</header>
	);
}
