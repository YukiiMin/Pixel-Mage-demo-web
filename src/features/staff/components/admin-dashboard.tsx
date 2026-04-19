"use client";
import {
	CreditCard,
	Package,
	ShoppingBag,
	Sparkles,
	Trash2,
	TrendingUp,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { PageResponse } from "@/types/api";
import { AdminMusicSettings } from "@/features/audio/components/admin-music-settings";

// ────────────────────────────────
// MOCK DATA (replace with real BE endpoint when ready)
// ────────────────────────────────

/**
 * 📡 BE API Spec cần implement:
 * GET /api/admin/stats
 * Response:
 * {
 *   "totalUsers": number,
 *   "totalOrders": number,
 *   "totalRevenue": number,      // in VND
 *   "totalCards": number,
 *   "revenueByDay": [            // last 14 days
 *     { "date": "2026-03-20", "revenue": 1200000, "orders": 5 }, ...
 *   ],
 *   "revenueByPackType": [
 *     { "name": "Starter Pack", "value": 3500000 }, ...
 *   ],
 *   "recentOrders": [
 *     { "orderId": 1, "customerName": "Nguyễn Minh", "amount": 200000, "status": "PAID", "createdAt": "..." }, ...
 *   ]
 * }
 *
 * NOTE: Tất cả tính toán aggregate là trách nhiệm của BE.
 * FE chỉ render, không tính toán.
 */

// Use these as Fallbacks (if BE fails to return the full payload)
const DEFAULT_STATS = {
	totalUsers: 0,
	totalOrders: 0,
	totalRevenue: 0,
	totalCards: 0,
};

const PIE_COLORS = ["#c9a227", "#7c3aed", "#2563eb", "#059669"];

export interface AdminStatsResponse {
	totalUsers: number;
	totalOrders: number;
	totalRevenue: number;
	totalCardTemplates: number;
	revenueByDay: { date: string; revenue: number }[];
	revenueByPackType: { packName: string; revenue: number }[];
	recentOrders: AdminOrderResponse[];
}

export interface AdminOrderResponse {
	orderId: number;
	status: string;
	paymentStatus: string;
	totalAmount: number;
	finalAmount: number;
	createdAt: any;
	orderDate: any;
	userId?: number;
    customerName?: string;
}

// ────────────────────────────────
// Components
// ────────────────────────────────

function formatVnd(amount: number): string {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	}).format(amount);
}

