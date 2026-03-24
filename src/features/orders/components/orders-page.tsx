"use client";

import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { getStoredUserId } from "@/lib/api-config";

function formatVnd(amount: number): string {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function OrdersPage() {
	const userId = getStoredUserId();
	const { data: orders = [], isLoading, isError, error } = useOrders(userId);

	const stats = useMemo(() => {
		const totalPaid = orders
			.filter((order) => order.paymentStatus.toUpperCase() === "PAID")
			.reduce((sum, order) => sum + order.totalAmount, 0);
		return { totalOrders: orders.length, totalPaid };
	}, [orders]);

	return (
		<div className="container mx-auto max-w-6xl px-6 pb-20">
			<section className="mb-8 rounded-3xl border border-border/40 bg-linear-to-r from-card/80 via-card/60 to-card/40 p-6 md:p-8">
				<p className="badge-mystic mb-3 inline-flex">Commerce</p>
				<h1
					className="text-4xl leading-tight text-foreground md:text-5xl"
					style={{ fontFamily: "Fruktur, var(--font-heading)" }}
				>
					Orders
				</h1>
				<p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
					Theo dõi trạng thái đơn hàng và lịch sử thanh toán đồng bộ từ backend.
				</p>

				<div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
					<div className="glass-card rounded-xl border border-border/40 p-4">
						<p className="text-xs text-muted-foreground">Tổng đơn hàng</p>
						<p className="font-stats mt-1 text-2xl font-bold text-primary">
							{stats.totalOrders}
						</p>
					</div>
					<div className="glass-card rounded-xl border border-border/40 p-4">
						<p className="text-xs text-muted-foreground">
							Tổng thanh toán thành công
						</p>
						<p className="font-stats mt-1 text-2xl font-bold text-primary">
							{formatVnd(stats.totalPaid)}
						</p>
					</div>
				</div>
			</section>

			<div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
				<ReceiptText className="h-4 w-4 text-primary" />
				{isLoading
					? "Đang đồng bộ Orders từ BE..."
					: "Lịch sử đơn hàng và trạng thái cập nhật theo dữ liệu backend."}
			</div>

			{isError ? (
				<div
					className="glass-card mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5 flex flex-col items-center justify-center min-h-[200px]"
					data-testid="error-state"
				>
					<p className="text-sm font-semibold text-amber-200">
						{error?.message || "Không thể tải Orders từ hệ thống."}
					</p>
				</div>
			) : null}

			{isLoading ? (
				<div className="space-y-3" data-testid="orders-list">
					<Skeleton
						className="h-32 w-full rounded-2xl"
						data-testid="card-skeleton"
					/>
					<Skeleton
						className="h-32 w-full rounded-2xl"
						data-testid="card-skeleton"
					/>
					<Skeleton
						className="h-32 w-full rounded-2xl"
						data-testid="card-skeleton"
					/>
				</div>
			) : !isError && orders.length === 0 ? (
				<div
					className="glass-card mb-6 rounded-2xl border border-border/40 bg-card/60 p-8 text-center"
					data-testid="empty-state"
				>
					<p className="text-sm text-muted-foreground">
						Bạn chưa có đơn hàng nào.
					</p>
				</div>
			) : !isError ? (
				<section className="space-y-3" data-testid="orders-list">
					{orders.map((order) => {
						let badgeClass =
							"bg-muted/40 text-muted-foreground border-border/40";
						if (order.status === "PENDING") {
							badgeClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
						} else if (order.status === "PROCESSING") {
							badgeClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
						} else if (order.status === "COMPLETED") {
							badgeClass = "bg-green-500/10 text-green-500 border-green-500/20";
						} else if (order.status === "CANCELLED") {
							badgeClass =
								"bg-destructive/10 text-destructive border-destructive/20";
						}

						return (
							<article
								key={order.orderId}
								className="glass-card rounded-2xl border border-border/50 p-5"
								data-testid={`order-card-${order.orderId}`}
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="text-sm text-muted-foreground">
											Đơn #{order.orderId}
										</p>
										<p
											className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
											data-testid={`order-status-${order.orderId}`}
										>
											{order.status}
										</p>
									</div>
									<div className="text-right">
										<p className="text-sm text-muted-foreground">
											{order.paymentStatus}
										</p>
										<p className="font-stats text-xl font-bold text-primary">
											{formatVnd(order.totalAmount)}
										</p>
									</div>
								</div>
								<p className="mt-3 text-sm text-muted-foreground">
									Ngày: {new Date(order.createdAt).toLocaleString("vi-VN")}
								</p>
								<div className="mt-3 flex justify-end">
									<Link
										href={`/orders/${order.orderId}`}
										className="text-xs font-medium text-primary transition-colors hover:underline"
									>
										Xem chi tiết →
									</Link>
								</div>
							</article>
						);
					})}
				</section>
			) : null}
		</div>
	);
}
