"use client";

import { ShoppingBag, FileText, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { Input } from "@/components/ui/input";
import type { PageResponse } from "@/types/api";

export interface StaffOrder {
	orderId: number;
	status: string;
	paymentStatus?: string;
	totalAmount?: number;
	finalAmount?: number;
	amount?: number;
	customerName?: string;
	userId?: number;
	createdAt?: string | number[];
	orderDate?: string | number[];
}

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

function getOrderAmount(order: StaffOrder): number {
	return order.finalAmount ?? order.totalAmount ?? order.amount ?? 0;
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
			className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
				map[status] ?? "bg-muted/40 text-muted-foreground"
			}`}
		>
			{status}
		</span>
	);
}

export default function StaffOrdersPage() {
	const { data: orders, isLoading } = useQuery({
		queryKey: ["admin-orders"],
		queryFn: async (): Promise<StaffOrder[]> => {
			const res = await apiRequest<PageResponse<StaffOrder> | StaffOrder[]>(
				`${API_ENDPOINTS.orderManagement.list}?size=50&sort=createdAt,desc`
			);
			const data = res.data;
			if (data && typeof data === "object" && "content" in data) {
				return data.content;
			}
			if (Array.isArray(data)) {
				return data;
			}
			return [];
		},
		refetchInterval: 15000,
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
				<div>
					<p className="badge-mystic inline-flex mb-2">Staff Portal</p>
					<h1
						className="text-3xl text-foreground"
						style={{ fontFamily: "Fruktur, var(--font-heading)" }}
					>
						Quản lý Đơn hàng
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Xem và quản lý tất cả các đơn hàng hệ thống
					</p>
				</div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm kiếm mã đơn hàng..." className="pl-9 glass-card" />
                </div>
			</div>

			<div className="glass-card rounded-2xl border border-border/50 p-5">
				{isLoading ? (
					<div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
						Đang tải danh sách đơn hàng...
					</div>
				) : !orders || orders.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-12 text-center">
						<div className="mb-4 rounded-full bg-primary/10 p-4">
							<FileText className="h-8 w-8 text-primary" />
						</div>
						<h3 className="text-lg font-semibold text-foreground">
							Chưa có đơn hàng nào
						</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Hệ thống chưa ghi nhận đơn hàng mới.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border/40 text-xs font-medium text-muted-foreground">
									<th className="pb-3 text-left">Mã Đơn</th>
									<th className="pb-3 text-left">Khách hàng</th>
									<th className="pb-3 text-left">Ngày đặt</th>
									<th className="pb-3 text-left">Tổng tiền</th>
									<th className="pb-3 text-left">Thanh toán</th>
									<th className="pb-3 text-right">Trạng thái</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((order: StaffOrder) => (
									<tr
										key={order.orderId}
										className="border-b border-border/20 text-sm last:border-0 hover:bg-white/5 transition-colors"
									>
										<td className="py-4 font-stats text-sm text-primary font-semibold">
											#{order.orderId}
										</td>
										<td className="py-4 font-medium text-foreground">
											{order.customerName || `Customer #${order.userId || "---"}`}
										</td>
										<td className="py-4 text-muted-foreground">
											{parseArrayDate(order.createdAt || order.orderDate)}
										</td>
										<td className="py-4 font-stats font-semibold text-foreground">
											{formatVnd(getOrderAmount(order))}
										</td>
										<td className="py-4">
                                            <StatusBadge status={order.paymentStatus || order.status} />
										</td>
                                        <td className="py-4 text-right">
                                            <StatusBadge status={order.status} />
                                        </td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