function parseArrayDate(dateArray: any): string {
	if (Array.isArray(dateArray) && dateArray.length >= 3) {
		const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
		return new Date(
			year,
			month - 1,
			day,
			hour,
			minute,
			second,
		).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}
	if (typeof dateArray === "string") {
		const d = new Date(dateArray);
		if (!Number.isNaN(d.getTime()))
			return d.toLocaleDateString("vi-VN", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
	}
	return "N/A";
}

function getOrderAmount(order: AdminOrderResponse): number {
	return order.finalAmount ?? order.totalAmount ?? (order as any).amount ?? 0;
}

function StatCard({
	icon: Icon,
	label,
	value,
	sub,
	iconClass = "text-primary",
}: {
	icon: React.ElementType;
	label: string;
	value: string;
	sub?: string;
	iconClass?: string;
}) {
	return (
		<div className="glass-card rounded-2xl border border-border/50 p-5">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-xs font-medium text-muted-foreground">{label}</p>
					<p className="mt-1.5 text-2xl font-bold font-stats text-foreground">
						{value}
					</p>
					{sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
				</div>
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 border border-border/40">
					<Icon className={`h-5 w-5 ${iconClass}`} />
				</div>
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const map: Record<string, string> = {
		PAID: "bg-green-500/10 text-green-400 border-green-500/20",
		SUCCEEDED: "bg-green-500/10 text-green-400 border-green-500/20",
		COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
		PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
		CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
		CANCELED: "bg-destructive/10 text-destructive border-destructive/20",
		PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
		FAILED: "bg-red-600/10 text-red-400 border-red-600/20",
		REQUIRES_ACTION: "bg-orange-500/10 text-orange-400 border-orange-500/20",
	};
	return (
		<span
			className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
				map[status] ?? "bg-muted/40 text-muted-foreground"
			}`}
		>
			{status}
		</span>
	);
}

export function AdminDashboard() {
	const { data: stats, isLoading: statsLoading } = useQuery<AdminStatsResponse>({
		queryKey: ["admin-stats"],
		queryFn: async (): Promise<AdminStatsResponse> => {
			const res = await apiRequest<AdminStatsResponse>(API_ENDPOINTS.adminDashboard.stats);
			return res.data as AdminStatsResponse;
		},
		refetchInterval: 15000, // Refresh every 15s for real-time
	});

	// Fetch orders specifically to get real recent orders since stats payload might be missing fields
	const { data: recentOrdersData, isLoading: ordersLoading } = useQuery<AdminOrderResponse[]>({
		queryKey: ["admin-orders-recent"],
		queryFn: async (): Promise<AdminOrderResponse[]> => {
			const res = await apiRequest<PageResponse<AdminOrderResponse> | AdminOrderResponse[]>(`${API_ENDPOINTS.orderManagement.list}?size=10&sort=createdAt,desc`);
            const data = res.data;
            if (data && typeof data === "object" && "content" in data) return data.content;
			return Array.isArray(data) ? data : [];
		},
		refetchInterval: 15000,
	});

	// Fetch active card templates only (as requested by user)
	const { data: activeCardsData, isLoading: cardsLoading } = useQuery({
		queryKey: ["admin-active-cards"],
		queryFn: async () => {
			const res = await apiRequest<PageResponse<unknown> | unknown[]>(`${API_ENDPOINTS.cardTemplates.list}?size=500&includeInvisible=false`);
			const data = res.data;
			if (data && typeof data === "object" && "content" in data) return data.content;
			return Array.isArray(data) ? data : [];
		},
	});

	const loading = statsLoading || ordersLoading || cardsLoading;

	const handleClearCache = async () => {
		if (
			!confirm(
				"Xác nhận xoá sạch Redis Cache? Tất cả dữ liệu đệm sẽ bị huỷ và tải lại từ Database.",
			)
		)
			return;

		const id = toast.loading("Đang xoá cache...");
		try {
			// Using DELETE as requested by USER
			await apiRequest(API_ENDPOINTS.adminCache.clear, { method: "DELETE" });
			toast.success("Đã xoá cache thành công!", { id });
			// Optionally refresh stats
			window.location.reload();
		} catch (err) {
			console.error("Clear Cache Error:", err);
			toast.error("Không thể xoá cache. Vui lòng kiểm tra quyền Admin.", {
				id,
			});
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center p-12 text-muted-foreground">
				Đang tải biểu đồ dữ liệu...
			</div>
		);
	}

	const safeStats: AdminStatsResponse = stats ? stats : ({
		totalUsers: 0,
		totalOrders: 0,
		totalRevenue: 0,
		totalCardTemplates: 0,
		revenueByDay: [],
		revenueByPackType: [],
		recentOrders: [],
	} as AdminStatsResponse);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<p className="badge-mystic inline-flex mb-2">Admin Panel</p>
					<h1
						className="text-3xl text-foreground"
						style={{ fontFamily: "Fruktur, var(--font-heading)" }}
					>
						Dashboard
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Tổng quan hệ thống
					</p>
				</div>
				<button
					type="button"
					onClick={handleClearCache}
					className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground border border-destructive/20"
				>
					<Trash2 className="h-4 w-4" />
					Xoá Redis Cache
				</button>
			</div>

			{/* Stats cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
				<StatCard
					icon={Users}
					label="Tổng người dùng"
					value={safeStats.totalUsers.toLocaleString("vi-VN")}
					sub="Tổng số đăng ký"
					iconClass="text-blue-400"
				/>
				<StatCard
					icon={ShoppingBag}
					label="Tổng đơn hàng"
					value={safeStats.totalOrders.toLocaleString("vi-VN")}
					sub="Đơn hàng đã đặt"
					iconClass="text-purple-400"
				/>
				<StatCard
					icon={TrendingUp}
					label="Doanh thu"
					value={formatVnd(safeStats.totalRevenue)}
					sub="Thời gian chạy"
					iconClass="text-primary"
				/>
				<StatCard
					icon={CreditCard}
					label="Loại thẻ"
					value={String(activeCardsData?.length || safeStats.totalCardTemplates)}
					sub="Loại thẻ (đang active)"
					iconClass="text-emerald-400"
				/>
				{/* NEW STATS (Pending BE update) */}
				<StatCard
					icon={Sparkles}
					label="Thẻ vật lý"
					value="0"
					sub="Tổng card đã mint"
					iconClass="text-amber-400"
				/>
				<StatCard
					icon={Package}
					label="Tổng sản phẩm"
					value="0"
					sub="Số loại pack/bộ"
					iconClass="text-rose-400"
				/>
			</div>

			{/* Charts */}
			<div className="grid gap-4 lg:grid-cols-3">
				{/* Revenue area chart */}
				<div className="glass-card col-span-2 rounded-2xl border border-border/50 p-5">
					<h2 className="mb-4 text-sm font-semibold text-foreground">
						Doanh thu theo ngày (9 ngày gần nhất)
					</h2>
					<ResponsiveContainer width="100%" height={220}>
						<AreaChart
							data={safeStats.revenueByDay}
							margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
						>
							<defs>
								<linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="hsl(45,65%,55%)"
										stopOpacity={0.25}
									/>
									<stop
										offset="95%"
										stopColor="hsl(45,65%,55%)"
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="hsl(230 20% 22% / 0.4)"
							/>
							<XAxis
								dataKey="date"
								tick={{ fontSize: 11, fill: "hsl(220 10% 65%)" }}
								axisLine={false}
								tickLine={false}
							/>
							<YAxis
								tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
								tick={{ fontSize: 11, fill: "hsl(220 10% 65%)" }}
								axisLine={false}
								tickLine={false}
							/>
							<Tooltip
								contentStyle={{
									background: "hsl(230 40% 12%)",
									border: "1px solid hsl(230 20% 22%)",
									borderRadius: "0.75rem",
									fontSize: "12px",
								}}
								formatter={(val) => [formatVnd(Number(val)), "Doanh thu"]}
								labelStyle={{ color: "hsl(220 10% 65%)" }}
							/>
							<Area
								type="monotone"
								dataKey="revenue"
								stroke="hsl(45,65%,55%)"
								strokeWidth={2}
								fill="url(#revenueGrad)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Pack type pie chart */}
				<div className="glass-card rounded-2xl border border-border/50 p-5">
					<h2 className="mb-4 text-sm font-semibold text-foreground">
						Doanh thu theo Pack
					</h2>
					<ResponsiveContainer width="100%" height={160}>
						<PieChart>
							<Pie
								data={safeStats.revenueByPackType}
								cx="50%"
								cy="50%"
								innerRadius={45}
								outerRadius={70}
								paddingAngle={3}
								dataKey="revenue"
							>
								{safeStats.revenueByPackType.map((entry, index) => (
									<Cell
										key={entry.packName}
										fill={PIE_COLORS[index % PIE_COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									background: "hsl(230 40% 12%)",
									border: "1px solid hsl(230 20% 22%)",
									borderRadius: "0.75rem",
									fontSize: "12px",
								}}
								formatter={(val) => [formatVnd(Number(val))]}
							/>
						</PieChart>
					</ResponsiveContainer>
					<ul className="mt-2 space-y-1.5">
						{safeStats.revenueByPackType.map((item, i) => (
							<li
								key={item.packName}
								className="flex items-center gap-2 text-xs text-muted-foreground"
							>
								<span
									className="h-2 w-2 shrink-0 rounded-full"
									style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
								/>
								<span className="truncate flex-1">{item.packName}</span>
								<span className="font-stats font-semibold text-foreground">
									{formatVnd(item.revenue)}
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Recent orders */}
			<div className="glass-card rounded-2xl border border-border/50 p-5">
				<h2 className="mb-4 text-sm font-semibold text-foreground">
					Đơn hàng gần đây
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border/40 text-xs font-medium text-muted-foreground">
								<th className="pb-2 text-left">Order ID</th>
								<th className="pb-2 text-left">Khách hàng</th>
								<th className="pb-2 text-left">Ngày</th>
								<th className="pb-2 text-right">Tổng tiền</th>
								<th className="pb-2 text-right">Trạng thái</th>
							</tr>
						</thead>
						<tbody>
							{(recentOrdersData?.slice(0, 5) || safeStats.recentOrders.slice(0, 5)).map((order: AdminOrderResponse) => (
								<tr
									key={order.orderId}
									className="border-b border-border/20 text-sm last:border-0"
								>
									<td className="py-3 font-stats text-xs text-muted-foreground">
										#{order.orderId}
									</td>
									<td className="py-3 font-medium text-foreground">
										{order.customerName || `Customer #${order.userId || '---'}`}
									</td>
									<td className="py-3 text-muted-foreground">
										{parseArrayDate(order.createdAt || order.orderDate)}
									</td>
									<td className="py-3 text-right font-stats font-semibold text-primary">
										{formatVnd(getOrderAmount(order))}
									</td>
									<td className="py-3 text-right">
										<StatusBadge status={order.status} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			{/* Music Settings */}
			<AdminMusicSettings />
		</div>
	);
}
