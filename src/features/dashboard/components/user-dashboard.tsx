"use client";

import { useState } from "react";

import { getInitials } from "@/components/layout/header/_config";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StarBackground from "@/components/ui/star-background";
import { useProfile } from "@/features/auth/hooks/use-auth";
import { useMyCards } from "@/features/inventory/hooks/use-my-cards";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { useTarotReadingHistory } from "@/features/tarot/hooks/use-tarot-reading-history";
import type { OrderDetail } from "@/features/orders/types";
import type { ReadingSession } from "@/features/tarot/types";
import type { MyCardItem } from "@/types/commerce";
import {
	getStoredUserId,
} from "@/lib/api-config";
import { motion } from "framer-motion";
import {
	ArrowRight,
	CheckCircle,
	Clock,
	CreditCard,
	Package,
	Sparkles,
	XCircle,
	AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// ─── Helpers ─────────────────────────────────────────────
function formatVnd(amount: number): string {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	}).format(amount);
}

function formatDate(dateStr: string | undefined | null): string {
	if (!dateStr || dateStr === "null") return "N/A";
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return "N/A";
	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function getOrderStatusIcon(status: string) {
	switch (status) {
		case "COMPLETED":
			return <CheckCircle className="h-4 w-4 text-green-400" />;
		case "PROCESSING":
		case "PENDING":
			return <Clock className="h-4 w-4 text-yellow-400" />;
		default:
			return <XCircle className="h-4 w-4 text-red-400" />;
	}
}

function getOrderStatusColor(status: string): string {
	switch (status) {
		case "COMPLETED":
			return "text-green-400 bg-green-900/20";
		case "PROCESSING":
		case "PENDING":
			return "text-yellow-400 bg-yellow-900/20";
		default:
			return "text-red-400 bg-red-900/20";
	}
}

function getOrderStatusLabel(status: string): string {
	switch (status) {
		case "COMPLETED":
			return "Hoàn thành";
		case "PROCESSING":
			return "Đang xử lý";
		case "PENDING":
			return "Chờ xử lý";
		case "CANCELLED":
			return "Đã huỷ";
		default:
			return status;
	}
}

// ─── Rarity Chart Data ────────────────────────────────────
function buildRarityData(cards: MyCardItem[]) {
	const counts = { COMMON: 0, RARE: 0, LEGENDARY: 0 };
	for (const c of cards) {
		if (c.rarity in counts) counts[c.rarity as keyof typeof counts]++;
	}
	return [
		{ name: "Common", value: counts.COMMON, color: "#6b7280" },
		{ name: "Rare", value: counts.RARE, color: "#3b82f6" },
		{ name: "Legendary", value: counts.LEGENDARY, color: "#f59e0b" },
	].filter((d) => d.value > 0);
}

// ─── Order Status Chart Data ──────────────────────────────
function buildOrderChartData(orders: OrderDetail[]) {
	const counts: Record<string, number> = {};
	for (const o of orders) {
		counts[o.status] = (counts[o.status] ?? 0) + 1;
	}
	return Object.entries(counts).map(([status, count]) => ({
		name: getOrderStatusLabel(status),
		count,
		color:
			status === "COMPLETED"
				? "#22c55e"
				: status === "CANCELLED"
					? "#ef4444"
					: "#f59e0b",
	}));
}

// ─── Loading Skeleton ─────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
	return (
		<div className={`animate-pulse rounded bg-muted/30 ${className ?? ""}`} />
	);
}

