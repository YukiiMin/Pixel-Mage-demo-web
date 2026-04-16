"use client";

import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { useOrderStatusPoll } from "../hooks/use-order-status-poll";

interface SepayQrScreenProps {
	orderId: number;
	paymentUrl: string | null;
	totalAmount: number;
	onRetry: () => void;
	onClose: () => void;
}

export function SepayQrScreen({
	orderId,
	paymentUrl,
	totalAmount,
	onRetry,
	onClose,
}: SepayQrScreenProps) {
	const router = useRouter();
	const [countdown, setCountdown] = useState(600); // 10 minutes
	const [isExpired, setIsExpired] = useState(false);
	const [showRetryConfirm, setShowRetryConfirm] = useState(false);

	// Poll cho paymentStatus, dừng lại nếu đã isExpired
	const { data: order } = useOrderStatusPoll(isExpired ? null : orderId);

	useEffect(() => {
		if (countdown <= 0) {
			if (!isExpired) setIsExpired(true);
			return;
		}
		const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
		return () => clearInterval(timer);
	}, [countdown, isExpired]);

	useEffect(() => {
		if (order?.paymentStatus === "SUCCEEDED") {
			import("canvas-confetti").then((confetti) => {
				confetti.default({
					particleCount: 150,
					spread: 70,
					origin: { y: 0.6 },
					colors: ["#a855f7", "#3b82f6", "#f59e0b"],
					zIndex: 9999,
				});
			});
			toast.success("Thanh toán thành công! Đang chuyển hướng...");
			setTimeout(() => {
				onClose();
				router.push(`/orders/${orderId}`);
			}, 2500);
		}
	}, [order?.paymentStatus, orderId, router, onClose]);

	const min = Math.floor(countdown / 60);
	const sec = countdown % 60;
	const timeString = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;

	const isFailed =
		order?.paymentStatus === "FAILED" || order?.status === "CANCELLED";

	return (
		<div
			className="flex flex-col items-center justify-center space-y-6 pt-4 text-center"
			data-testid="sepay-qr-screen"
		>
			<div className="space-y-1">
				<h3 className="text-xl font-bold tracking-tight text-foreground">
					Thanh toán VietQR
				</h3>
				<p className="text-sm text-muted-foreground">
					Đơn #{orderId} ·{" "}
					<span className="font-stats font-bold text-primary">
						{totalAmount.toLocaleString("vi-VN")} VND
					</span>
				</p>
			</div>

			<div className="relative flex aspect-square w-64 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm border border-border/50">
				{paymentUrl ? (
					<img
						src={paymentUrl}
						alt="QR chuyển khoản"
						className="h-full w-full object-contain"
						data-testid="qr-image"
					/>
				) : (
					<div className="flex flex-col items-center space-y-2 text-muted-foreground">
						<AlertCircle className="h-8 w-8 text-amber-500" />
						<p className="text-sm">Không thể tải mã QR. Vui lòng thử lại.</p>
					</div>
				)}

				{(isExpired || isFailed) && (
					<div
						className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-4"
						data-testid="qr-expired-overlay"
					>
						<AlertCircle className="mb-2 h-10 w-10 text-destructive" />
						<p className="text-sm font-semibold text-foreground">
							{isFailed ? "Giao dịch đã bị huỷ" : "Mã QR đã hết hạn"}
						</p>
						<button
							onClick={() => setShowRetryConfirm(true)}
							className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Thử lại
						</button>
					</div>
				)}
			</div>

			<div className="space-y-4">
				{!isExpired && !isFailed && (
					<div className="flex flex-col items-center space-y-2">
						<div
							className="flex items-center gap-2 text-sm text-muted-foreground"
							data-testid="qr-countdown"
						>
							<Clock className="h-4 w-4" />
							<span>
								Hết hạn sau:{" "}
								<span className="font-stats font-semibold">{timeString}</span>
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-primary">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Đang chờ xác nhận...</span>
						</div>
					</div>
				)}

				<button
					onClick={onClose}
					className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					← Quay lại Marketplace
				</button>
			</div>

			<AlertDialog open={showRetryConfirm} onOpenChange={setShowRetryConfirm}>
				<AlertDialogContent className="glass-card border-border/50">
					<AlertDialogHeader>
						<AlertDialogTitle>Tạo lại đơn hàng?</AlertDialogTitle>
						<AlertDialogDescription>
							Mã QR hiện tại đã hết hạn hoặc giao dịch bị huỷ. Bạn có muốn tạo
							lại đơn hàng này không?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Huỷ</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setShowRetryConfirm(false);
								onRetry();
							}}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							Tạo lại
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
