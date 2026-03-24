"use client";

import { CreditCard, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVnd } from "@/features/marketplace/hooks/use-marketplace";
import { usePackDetail } from "@/features/marketplace/hooks/use-pack-detail";
import { SepayQrScreen } from "@/features/orders/components/sepay-qr-screen";
import { useCreateOrder } from "@/features/orders/hooks/use-create-order";
import { useInitiatePayment } from "@/features/orders/hooks/use-initiate-payment";
import { DropRateTable } from "./drop-rate-table";

interface PackDetailModalProps {
	open: boolean;
	packId: number | null;
	onClose: () => void;
}

export function PackDetailModal({
	open,
	packId,
	onClose,
}: PackDetailModalProps) {
	const { data: pack, isLoading, isError } = usePackDetail(packId);
	const [checkoutState, setCheckoutState] = useState<
		"idle" | "creating_order" | "initiating_payment" | "qr_ready"
	>("idle");
	const [quantity, setQuantity] = useState<number>(1);
	const createOrder = useCreateOrder();
	const initiatePayment = useInitiatePayment();
	const [checkoutData, setCheckoutData] = useState<{
		orderId: number;
		paymentUrl: string | null;
		totalAmount: number;
	} | null>(null);

	const handleCheckout = () => {
		if (!pack || pack.status !== "STOCKED") return;
		setCheckoutState("creating_order");

		createOrder.mutate(
			{ packId: pack.packId, quantity, note: "Mua từ Marketplace" },
			{
				onSuccess: (orderData) => {
					setCheckoutState("initiating_payment");
					initiatePayment.mutate(
						{
							orderId: orderData.orderId,
							amount: orderData.totalAmount,
							currency: "VND",
						},
						{
							onSuccess: (paymentData) => {
								setCheckoutData({
									orderId: orderData.orderId,
									paymentUrl: paymentData.paymentUrl,
									totalAmount: orderData.totalAmount,
								});
								setCheckoutState("qr_ready");
							},
							onError: (err: any) => {
								toast.error(err.message || "Lỗi khởi tạo cổng thanh toán");
								setCheckoutState("idle");
							},
						},
					);
				},
				onError: (err: any) => {
					if (err.status === 409) toast.error("Pack đã hết hàng");
					else if (err.status === 503)
						toast.error("Hệ thống tạm gián đoạn, thử lại sau");
					else toast.error(err.message || "Lỗi tạo đơn hàng");
					setCheckoutState("idle");
				},
			},
		);
	};

	const resetCheckout = () => {
		setCheckoutState("idle");
		setCheckoutData(null);
	};

	const handleClose = () => {
		resetCheckout();
		onClose();
	};

	// Prevent accessing if dialog is not somewhat loaded
	const showContent = !isLoading && !isError && pack;

	// Rarity based glow effect
	let glowColor = "rgba(var(--primary), 0.1)"; // Default
	if (pack?.name.toLowerCase().includes("legendary"))
		glowColor = "rgba(251, 191, 36, 0.15)";
	else if (pack?.name.toLowerCase().includes("rare"))
		glowColor = "rgba(168, 85, 247, 0.15)";

	return (
		<Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
			{/* glass-heavy style with blur 24px and opacity 0.85 approx via Tailwind or custom CSS */}
			<DialogContent
				className="glass-heavy max-h-[90vh] max-w-lg overflow-y-auto border-border/50 bg-background/85 p-0 backdrop-blur-2xl"
				data-testid="pack-detail-modal"
				style={{ boxShadow: `0 0 60px -15px ${glowColor}` }}
			>
				<DialogTitle className="sr-only">Pack Detail</DialogTitle>
				<DialogDescription className="sr-only">
					Pack Detail & Drop Rates
				</DialogDescription>

				{/* Close Button manually tailored for glass modal */}
				<button
					onClick={handleClose}
					className="absolute right-4 top-4 z-50 rounded-full bg-background/50 p-2 text-muted-foreground backdrop-blur-md transition-colors hover:bg-muted hover:text-foreground"
					data-testid="pack-detail-close"
				>
					<X className="h-4 w-4" />
				</button>

				{isLoading && (
					<div className="p-6">
						<Skeleton className="mb-4 h-8 w-3/4" />
						<Skeleton className="mb-6 h-4 w-full" />
						<Skeleton className="mb-2 h-40 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				)}

				{isError && (
					<div className="p-6 py-12 text-center text-muted-foreground">
						<p>Không thể tải thông tin pack lúc này.</p>
					</div>
				)}

				{showContent && checkoutState === "qr_ready" && checkoutData && (
					<div className="p-6">
						<SepayQrScreen
							orderId={checkoutData.orderId}
							paymentUrl={checkoutData.paymentUrl}
							totalAmount={checkoutData.totalAmount}
							onRetry={handleCheckout}
							onClose={handleClose}
						/>
					</div>
				)}

				{showContent && checkoutState !== "qr_ready" && (
					<>
						{/* Header section (image or styling placeholder) */}
						<div className="relative h-32 overflow-hidden bg-muted">
							<div className="absolute inset-0 bg-linear-to-b from-transparent to-background/90" />
						</div>

						<div className="relative -mt-10 px-6 pb-6">
							<div className="mb-2 flex items-start justify-between">
								<h2 className="text-2xl font-bold text-foreground">
									{pack.name}
								</h2>
							</div>

							<div className="mb-4 flex flex-wrap gap-2">
								<span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
									{pack.cardCount} Cards
								</span>
								{pack.isLimited && (
									<span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
										Limited Edition
									</span>
								)}
							</div>

							<p className="mb-6 text-sm text-muted-foreground leading-relaxed">
								{pack.description}
							</p>

							{/* Price */}
							<div className="mb-6">
								<p className="text-sm font-medium text-muted-foreground">Giá</p>
								<p
									className="font-stats mt-1 text-3xl font-bold text-foreground"
									style={{ fontFamily: "Space Grotesk, var(--font-heading)" }}
								>
									{formatVnd(pack.price)}
								</p>
							</div>

							<DropRateTable />

							<div className="mt-6 flex items-center justify-between gap-4">
								<div className="flex flex-col gap-1">
									<label
										htmlFor="pack-quantity"
										className="text-xs font-semibold text-muted-foreground"
									>
										Số lượng
									</label>
									<input
										id="pack-quantity"
										type="number"
										min={1}
										defaultValue={1}
										className="h-10 w-20 rounded-lg border border-border/50 bg-background/50 px-3 text-center text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
										onChange={(e) =>
											setQuantity(
												Math.max(1, Number.parseInt(e.target.value) || 1),
											)
										}
									/>
								</div>

								<button
									type="button"
									onClick={handleCheckout}
									disabled={
										checkoutState !== "idle" || pack.status !== "STOCKED"
									}
									className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
									data-testid="checkout-btn"
								>
									{checkoutState !== "idle" ? (
										<Loader2 className="h-5 w-5 animate-spin" />
									) : (
										<>
											<CreditCard className="h-5 w-5" />
											{pack.status === "STOCKED"
												? "Mua ngay"
												: pack.status === "SOLD"
													? "Đã bán"
													: "Đã đặt trước"}
										</>
									)}
								</button>
							</div>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
