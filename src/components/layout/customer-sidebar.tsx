"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	User,
	Wallet,
	CreditCard,
	Trophy,
	Package,
	Clock,
} from "lucide-react";

const menuItems = [
	{
		title: "Tổng quan",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Hồ sơ cá nhân",
		href: "/profile",
		icon: User,
	},
	{
		title: "Ví của tôi",
		href: "/wallet",
		icon: Wallet,
	},
	{
		title: "Bộ sưu tập thẻ",
		href: "/my-cards",
		icon: CreditCard,
	},
	{
		title: "Thành tựu",
		href: "/achievements",
		icon: Trophy,
	},
	{
		title: "Lịch sử đơn hàng",
		href: "/orders",
		icon: Clock,
	},
];

export default function CustomerSidebar() {
	const pathname = usePathname();

	return (
		<div className="bg-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/30 p-4">
			<h3 className="text-lg font-semibold text-white mb-6 px-3">
				🎯 Tài khoản
			</h3>

			<nav className="space-y-2">
				{menuItems.map((item) => {
					const isActive = pathname === item.href;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${
									isActive
										? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
										: "text-slate-300 hover:bg-slate-800/50 hover:text-white"
								}
              `}
						>
							<item.icon className="h-4 w-4" />
							<span>{item.title}</span>
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
