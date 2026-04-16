"use client";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { LeafletMapPicker } from "@/components/shared/leaflet-map-picker";
import { formatVnd } from "@/features/marketplace/hooks/use-marketplace";
import { useCreateOrder } from "@/features/orders/hooks/use-create-order";
import { useInitiatePayment } from "@/features/orders/hooks/use-initiate-payment";
import type { ProductResponse } from "@/types/commerce";
import {
	Loader2,
	MapPin,
	Package,
	Minus,
	Plus,
	CreditCard,
	ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExpressCheckoutDrawerProps {
	open: boolean;
	onClose: () => void;
	product: ProductResponse | null;
	onQrReady: (checkoutData: { orderId: number; paymentUrl: string; totalAmount: number }) => void;
}

export function ExpressCheckoutDrawer({
	open,
	onClose,
	product,
	onQrReady,
}: ExpressCheckoutDrawerProps) {
	const [quantity, setQuantity] = useState(1);
	const [isProcessing, setIsProcessing] = useState(false);
	const [shippingAddress, setShippingAddress] = useState(
		"Vui long cap nhat dia chi o trang Ho so"
	);
	const [showMapPicker, setShowMapPicker] = useState(false);

	const createOrder = useCreateOrder();
	const initiatePayment = useInitiatePayment();

	const handleCheckout = () => {
		if (!product) return;
		setIsProcessing(true);

		createOrder.mutate(
			{
				orderItems: [
					{
						productId: product.productId,
						quantity: quantity,
						unitPrice: product.price,
						subtotal: product.price * quantity,
					},
				],
				totalAmount: product.price * quantity,
				paymentMethod: "SEPAY",
				shippingAddress: shippingAddress,
				notes: `Express Checkout: ${quantity}x ${product.name}`,
			},
			{
				onSuccess: (orderData) => {
					initiatePayment.mutate(
						{
							orderId: orderData.orderId,
							amount: orderData.totalAmount,
							currency: "VND",
						},
						{
							onSuccess: (paymentData) => {
								setIsProcessing(false);
								onClose();
								onQrReady({
									orderId: orderData.orderId,
									paymentUrl: paymentData.paymentUrl,
									totalAmount: orderData.totalAmount,
								});
							},
							onError: (err: Error) => {
								toast.error(err.message || "Loi khoi tao thanh toan");
								setIsProcessing(false);
							},
						}
					);
				},
				onError: (err: Error) => {
					setIsProcessing(false);
					toast.error(err.message || "Loi tao don hang");
				},
			}
		);
	};

	if (!product) return null;

	const subtotal = product.price * quantity;
	const shippingFee = 0;
	const totalAmount = subtotal + shippingFee;

	return (
		<>
			<Sheet open={open} onOpenChange={(val) => !val && onClose()}>
				<SheetContent
					side="right"
					className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background/95 backdrop-blur-xl border-l border-border/50 z-50 relative overflow-hidden"
				>
					{/* MAP PICKER OVERLAY — sits inside SheetContent to bypass Radix pointer-events blocking */}
					{showMapPicker && (
						<div
							className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
							onClick={() => setShowMapPicker(false)}
						>
							<div
								className="bg-card w-full rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col"
								style={{ maxHeight: "90%" }}
								onClick={(e) => e.stopPropagation()}
							>
								{/* Map header */}
								<div className="p-4 border-b border-border/50 flex items-center gap-2 bg-muted/20 shrink-0">
									<MapPin className="w-5 h-5 text-primary shrink-0" />
									<h3 className="font-semibold text-sm flex-1">Chon dia chi giao hang</h3>
								</div>
								{/* Map body */}
								<div className="flex-1 min-h-0 overflow-y-auto p-4">
									<LeafletMapPicker
										onLocationSelect={(_lat, _lng, address) => {
											if (address) {
												setShippingAddress(address);
												setShowMapPicker(false);
												toast.success("Da cap nhat dia chi giao hang");
											}
										}}
									/>
								</div>
								{/* Map footer */}
								<div className="p-3 text-right border-t border-border/50 bg-muted/20 shrink-0">
									<Button variant="ghost" size="sm" onClick={() => setShowMapPicker(false)}>
										Dong
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* HEADER */}
					<SheetHeader className="p-5 border-b border-border/50 text-left shrink-0">
						<SheetTitle className="text-xl font-bold bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
							<CreditCard className="w-5 h-5 text-primary" />
							Phieu Thanh Toan
						</SheetTitle>
						<SheetDescription className="hidden">Checkout Details</SheetDescription>
					</SheetHeader>

					{/* SCROLLABLE BODY */}
					<div className="flex-1 overflow-y-auto w-full">
						<div className="p-4 sm:p-5 space-y-5">

							{/* --- Address --- */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
										<MapPin className="w-4 h-4 text-primary" />
										Dia chi nhan hang
									</h3>
									<button
										onClick={() => setShowMapPicker(true)}
										className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
									>
										Thay doi
									</button>
								</div>

								<div
									onClick={() => setShowMapPicker(true)}
									className="bg-card border border-border/50 rounded-xl p-3.5 relative overflow-hidden group cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
								>
									<div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-primary/5 to-transparent skew-x-12" />
									<div className="flex items-start gap-3 relative z-10">
										<div className="mt-0.5 bg-primary/10 p-1.5 rounded-full shrink-0">
											<MapPin className="w-4 h-4 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium text-foreground whitespace-normal line-clamp-2">
												{shippingAddress}
											</p>
											<p className="text-[10px] text-muted-foreground mt-0.5">Mac dinh</p>
										</div>
										<ChevronRight className="w-4 h-4 text-muted-foreground self-center opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
									</div>
								</div>
							</div>

							{/* --- Product --- */}
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
									<Package className="w-4 h-4 text-primary" />
									San pham
								</h3>
								<div className="bg-card border border-border/50 rounded-xl p-3.5">
									<div className="flex gap-4">
										<div className="w-16 h-20 shrink-0 rounded-md overflow-hidden bg-muted relative">
											<img
												src={product.imageUrl || "https://placehold.co/120x168"}
												alt={product.name}
												className="w-full h-full object-cover"
											/>
											<div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-md" />
										</div>
										<div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
											<div>
												<h4 className="text-sm font-semibold text-foreground line-clamp-1">
													{product.name}
												</h4>
												<p className="font-stats text-primary font-bold text-sm mt-1">
													{formatVnd(product.price)}
												</p>
											</div>
											<div className="flex items-center border border-border/50 rounded-lg overflow-hidden bg-background w-fit mt-2">
												<button
													className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
													onClick={() => setQuantity(Math.max(1, quantity - 1))}
													disabled={quantity <= 1}
												>
													<Minus className="w-3 h-3" />
												</button>
												<span className="w-8 text-center text-xs font-semibold">{quantity}</span>
												<button
													className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
													onClick={() =>
														setQuantity(Math.min(product.stockCount, quantity + 1))
													}
													disabled={quantity >= product.stockCount}
												>
													<Plus className="w-3 h-3" />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* --- Payment Method --- */}
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Phuong thuc thanh toan</h3>
								<div className="border-2 border-primary/40 rounded-xl p-3 bg-primary/5 flex items-center gap-3 relative overflow-hidden cursor-pointer">
									<div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-linear-to-r from-transparent via-purple-500/10 to-transparent skew-x-12" />
									<div className="w-8 h-8 rounded bg-white flex items-center justify-center shrink-0 p-1 relative z-10 shadow-sm border border-border/20">
										<img
											src="https://sepay.vn/assets/img/logo-dark.svg"
											alt="SEPay QR"
											className="max-w-full h-auto object-contain"
										/>
									</div>
									<div className="flex-1 relative z-10">
										<p className="text-sm font-bold text-foreground">SEPay QR Code</p>
										<p className="text-[10px] text-muted-foreground">
											Chuyen khoan lien ngan hang mien phi
										</p>
									</div>
									<div className="w-4 h-4 rounded-full border-4 border-primary bg-background shrink-0 relative z-10" />
								</div>
							</div>

							{/* --- Bill Summary --- */}
							<div className="bg-card/50 rounded-xl p-4 space-y-2.5 border border-border/30">
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>Tam tinh ({quantity} san pham)</span>
									<span className="font-stats">{formatVnd(subtotal)}</span>
								</div>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>Phi van chuyen</span>
									<span className="font-stats">
										{shippingFee === 0 ? "Mien phi" : formatVnd(shippingFee)}
									</span>
								</div>
								<div className="h-px bg-border/50 w-full my-1" />
								<div className="flex justify-between items-end">
									<span className="text-sm font-semibold">Tong thanh toan</span>
									<span className="font-stats text-xl font-bold text-primary">
										{formatVnd(totalAmount)}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* STICKY FOOTER CTA */}
					<div className="p-4 sm:p-5 border-t border-border/50 bg-background/80 backdrop-blur-md shrink-0">
						<button
							onClick={handleCheckout}
							disabled={isProcessing || product.stockCount <= 0}
							className="relative flex h-12 sm:h-14 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-purple-500 px-4 text-base font-bold text-primary-foreground shadow-xl transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 active:translate-y-0 overflow-hidden disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
						>
							<div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/25 to-transparent skew-x-12" />
							{isProcessing ? (
								<>
									<Loader2 className="h-5 w-5 animate-spin relative z-10" />
									<span className="relative z-10">Dang xu ly...</span>
								</>
							) : (
								<span className="relative z-10 flex items-center gap-2">
									Tien hanh Thanh Toan <ChevronRight className="w-4 h-4 ml-1" />
								</span>
							)}
						</button>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
