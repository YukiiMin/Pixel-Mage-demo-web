"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { 
	Activity, 
	TrendingUp, 
	Sparkles, 
	ArrowUpRight,
	Calendar
} from "lucide-react";

// Types for Analytics (Proposed)
interface AnalyticsData {
	tarotSessions: {
		date: string;
		started: number;
		completed: number;
	}[];
	spreadUsage: {
		name: string;
		count: number;
	}[];
	userRegistrations: {
		date: string;
		count: number;
	}[];
	rarityDistribution: {
		rarity: string;
		count: number;
	}[];
}

const COLORS = ["#c9a227", "#7c3aed", "#2563eb", "#059669"];

export function AdminAnalytics() {
	// For now, using mock data for the Analysis page as BE doesn't have a specific analytics endpoint yet
	const { data: analytics, isLoading } = useQuery({
		queryKey: ["admin-analytics"],
		queryFn: async () => {
			// Eventually: apiRequest<AnalyticsData>('/api/admin/analytics')
			return {
				tarotSessions: [
					{ date: "01/04", started: 45, completed: 38 },
					{ date: "02/04", started: 52, completed: 48 },
					{ date: "03/04", started: 68, completed: 60 },
				],
				spreadUsage: [
					{ name: "Daily Card", count: 120 },
					{ name: "Celtic Cross", count: 45 },
					{ name: "Relationship", count: 30 },
				],
				userRegistrations: [
					{ date: "01/04", count: 12 },
					{ date: "02/04", count: 25 },
					{ date: "03/04", count: 18 },
				],
				rarityDistribution: [
					{ rarity: "COMMON", count: 450 },
					{ rarity: "RARE", count: 120 },
					{ rarity: "LEGENDARY", count: 5 },
				]
			} as AnalyticsData;
		}
	});

	if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang phân tích dữ liệu chuyên sâu...</div>;

	return (
		<div className="space-y-8 pb-10">
			<div className="flex flex-col gap-1">
				<h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Fruktur, var(--font-heading)" }}>
					Phân tích hệ thống
				</h1>
				<p className="text-muted-foreground">Theo dõi hành vi người dùng và hiệu suất Tarot AI</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Tarot Session Activity */}
				<div className="glass-card rounded-2xl border border-border/50 p-6">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Activity className="h-5 w-5 text-purple-400" />
							<h2 className="text-lg font-semibold">Tương tác Tarot</h2>
						</div>
						<span className="text-xs text-muted-foreground flex items-center gap-1">
							<Calendar className="h-3 w-3" /> 7 ngày qua
						</span>
					</div>
					<div className="h-75 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={analytics?.tarotSessions}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 22% / 0.4)" vertical={false} />
								<XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(220 10% 65%)" }} axisLine={false} tickLine={false} />
								<YAxis tick={{ fontSize: 12, fill: "hsl(220 10% 65%)" }} axisLine={false} tickLine={false} />
								<Tooltip 
									contentStyle={{ background: "hsl(230 40% 12%)", border: "1px solid hsl(230 20% 22%)", borderRadius: "12px" }}
								/>
								<Line type="monotone" dataKey="started" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Bắt đầu" />
								<Line type="monotone" dataKey="completed" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Hoàn tất" />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Spread Usage */}
				<div className="glass-card rounded-2xl border border-border/50 p-6">
					<div className="mb-6 flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-yellow-400" />
						<h2 className="text-lg font-semibold">Sơ đồ Spread phổ biến</h2>
					</div>
					<div className="h-75 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={analytics?.spreadUsage} layout="vertical" margin={{ left: 40 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 22% / 0.4)" horizontal={false} />
								<XAxis type="number" hide />
								<YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(220 10% 85%)" }} axisLine={false} tickLine={false} />
								<Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: "hsl(230 40% 12%)", border: "1px solid hsl(230 20% 22%)", borderRadius: "12px" }} />
								<Bar dataKey="count" fill="url(#spreadGrad)" radius={[0, 4, 4, 0]} barSize={25}>
									<defs>
										<linearGradient id="spreadGrad" x1="0" y1="0" x2="1" y2="0">
											<stop offset="0%" stopColor="#c9a227" />
											<stop offset="100%" stopColor="#7c3aed" />
										</linearGradient>
									</defs>
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* User Growth */}
				<div className="glass-card rounded-2xl border border-border/50 p-6">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-blue-400" />
							<h2 className="text-lg font-semibold">Tăng trưởng người dùng</h2>
						</div>
					</div>
					<div className="h-64 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={analytics?.userRegistrations}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 22% / 0.4)" vertical={false} />
								<XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(220 10% 65%)" }} axisLine={false} tickLine={false} />
								<YAxis tick={{ fontSize: 12, fill: "hsl(220 10% 65%)" }} axisLine={false} tickLine={false} />
								<Tooltip contentStyle={{ background: "hsl(230 40% 12%)", border: "1px solid hsl(230 20% 22%)", borderRadius: "12px" }} />
								<Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Users mới" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Rarity Mix */}
				<div className="glass-card rounded-2xl border border-border/50 p-6 flex flex-col items-center">
					<h2 className="mb-6 text-lg font-semibold text-left w-full">Phân bổ độ hiếm Physical Cards</h2>
					<div className="h-50 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={analytics?.rarityDistribution}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={80}
									paddingAngle={5}
									dataKey="count"
								>
									{analytics?.rarityDistribution.map((entry, index) => (
										<Cell key={`cell-${entry.rarity}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip contentStyle={{ background: "hsl(230 40% 12%)", border: "1px solid hsl(230 20% 22%)", borderRadius: "12px" }} />
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="mt-4 grid grid-cols-3 gap-6 w-full">
						{analytics?.rarityDistribution.map((item, i) => (
							<div key={item.rarity} className="text-center">
								<p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.rarity}</p>
								<p className="text-xl font-bold font-stats" style={{ color: COLORS[i % COLORS.length] }}>{item.count}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