// ─── Main Component ───────────────────────────────────────
export default function UserDashboard() {
	const [avatarError, setAvatarError] = useState(false);
	const userId = getStoredUserId();
	const { data: profile, isLoading: profileLoading } = useProfile(userId);
	const { data: myCards = [], isLoading: cardsLoading } = useMyCards(userId);
	const { data: orders = [], isLoading: ordersLoading } = useOrders(userId);
	const { data: sessions = [], isLoading: sessionsLoading } =
		useTarotReadingHistory(userId);

	const userName = profile?.name || profile?.email || "Người dùng";
	const initials = getInitials(userName);

	// Derived stats
	const totalCards = myCards.length;
	const recentOrders = orders.slice(0, 4);
	const recentSessions = sessions.slice(0, 3);
	const rarityData = buildRarityData(myCards);
	const orderChartData = buildOrderChartData(orders);

	const quickActions = [
		{
			title: "Bắt đầu phiên Tarot mới",
			description: "Bốc bài xem vận may",
			href: "/tarot",
			icon: Sparkles,
			color: "from-purple-600 to-blue-600",
		},
		{
			title: "Mở Pack mới ngay",
			description: "Mua thẻ ngẫu nhiên",
			href: "/marketplace",
			icon: Package,
			color: "from-blue-600 to-indigo-600",
		},
		{
			title: "Bộ Sưu Tập Bí Ẩn",
			description: "Khám phá thư viện thẻ",
			href: "/card-gallery",
			icon: CreditCard,
			color: "from-indigo-600 to-purple-600",
		},
	];

	return (
		<div className="min-h-screen relative overflow-x-hidden">
			<StarBackground />
			<main className="relative z-10">
				<div className="px-2 sm:px-4 py-4">
					<div className="grid lg:grid-cols-12 gap-4">
						{/* ── Row 1: Welcome Banner ── */}
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="col-span-12"
						>
							<Card className="glass-card border-primary/20 overflow-hidden animate-fog-in">
								<CardContent className="p-6 sm:p-8">
									<div className="flex items-center gap-4 sm:gap-6">
										<Link
											href="/profile"
											className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300"
										>
											<div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden glow-gold animate-pulse-gold">
												{profile?.avatarUrl && !avatarError ? (
													/* eslint-disable-next-line @next/next/no-img-element */
													<img
														src={profile.avatarUrl}
														alt="Avatar"
														className="w-full h-full object-cover"
														onError={() => setAvatarError(true)}
													/>
												) : (
													<div className="w-full h-full gradient-gold-purple-bg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
														{profileLoading ? "..." : initials}
													</div>
												)}
											</div>
										</Link>
										<div className="flex-1 min-w-0">
											<motion.h1
												className="text-2xl sm:text-3xl text-mystic-gradient animate-fog-in mb-1 sm:mb-2"
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.6, delay: 0.2 }}
												style={{ fontFamily: "var(--font-heading)" }}
											>
												{profileLoading ? "Đang tải..." : `Chào mừng trở lại, ${userName}!`}
											</motion.h1>
											<motion.p
												className="text-ethereal text-base sm:text-lg"
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.6, delay: 0.3 }}
											>
												🌟 Hôm nay bạn muốn khám phá điều gì với PixelMage?
											</motion.p>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* ── Row 2: Stats Cards ── */}
						{/* Cards Stat */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="col-span-12 sm:col-span-6 lg:col-span-4"
						>
							<Link href="/my-cards">
								<Card className="glass-card border-primary/10 hover:border-primary/30 hover:glow-gold transition-all duration-300 hover:scale-105 cursor-pointer group h-full">
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<CardTitle
												className="text-white/80 text-sm font-medium"
												style={{ fontFamily: "var(--font-heading)" }}
											>
												Thẻ đã thu thập
											</CardTitle>
											<CreditCard className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
										</div>
									</CardHeader>
									<CardContent>
										{cardsLoading ? (
											<Skeleton className="h-8 w-20" />
										) : (
											<div
												className="text-2xl font-bold text-gold-shimmer"
												style={{ fontFamily: "var(--font-stats)" }}
											>
												{totalCards} thẻ
											</div>
										)}
									</CardContent>
								</Card>
							</Link>
						</motion.div>

						{/* Orders Stat */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="col-span-12 sm:col-span-6 lg:col-span-4"
						>
							<Card className="glass-card border-primary/10 h-full">
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardTitle
											className="text-white/80 text-sm font-medium"
											style={{ fontFamily: "var(--font-heading)" }}
										>
											Tổng đơn hàng
										</CardTitle>
										<Package className="h-4 w-4 text-primary/60" />
									</div>
								</CardHeader>
								<CardContent>
									{ordersLoading ? (
										<Skeleton className="h-8 w-20" />
									) : (
										<div
											className="text-2xl font-bold text-gold-shimmer"
											style={{ fontFamily: "var(--font-stats)" }}
										>
											{orders.length} đơn
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>

						{/* Tarot Sessions Stat */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="col-span-12 sm:col-span-6 lg:col-span-4"
						>
							<Link href="/tarot">
								<Card className="glass-card border-secondary/20 hover:border-secondary/40 hover:glow-purple transition-all duration-300 hover:scale-105 cursor-pointer group h-full">
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<CardTitle
												className="text-white/80 text-sm font-medium"
												style={{ fontFamily: "var(--font-heading)" }}
											>
												Phiên Tarot
											</CardTitle>
											<Sparkles className="h-4 w-4 text-secondary/60 group-hover:text-secondary transition-colors" />
										</div>
									</CardHeader>
									<CardContent>
										{sessionsLoading ? (
											<Skeleton className="h-8 w-20" />
										) : (
											<div
												className="text-2xl font-bold text-gold-shimmer"
												style={{ fontFamily: "var(--font-stats)" }}
											>
												{sessions.length} phiên
											</div>
										)}
									</CardContent>
								</Card>
							</Link>
						</motion.div>

						{/* ── Row 3: Charts ── */}
						{/* Card Rarity Pie */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="col-span-12 lg:col-span-6"
						>
							<Card className="glass-card border-primary/10 h-full">
								<CardHeader className="pb-2">
									<CardTitle
										className="text-mystic flex items-center gap-2 text-base"
										style={{ fontFamily: "var(--font-heading)" }}
									>
										<CreditCard className="h-5 w-5 text-primary" />
										Phân bổ Độ Hiếm Thẻ
									</CardTitle>
								</CardHeader>
								<CardContent>
									{cardsLoading ? (
										<div className="h-48 flex items-center justify-center">
											<Skeleton className="h-40 w-40 rounded-full" />
										</div>
									) : rarityData.length === 0 ? (
										<div className="h-48 flex flex-col items-center justify-center gap-3 text-muted-foreground">
											<AlertCircle className="h-8 w-8 opacity-40" />
											<p className="text-sm">Bạn chưa sở hữu thẻ nào</p>
											<Link href="/marketplace" className="text-xs text-primary hover:underline">
												Mua Pack ngay →
											</Link>
										</div>
									) : (
										<div className="flex items-center gap-4">
											<ResponsiveContainer width="60%" height={160}>
												<PieChart>
													<Pie
														data={rarityData}
														cx="50%"
														cy="50%"
														innerRadius={40}
														outerRadius={70}
														dataKey="value"
														strokeWidth={2}
														stroke="rgba(255,255,255,0.05)"
													>
														{rarityData.map((entry) => (
															<Cell key={entry.name} fill={entry.color} />
														))}
													</Pie>
													<Tooltip
														contentStyle={{
															background: "rgba(15,15,30,0.95)",
															border: "1px solid rgba(255,255,255,0.1)",
															borderRadius: "8px",
															fontSize: "12px",
														}}
														formatter={(v) => [`${v} thẻ`, ""]}
													/>
												</PieChart>
											</ResponsiveContainer>
											<div className="flex-1 space-y-2">
												{rarityData.map((d) => (
													<div key={d.name} className="flex items-center gap-2 text-sm">
														<div
															className="w-3 h-3 rounded-full flex-shrink-0"
															style={{ background: d.color }}
														/>
														<span className="text-muted-foreground">{d.name}</span>
														<span className="ml-auto font-semibold text-white">{d.value}</span>
													</div>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>

						{/* Order Status Bar Chart */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.45 }}
							className="col-span-12 lg:col-span-6"
						>
							<Card className="glass-card border-primary/10 h-full">
								<CardHeader className="pb-2">
									<CardTitle
										className="text-mystic flex items-center gap-2 text-base"
										style={{ fontFamily: "var(--font-heading)" }}
									>
										<Package className="h-5 w-5 text-primary" />
										Trạng Thái Đơn Hàng
									</CardTitle>
								</CardHeader>
								<CardContent>
									{ordersLoading ? (
										<div className="h-48">
											<Skeleton className="h-full w-full" />
										</div>
									) : orderChartData.length === 0 ? (
										<div className="h-48 flex flex-col items-center justify-center gap-3 text-muted-foreground">
											<AlertCircle className="h-8 w-8 opacity-40" />
											<p className="text-sm">Bạn chưa có đơn hàng nào</p>
											<Link href="/marketplace" className="text-xs text-primary hover:underline">
												Mua Pack ngay →
											</Link>
										</div>
									) : (
										<ResponsiveContainer width="100%" height={160}>
											<BarChart data={orderChartData} barSize={32}>
												<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
												<XAxis
													dataKey="name"
													tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
													axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
												/>
												<YAxis
													allowDecimals={false}
													tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
													axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
												/>
												<Tooltip
													contentStyle={{
														background: "rgba(15,15,30,0.95)",
														border: "1px solid rgba(255,255,255,0.1)",
														borderRadius: "8px",
														fontSize: "12px",
													}}
													formatter={(v) => [`${v} đơn`, "Số đơn"]}
												/>
												<Bar dataKey="count" radius={[4, 4, 0, 0]}>
													{orderChartData.map((entry) => (
														<Cell key={entry.name} fill={entry.color} />
													))}
												</Bar>
											</BarChart>
										</ResponsiveContainer>
									)}
								</CardContent>
							</Card>
						</motion.div>

						{/* ── Row 4: Quick Actions + Activity ── */}
						{/* Quick Actions */}
						<div className="col-span-12 lg:col-span-4 space-y-4">
							<Card className="glass-card border-primary/10 h-full">
								<CardHeader className="pb-4">
									<CardTitle
										className="text-mystic flex items-center gap-2"
										style={{ fontFamily: "var(--font-heading)" }}
									>
										<Sparkles className="h-5 w-5 text-primary" />
										Lối tắt
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{quickActions.map((action, index) => (
										<motion.div
											key={action.title}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: index * 0.1 }}
										>
											<Link
												href={action.href}
												className={`flex items-center justify-between gap-3 w-full p-3 rounded-lg bg-gradient-to-r ${action.color} hover:opacity-90 transition-all duration-300 group hover:glow-gold`}
											>
												<div className="flex items-center gap-3">
													<action.icon className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
													<div className="text-left">
														<div className="font-medium text-white text-sm">{action.title}</div>
														<div className="text-xs opacity-80 text-white/80">{action.description}</div>
													</div>
												</div>
												<ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform flex-shrink-0" />
											</Link>
										</motion.div>
									))}
								</CardContent>
							</Card>
						</div>

						{/* Recent Activity */}
						<div className="col-span-12 lg:col-span-8 space-y-4">
							{/* Recent Orders */}
							<Card className="glass-card border-primary/10">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle
											className="text-mystic flex items-center gap-2"
											style={{ fontFamily: "var(--font-heading)" }}
										>
											<Package className="h-5 w-5 text-primary" />
											Đơn hàng gần nhất
										</CardTitle>
										<Link
											href="/orders"
											className="text-xs text-primary hover:underline flex items-center gap-1"
										>
											Xem tất cả <ArrowRight className="h-3 w-3" />
										</Link>
									</div>
								</CardHeader>
								<CardContent>
									{ordersLoading ? (
										<div className="space-y-3">
											{[1, 2, 3].map((i) => (
												<Skeleton key={i} className="h-14 w-full rounded-lg" />
											))}
										</div>
									) : recentOrders.length === 0 ? (
										<div className="text-center py-6 text-muted-foreground text-sm">
											Bạn chưa có đơn hàng nào.{" "}
											<Link href="/marketplace" className="text-primary hover:underline">
												Khám phá Marketplace →
											</Link>
										</div>
									) : (
										<div className="space-y-2">
											{recentOrders.map((order, index) => (
												<motion.div
													key={order.orderId}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.3, delay: index * 0.1 }}
													className="flex items-center justify-between p-3 rounded-lg glass-card border-primary/5 hover:border-primary/20 transition-colors"
												>
													<div className="flex-1 min-w-0">
														<div className="font-medium text-white text-sm truncate">
															Đơn #{order.orderId}
														</div>
														<div className="text-xs text-muted-foreground">
															{formatDate(order.createdAt || (order as any).orderDate)}
														</div>
													</div>
													<div className="flex items-center gap-3 flex-shrink-0">
														<div className="text-right">
															<div className="font-medium text-white text-sm">
																{formatVnd(order.finalAmount)}
															</div>
															<div
																className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getOrderStatusColor(order.status)}`}
															>
																{getOrderStatusIcon(order.status)}
																{getOrderStatusLabel(order.status)}
															</div>
														</div>
													</div>
												</motion.div>
											))}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Recent Tarot Sessions */}
							<Card className="glass-card border-secondary/20 glow-purple">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle
											className="text-mystic flex items-center gap-2"
											style={{ fontFamily: "var(--font-heading)" }}
										>
											<Clock className="h-5 w-5 text-secondary" />
											Lịch sử Tarot
										</CardTitle>
										<Link
											href="/tarot"
											className="text-xs text-secondary hover:underline flex items-center gap-1"
										>
											Bốc bài ngay <ArrowRight className="h-3 w-3" />
										</Link>
									</div>
								</CardHeader>
								<CardContent>
									{sessionsLoading ? (
										<div className="space-y-3">
											{[1, 2].map((i) => (
												<Skeleton key={i} className="h-16 w-full rounded-lg" />
											))}
										</div>
									) : recentSessions.length === 0 ? (
										<div className="text-center py-6 text-muted-foreground text-sm">
											Bạn chưa thực hiện phiên Tarot nào.{" "}
											<Link href="/tarot" className="text-secondary hover:underline">
												Bắt đầu ngay →
											</Link>
										</div>
									) : (
										<div className="space-y-2">
											{recentSessions.map((session, index) => (
												<motion.div
													key={session.sessionId}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.3, delay: index * 0.1 }}
													className="p-3 rounded-lg glass-card border-secondary/10 hover:border-secondary/30 transition-colors"
												>
													<div className="flex items-start justify-between gap-2">
														<div className="flex-1 min-w-0">
															<div className="font-medium text-white text-sm truncate">
																{session.mainQuestion || "Không có câu hỏi"}
															</div>
															<div className="text-xs text-secondary/80 mt-0.5">
																{formatDate(session.createdAt)}
															</div>
														</div>
														<Badge variant="outline" className="text-[10px] h-5 px-1.5 border-secondary/30 text-secondary/80 flex-shrink-0">
															{session.readingCards?.length ?? 0} lá
														</Badge>
													</div>
												</motion.div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
