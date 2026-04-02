"use client";

import {
	CreditCard,
	Package,
	ShoppingBag,
	TrendingUp,
	Users,
} from "lucide-react";
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

const MOCK_STATS = {
	totalUsers: 1234,
	totalOrders: 456,
	totalRevenue: 12_500_000,
	totalCards: 78,
};

const MOCK_REVENUE_BY_DAY = [
	{ date: "25/3", revenue: 800000, orders: 3 },
	{ date: "26/3", revenue: 1200000, orders: 5 },
	{ date: "27/3", revenue: 950000, orders: 4 },
	{ date: "28/3", revenue: 1800000, orders: 7 },
	{ date: "29/3", revenue: 600000, orders: 2 },
	{ date: "30/3", revenue: 2200000, orders: 9 },
	{ date: "31/3", revenue: 1100000, orders: 5 },
	{ date: "1/4", revenue: 1700000, orders: 6 },
	{ date: "2/4", revenue: 900000, orders: 4 },
];

const MOCK_BY_PACK = [
	{ name: "Starter Pack", value: 4500000 },
	{ name: "Mystic Bundle", value: 3200000 },
	{ name: "Premium Arc", value: 2800000 },
	{ name: "Limited Edition", value: 2000000 },
];

const PIE_COLORS = ["#c9a227", "#7c3aed", "#2563eb", "#059669"];

const MOCK_RECENT_ORDERS = [
	{
		orderId: 112,
		customerName: "Nguyễn Minh",
		amount: 200000,
		status: "PAID",
		createdAt: "2/4/2026",
	},
	{
		orderId: 111,
		customerName: "Trần Bảo",
		amount: 500000,
		status: "PAID",
		createdAt: "2/4/2026",
	},
	{
		orderId: 110,
		customerName: "Lê Hương",
		amount: 150000,
		status: "PENDING",
		createdAt: "1/4/2026",
	},
	{
		orderId: 109,
		customerName: "Phạm Quang",
		amount: 350000,
		status: "CANCELLED",
		createdAt: "1/4/2026",
	},
	{
		orderId: 108,
		customerName: "Đỗ Thảo",
		amount: 200000,
		status: "PAID",
		createdAt: "31/3/2026",
	},
];

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
					<p className="mt-1.5 text-2xl font-bold font-stats text-foreground">{value}</p>
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
		PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
		CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
		PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
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
						Dữ liệu mock — chờ BE expose{" "}
						<code className="rounded bg-muted/30 px-1 py-0.5 text-xs">GET /api/admin/stats</code>
					</p>
				</div>
			</div>

			{/* Stats cards */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					icon={Users}
					label="Tổng người dùng"
					value={MOCK_STATS.totalUsers.toLocaleString("vi-VN")}
					sub="↑ 12% so với tháng trước"
					iconClass="text-blue-400"
				/>
				<StatCard
					icon={ShoppingBag}
					label="Tổng đơn hàng"
					value={MOCK_STATS.totalOrders.toLocaleString("vi-VN")}
					sub="↑ 8% so với tháng trước"
					iconClass="text-purple-400"
				/>
				<StatCard
					icon={TrendingUp}
					label="Doanh thu"
					value={formatVnd(MOCK_STATS.totalRevenue)}
					sub="Tháng 3/2026"
					iconClass="text-primary"
				/>
				<StatCard
					icon={CreditCard}
					label="Loại thẻ"
					value={String(MOCK_STATS.totalCards)}
					sub="Templates đang hoạt động"
					iconClass="text-emerald-400"
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
							data={MOCK_REVENUE_BY_DAY}
							margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
						>
							<defs>
								<linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="hsl(45,65%,55%)" stopOpacity={0.25} />
									<stop offset="95%" stopColor="hsl(45,65%,55%)" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 22% / 0.4)" />
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
								data={MOCK_BY_PACK}
								cx="50%"
								cy="50%"
								innerRadius={45}
								outerRadius={70}
								paddingAngle={3}
								dataKey="value"
							>
								{MOCK_BY_PACK.map((entry, index) => (
									<Cell
										key={entry.name}
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
						{MOCK_BY_PACK.map((item, i) => (
							<li key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
								<span
									className="h-2 w-2 shrink-0 rounded-full"
									style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
								/>
								<span className="truncate flex-1">{item.name}</span>
								<span className="font-stats font-semibold text-foreground">
									{formatVnd(item.value)}
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
							{MOCK_RECENT_ORDERS.map((order) => (
								<tr
									key={order.orderId}
									className="border-b border-border/20 text-sm last:border-0"
								>
									<td className="py-3 font-stats text-xs text-muted-foreground">
										#{order.orderId}
									</td>
									<td className="py-3 font-medium text-foreground">{order.customerName}</td>
									<td className="py-3 text-muted-foreground">{order.createdAt}</td>
									<td className="py-3 text-right font-stats font-semibold text-primary">
										{formatVnd(order.amount)}
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

			{/* API Spec Note */}
			<div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4">
				<p className="text-xs font-semibold text-amber-300 mb-1">📡 API cần BE implement</p>
				<pre className="text-xs text-muted-foreground whitespace-pre-wrap">{`GET /api/admin/stats
Response: { totalUsers, totalOrders, totalRevenue, totalCards,
  revenueByDay: [{ date, revenue, orders }],
  revenueByPackType: [{ name, value }],
  recentOrders: [{ orderId, customerName, amount, status, createdAt }]
}`}</pre>
			</div>
		</div>
	);
}
