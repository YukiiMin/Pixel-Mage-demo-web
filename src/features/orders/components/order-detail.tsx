"use client";

import { motion } from "framer-motion";
import {
	AlertCircle,
	ArrowLeft,
	CreditCard,
	FileText,
	Package,
	ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCancelOrder } from "@/features/orders/hooks/use-cancel-order";
import { useOrderDetail } from "@/features/orders/hooks/use-order-detail";
import { fadeInUp, staggerContainer } from "@/lib/motion-variants";

function formatVnd(amount: number): string {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	}).format(amount);
}

const STATUS_STYLE: Record<string, string> = {
	PENDING: "bg-yellow-400/10 text-yellow-300 border-yellow-400/30",
	PROCESSING: "bg-blue-400/10 text-blue-300 border-blue-400/30",
	COMPLETED: "bg-green-400/10 text-green-300 border-green-400/30",
	CANCELLED: "bg-red-400/10 text-red-300 border-red-400/30",
	PAID: "bg-green-400/10 text-green-300 border-green-400/30",
	FAILED: "bg-red-400/10 text-red-300 border-red-400/30",
};

function StatusBadge({ label }: { label: string }) {
	const style =
		STATUS_STYLE[label.toUpperCase()] ??
		"bg-muted/40 text-muted-foreground border-border/40";
	return (
		<span
			className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${style}`}
		>
			{label}
		</span>
	);
}

interface OrderDetailProps {
	orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
	const idNum = Number(orderId);
	const { data: order, isLoading, isError, error } = useOrderDetail(idNum);
	const cancelOrder = useCancelOrder();
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

	const handleCancel = () => {
		cancelOrder.mutate(idNum, {
			onSuccess: () => {
				toast.success("Đã huỷ đơn hàng thành công");
				setCancelDialogOpen(false);
			},
			onError: (err: any) => {
				toast.error(err.message || "Không thể huỷ đơn hàng");
			},
		});
	};

	return (
		<div
			className="container mx-auto max-w-3xl px-6 pb-20"
			data-testid="order-detail"
		>
			<div className="mb-6">
				<Link
					href="/orders"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
				>
					<ArrowLeft className="h-4 w-4" />
					Quay lại danh sách đơn hàng
				</Link>
			</div>

			<section className="mb-8 rounded-3xl border border-border/40 bg-linear-to-r from-card/80 via-card/60 to-card/40 p-6 md:p-8">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div>
						<p className="badge-mystic mb-3 inline-flex">Commerce</p>
						<h1
							className="text-3xl leading-tight text-foreground md:text-4xl"
							style={{ fontFamily: "Fruktur, var(--font-heading)" }}
						>
							Chi Tiết Đơn #{orderId}
						</h1>
					</div>

					{order && order.status === "PENDING" && (
						<AlertDialog
							open={cancelDialogOpen}
							onOpenChange={setCancelDialogOpen}
						>
							<AlertDialogTrigger asChild>
								<button
									data-testid="cancel-order-btn"
									className="inline-flex items-center justify-center rounded-xl bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors"
								>
									Huỷ đơn hàng
								</button>
							</AlertDialogTrigger>
							<AlertDialogContent
								className="glass-card border-border/50"
								data-testid="cancel-confirm-dialog"
							>
								<AlertDialogHeader>
									<AlertDialogTitle className="flex items-center gap-2">
										<AlertCircle className="h-5 w-5 text-destructive" /> Xác
										nhận huỷ
									</AlertDialogTitle>
									<AlertDialogDescription>
										Bạn có chắc chắn muốn huỷ đơn hàng này không? Hành động này
										không thể hoàn tác.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel disabled={cancelOrder.isPending}>
										Thoát
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={(e) => {
											e.preventDefault();
											handleCancel();
										}}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										disabled={cancelOrder.isPending}
									>
										{cancelOrder.isPending ? "Đang huỷ..." : "Đồng ý huỷ"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</div>
				<p className="mt-2 text-sm text-muted-foreground">
					Thông tin chi tiết và trạng thái xử lý từ backend.
				</p>
			</section>

			{isLoading && (
				<div className="glass-card space-y-4 rounded-2xl border border-border/50 p-8">
					<div className="h-5 w-48 animate-pulse rounded-lg bg-muted/40" />
					<div className="h-4 w-full animate-pulse rounded-lg bg-muted/40" />
					<div className="h-4 w-2/3 animate-pulse rounded-lg bg-muted/40" />
				</div>
			)}

			{isError && (
				<div className="glass-card rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5">
					<p className="text-sm font-semibold text-amber-200">
						{error?.message || "Không thể tải chi tiết đơn hàng lúc này."}
					</p>
				</div>
			)}

			{!isLoading && !isError && order && (
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="space-y-4"
				>
					{/* Status row */}
					<motion.div
						variants={fadeInUp}
						className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 p-5"
					>
						<div className="flex items-center gap-3">
							<Package className="h-5 w-5 text-primary" />
							<div>
								<p className="text-xs text-muted-foreground">Trạng thái đơn</p>
								<StatusBadge label={order.status} />
							</div>
						</div>
						<div className="flex items-center gap-3">
							<CreditCard className="h-5 w-5 text-primary" />
							<div>
								<p className="text-xs text-muted-foreground">Thanh toán</p>
								<StatusBadge label={order.paymentStatus} />
							</div>
						</div>
						<div className="text-right">
							<p className="text-xs text-muted-foreground">Tổng tiền</p>
							<p className="font-stats text-2xl font-bold text-primary">
								{formatVnd(order.totalAmount)}
							</p>
						</div>
					</motion.div>

					<motion.div
						variants={fadeInUp}
						className="glass-card rounded-2xl border border-border/50 p-5"
					>
						<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
							<CreditCard className="h-4 w-4 text-primary" /> Thông tin thanh
							toán
						</h3>
						<dl className="space-y-2 text-sm">
							<div className="flex justify-between">
								<dt className="text-muted-foreground">Ngày đặt hàng</dt>
								<dd className="font-medium text-foreground">
									{new Date(order.createdAt).toLocaleString("vi-VN")}
								</dd>
							</div>
						</dl>
					</motion.div>

					{order.notes && (
						<motion.div
							variants={fadeInUp}
							className="glass-card rounded-2xl border border-border/50 p-5"
						>
							<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
								<FileText className="h-4 w-4 text-primary" /> Ghi chú
							</h3>
							<p className="text-sm text-muted-foreground">{order.notes}</p>
						</motion.div>
					)}

					<motion.div
						variants={fadeInUp}
						className="glass-card rounded-2xl border border-border/50 p-5"
					>
						<h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
							<ShoppingBag className="h-4 w-4 text-primary" /> Sản phẩm đặt mua
						</h3>
						{!order.orderItems || order.orderItems.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								Chi tiết sản phẩm chưa được đồng bộ từ backend.
							</p>
						) : (
							<ul className="space-y-3">
								{order.orderItems.map((item) => {
									const subtotal = item.quantity * item.unitPrice;
									return (
										<li
											key={item.orderItemId}
											className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3"
										>
											<div>
												<p className="text-sm font-semibold text-foreground">
													{item.product?.name ?? "Sản phẩm"}
													{item.pack && (
														<span className="ml-2 text-xs font-normal text-muted-foreground">
															(Pack #{item.pack.packId})
														</span>
													)}
												</p>
												<p className="text-xs text-muted-foreground">
													Số lượng: {item.quantity} ×{" "}
													{formatVnd(item.unitPrice)}
												</p>
											</div>
											<p className="font-medium text-foreground">
												{formatVnd(subtotal)}
											</p>
										</li>
									);
								})}
							</ul>
						)}
						<div className="mt-4 flex justify-end border-t border-border/40 pt-3">
							<p className="text-sm font-semibold text-foreground">
								Tổng cộng:{" "}
								<span className="font-stats text-lg text-primary">
									{formatVnd(order.totalAmount)}
								</span>
							</p>
						</div>
					</motion.div>
				</motion.div>
			)}
		</div>
	);
}
