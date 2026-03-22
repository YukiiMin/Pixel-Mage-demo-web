"use client";

import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { useOrders } from "@/features/orders/hooks/use-orders";

function formatVnd(amount: number): string {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function OrdersPage() {
	const { orders, status, statusMessage, stats } = useOrders();
	const isReady = status === "ready";

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
				{status === "loading"
					? "Đang đồng bộ Orders từ BE..."
					: "Lịch sử đơn hàng và trạng thái cập nhật theo dữ liệu backend."}
			</div>

			{!isReady ? (
				<div className="glass-card mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5">
					<p className="text-sm font-semibold text-amber-200">
						{statusMessage || "Chức năng Orders chưa cập nhật."}
					</p>
				</div>
			) : null}

			{isReady ? (
				<section className="space-y-3">
					{orders.map((order) => (
						<article
							key={order.id}
							className="glass-card rounded-2xl border border-border/50 p-5"
						>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-sm text-muted-foreground">
										Đơn #{order.id}
									</p>
									<p className="text-lg font-semibold text-foreground">
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
							<p className="mt-2 text-sm text-muted-foreground">
								Thanh toán: {order.paymentMethod} • Ngày:{" "}
								{new Date(order.orderDate).toLocaleString("vi-VN")}
							</p>
							{order.shippingAddress ? (
								<p className="mt-1 text-sm text-muted-foreground">
									Giao tới: {order.shippingAddress}
								</p>
							) : null}
							<div className="mt-3 flex justify-end">
								<Link
									href={`/orders/${order.id}`}
									className="text-xs font-medium text-primary transition-colors hover:underline"
								>
									Xem chi tiết →
								</Link>
							</div>
						</article>
					))}
				</section>
			) : null}
		</div>
	);
}
