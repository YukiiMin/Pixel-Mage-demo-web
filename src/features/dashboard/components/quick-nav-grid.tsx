"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
	BookOpen,
	CreditCard,
	HelpCircle,
	Package,
	Settings,
	ShoppingBag,
	Sparkles,
	Trophy,
} from "lucide-react";
import Link from "next/link";

export default function QuickNavGrid() {
	const quickNavItems = [
		{
			title: "Marketplace",
			description: "Mua Pack thẻ mới",
			icon: ShoppingBag,
			href: "/marketplace",
			color: "from-blue-600 to-purple-600",
			bgGradient: "from-blue-900/20 to-purple-900/20",
		},
		{
			title: "Tarot AI",
			description: "Bốc bài xem vận may",
			icon: Sparkles,
			href: "/tarot",
			color: "from-purple-600 to-pink-600",
			bgGradient: "from-purple-900/20 to-pink-900/20",
		},
		{
			title: "Bộ sưu tập",
			description: "Quản lý thẻ của bạn",
			icon: CreditCard,
			href: "/my-cards",
			color: "from-green-600 to-emerald-600",
			bgGradient: "from-green-900/20 to-emerald-900/20",
		},
		{
			title: "Thành tựu",
			description: "Xem thành tựu đã mở",
			icon: Trophy,
			href: "/achievements",
			color: "from-yellow-600 to-orange-600",
			bgGradient: "from-yellow-900/20 to-orange-900/20",
		},
		{
			title: "Câu chuyện",
			description: "Đọc truyện PixelMage",
			icon: BookOpen,
			href: "/stories",
			color: "from-indigo-600 to-blue-600",
			bgGradient: "from-indigo-900/20 to-blue-900/20",
		},
		{
			title: "Đơn hàng",
			description: "Lịch sử mua hàng",
			icon: Package,
			href: "/orders",
			color: "from-red-600 to-pink-600",
			bgGradient: "from-red-900/20 to-pink-900/20",
		},
		{
			title: "Hồ sơ",
			description: "Cài đặt tài khoản",
			icon: Settings,
			href: "/profile",
			color: "from-slate-600 to-gray-600",
			bgGradient: "from-slate-900/20 to-gray-900/20",
		},
		{
			title: "Trợ giúp",
			description: "Cần hỗ trợ?",
			icon: HelpCircle,
			href: "/help",
			color: "from-cyan-600 to-blue-600",
			bgGradient: "from-cyan-900/20 to-blue-900/20",
		},
	];

	return (
		<Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/30 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="text-slate-200">Truy cập nhanh</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{quickNavItems.map((item, index) => (
						<motion.div
							key={item.title}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
						>
							<Link href={item.href}>
								<div
									className={`p-4 rounded-xl bg-gradient-to-br ${item.bgGradient} border border-white/10 hover:border-white/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group`}
								>
									<div className="flex flex-col items-center text-center space-y-2">
										<div
											className={`p-3 rounded-lg bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}
										>
											<item.icon className="h-6 w-6" />
										</div>
										<div className="font-medium text-white text-sm">
											{item.title}
										</div>
										<div className="text-xs text-white/60">
											{item.description}
										</div>
									</div>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
