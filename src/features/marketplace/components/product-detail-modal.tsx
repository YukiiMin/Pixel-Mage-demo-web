"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatVnd } from "@/features/marketplace/hooks/use-marketplace";
import { SepayQrScreen } from "@/features/orders/components/sepay-qr-screen";
import { useCreateOrder } from "@/features/orders/hooks/use-create-order";
import { useInitiatePayment } from "@/features/orders/hooks/use-initiate-payment";
import type { CardTemplateSummaryResponse, ProductResponse, Rarity } from "@/types/commerce";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Circle, CreditCard, Crown, Gem, Loader2, Package, Sparkles, Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Rarity bar component with animation
function RarityBar({
	label,
	percentage,
	color,
	bgColor,
	delay = 0
}: {
	label: string;
	percentage: number;
	color: string;
	bgColor: string;
	delay?: number;
}) {
	return (
		<div className="mb-2 sm:mb-3">
			<div className="mb-1 flex items-center justify-between">
				<span className={`text-[10px] sm:text-xs font-semibold ${color}`}>{label}</span>
				<span className={`text-[10px] sm:text-xs font-bold ${color}`}>{percentage}%</span>
			</div>
			<div className="h-2 sm:h-2.5 w-full overflow-hidden rounded-full bg-muted">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${percentage}%` }}
					transition={{ delay, duration: 0.8, ease: "easeOut" }}
					className={`h-full rounded-full ${bgColor}`}
				/>
			</div>
		</div>
	);
}

// Get rarity color classes for text
function getRarityTextClass(rarity: Rarity): string {
	switch (rarity) {
		case "LEGENDARY":
			return "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] font-bold";
		case "RARE":
			return "text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)] font-semibold";
		case "COMMON":
		default:
			return "text-sky-400";
	}
}

// Get rarity icon
function getRarityIcon(rarity: Rarity) {
	switch (rarity) {
		case "LEGENDARY":
			return <Crown className="h-3 w-3 text-amber-400" />;
		case "RARE":
			return <Gem className="h-3 w-3 text-purple-400" />;
		case "COMMON":
		default:
			return <Circle className="h-3 w-3 text-sky-400" />;
	}
}

// Get rarity glow for card
function getRarityGlow(rarity: Rarity): string {
	switch (rarity) {
		case "LEGENDARY":
			return "shadow-[0_0_15px_rgba(251,191,36,0.4)] border-amber-400/50";
		case "RARE":
			return "shadow-[0_0_12px_rgba(168,85,247,0.3)] border-purple-400/40";
		case "COMMON":
		default:
			return "shadow-[0_0_8px_rgba(56,189,248,0.2)] border-sky-400/30";
	}
}

// Card with subtle 3D tilt animation (10 degrees)
function TiltCard({
	card,
	index,
	onHover,
	size = "normal"
}: {
	card: CardTemplateSummaryResponse;
	index: number;
	onHover?: (card: CardTemplateSummaryResponse | null) => void;
	size?: "small" | "normal";
}) {
	const [rotation, setRotation] = useState({ x: 0, y: 0 });
	const glowClass = getRarityGlow(card.rarity);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rotateX = ((y - centerY) / centerY) * -10;
		const rotateY = ((x - centerX) / centerX) * 10;
		setRotation({ x: rotateX, y: rotateY });
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: index * 0.05, duration: 0.3 }}
			className="relative"
			style={{ perspective: "1000px" }}
			onMouseEnter={() => onHover?.(card)}
			onMouseLeave={() => {
				setRotation({ x: 0, y: 0 });
				onHover?.(null);
			}}
		>
			<motion.div
				onMouseMove={handleMouseMove}
				animate={{ rotateX: rotation.x, rotateY: rotation.y }}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
				className={`relative cursor-pointer rounded-lg border-2 border-border/50 bg-card shadow-lg transition-shadow duration-300 ${glowClass} ${
					size === "small" ? "h-14 w-10 sm:h-16 sm:w-12" : "h-16 w-12 sm:h-20 sm:w-14"
				}`}
				style={{ transformStyle: "preserve-3d" }}
			>
				<img
					src={card.imagePath || "https://placehold.co/120x168?text=?"}
					alt={card.name}
					className="h-full w-full rounded-lg object-cover"
				/>
				{card.rarity === "LEGENDARY" && (
					<div className="absolute inset-0 rounded-lg border-2 border-amber-400/60 shadow-[inset_0_0_10px_rgba(251,191,36,0.3)]" />
				)}
				{card.rarity === "RARE" && (
					<div className="absolute inset-0 rounded-lg border-2 border-purple-400/50 shadow-[inset_0_0_8px_rgba(168,85,247,0.3)]" />
				)}
				<div className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5 backdrop-blur-sm">
					{getRarityIcon(card.rarity)}
				</div>
			</motion.div>
		</motion.div>
	);
}

interface ProductDetailModalProps {
	product: ProductResponse | null;
	open: boolean;
	onClose: () => void;
}

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
	const [checkoutState, setCheckoutState] = useState<
		"idle" | "creating_order" | "initiating_payment" | "qr_ready"
	>("idle");
	const [checkoutData, setCheckoutData] = useState<{
		orderId: number;
		paymentUrl: string | null;
		totalAmount: number;
	} | null>(null);
	const [showPoolPanel, setShowPoolPanel] = useState(false);
	const [hoveredCard, setHoveredCard] = useState<CardTemplateSummaryResponse | null>(null);

	const createOrder = useCreateOrder();
	const initiatePayment = useInitiatePayment();

	const handleCheckout = () => {
		if (!product || product.stockCount <= 0) return;
		setCheckoutState("creating_order");
		createOrder.mutate(
			{
				packIds: [product.productId],
				paymentMethod: "SEPAY",
				shippingAddress: "Digital Delivery",
				notes: `Mua ${product.name} từ Shop`,
			},
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
								toast.error(err.message || "Lỗi khởi tạo thanh toán");
								setCheckoutState("idle");
							},
						}
					);
				},
				onError: (err: any) => {
					if (err.status === 409) toast.error("Sản phẩm đã hết hàng");
					else if (err.status === 503) toast.error("Hệ thống tạm gián đoạn");
					else toast.error(err.message || "Lỗi tạo đơn hàng");
					setCheckoutState("idle");
				},
			}
		);
	};

	const resetCheckout = () => {
		setCheckoutState("idle");
		setCheckoutData(null);
	};

	const handleClose = () => {
		resetCheckout();
		setShowPoolPanel(false);
		onClose();
	};

	if (!product) return null;

	const sortedPool = [...(product.poolPreview || [])].sort((a, b) => {
		const rarityOrder = { LEGENDARY: 3, RARE: 2, COMMON: 1 };
		return rarityOrder[b.rarity] - rarityOrder[a.rarity];
	});
	const topCards = sortedPool.slice(0, 5);
	const remainingCards = sortedPool.slice(5);

	const legendaryCount = remainingCards.filter((c) => c.rarity === "LEGENDARY").length;
	const rareCount = remainingCards.filter((c) => c.rarity === "RARE").length;
	const commonCount = remainingCards.filter((c) => c.rarity === "COMMON").length;

	return (
		<Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
			<DialogContent 
				className="max-h-[90vh] w-[calc(100vw-1rem)] sm:w-auto overflow-hidden border-border/50 bg-background/95 p-0 backdrop-blur-xl"
				style={{ maxWidth: showPoolPanel ? "min(900px, 95vw)" : "min(400px, 90vw)" }}
			>
				<DialogTitle className="sr-only">{product.name}</DialogTitle>
				<DialogDescription className="sr-only">Chi tiết sản phẩm và thanh toán</DialogDescription>

				{/* Close Button */}
				<button
					onClick={handleClose}
					className="absolute right-2 top-2 z-50 rounded-full bg-background/80 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
				>
					<X className="h-4 w-4" />
				</button>

				<AnimatePresence mode="wait">
					{checkoutState === "qr_ready" && checkoutData ? (
						<motion.div
							key="qr"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="p-5"
						>
							<SepayQrScreen
								orderId={checkoutData.orderId}
								paymentUrl={checkoutData.paymentUrl}
								totalAmount={checkoutData.totalAmount}
								onRetry={handleCheckout}
								onClose={handleClose}
							/>
						</motion.div>
					) : (
						<div className="flex flex-col sm:flex-row max-h-[90vh]">
							{/* LEFT PANEL - Pack Details */}
							<div className={`flex-shrink-0 flex flex-col ${showPoolPanel ? "sm:w-[380px] w-full" : "w-full"}`}>
								{/* Scrollable Content Area */}
								<div className="flex-1 overflow-y-auto">
									{/* Header */}
									<div className="relative h-20 sm:h-24 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent shrink-0">
										<div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="relative">
												<div className="flex h-14 w-12 sm:h-16 sm:w-14 items-center justify-center rounded-lg border-2 border-primary/40 bg-card shadow-lg">
													<Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
												</div>
												{product.isLimited && (
													<div className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
														<Star className="inline h-2 w-2" /> LTD
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="px-3 sm:px-4 pb-3">
										{/* Title */}
										<div className="mb-2 pt-1">
											<h2 className="text-base sm:text-lg font-bold leading-tight text-foreground">
												{product.name}
											</h2>
											<div className="mt-1 flex flex-wrap gap-1">
												<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
													product.stockCount > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
												}`}>
													<Package className="h-2.5 w-2.5" />
													{product.stockCount > 0 ? `Còn ${product.stockCount}` : "Hết hàng"}
												</span>
											</div>
										</div>

										<p className="mb-2 sm:mb-3 text-xs leading-relaxed text-muted-foreground">
											{product.description}
										</p>

										{/* Rarity Bars */}
										<div className="mb-2 sm:mb-3 rounded-lg border border-border/50 bg-muted/20 p-2 sm:p-2.5">
											<div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
												<Sparkles className="h-3 w-3 text-primary" />
												Tỷ lệ nhận thẻ
											</div>
											<RarityBar label="Common" percentage={65} color="text-sky-400" bgColor="bg-gradient-to-r from-sky-500 to-sky-400" delay={0} />
											<RarityBar label="Rare" percentage={30} color="text-purple-400" bgColor="bg-gradient-to-r from-purple-600 to-purple-400" delay={0.1} />
											<RarityBar label="Legendary" percentage={5} color="text-amber-400" bgColor="bg-gradient-to-r from-amber-500 to-amber-300" delay={0.2} />
										</div>

										{/* Top 5 Cards */}
										{topCards.length > 0 && (
											<div className="mb-2 sm:mb-3">
												<div className="mb-1.5 flex items-center justify-between">
													<p className="text-xs font-semibold text-foreground">Pool gacha:</p>
													{remainingCards.length > 0 && (
														<button
															onClick={() => setShowPoolPanel(!showPoolPanel)}
															className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
														>
															{showPoolPanel ? (
																<><ChevronLeft className="h-3 w-3" /> Thu gọn</>
															) : (
																<>Xem thêm {remainingCards.length} lá <ChevronRight className="h-3 w-3" /></>
															)}
														</button>
													)}
												</div>

												<AnimatePresence>
													{hoveredCard && (
														<motion.div
															initial={{ opacity: 0, y: 5 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: 5 }}
															className="mb-1.5 rounded-md bg-background/90 px-2 py-1 text-center text-[10px] backdrop-blur-sm"
														>
															<span className="text-muted-foreground">{hoveredCard.name}</span>
															<span className={`ml-1 ${getRarityTextClass(hoveredCard.rarity)}`}>({hoveredCard.rarity})</span>
														</motion.div>
													)}
												</AnimatePresence>

												<div className="flex items-center justify-center gap-1.5">
													{topCards.map((card, index) => (
														<TiltCard key={card.cardTemplateId} card={card} index={index} onHover={setHoveredCard} />
													))}
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Fixed Checkout Section - Always visible at bottom */}
								<div className="shrink-0 border-t border-border/50 px-3 sm:px-4 py-3 bg-background/80 backdrop-blur-sm">
									<div className="mb-2 flex items-end justify-between">
										<div>
											<p className="text-[10px] text-muted-foreground">Giá</p>
											<p className="font-stats text-lg sm:text-xl font-bold text-foreground">{formatVnd(product.price)}</p>
										</div>
									</div>

									<button
										onClick={handleCheckout}
										disabled={checkoutState !== "idle" || product.stockCount <= 0}
										className="flex h-10 sm:h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
									>
										{checkoutState !== "idle" ? (
											<><Loader2 className="h-4 w-4 animate-spin" /> {checkoutState === "creating_order" ? "Đang tạo đơn..." : "Đang khởi tạo..."}</>
										) : (
											<><CreditCard className="h-4 w-4" /> {product.stockCount > 0 ? "⚡ Mua ngay" : "Hết hàng"}</>
										)}
									</button>
								</div>
							</div>

							{/* RIGHT PANEL - Full Pool (Desktop only) */}
							<AnimatePresence>
								{showPoolPanel && (
									<motion.div
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}
										transition={{ duration: 0.2 }}
										className="hidden sm:flex flex-col w-[320px] lg:w-[380px] border-l border-border/50 max-h-[90vh]"
									>
										{/* Pool Header */}
										<div className="shrink-0 flex items-center justify-between border-b border-border/50 px-3 py-2">
											<div>
												<h3 className="text-sm font-bold text-foreground">Toàn bộ Pool</h3>
												<p className="text-[10px] text-muted-foreground">{remainingCards.length} lá bài</p>
											</div>
											<button
												onClick={() => setShowPoolPanel(false)}
												className="rounded-full bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
											>
												<X className="h-3.5 w-3.5" />
											</button>
										</div>

										{/* Rarity Summary */}
										<div className="shrink-0 flex flex-wrap gap-1.5 border-b border-border/50 px-3 py-2">
											<div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5">
												<Crown className="h-3 w-3 text-amber-500" />
												<span className="text-[10px] font-medium text-amber-500">{legendaryCount}</span>
											</div>
											<div className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5">
												<Gem className="h-3 w-3 text-purple-500" />
												<span className="text-[10px] font-medium text-purple-500">{rareCount}</span>
											</div>
											<div className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5">
												<Circle className="h-3 w-3 text-sky-500" />
												<span className="text-[10px] font-medium text-sky-500">{commonCount}</span>
											</div>
										</div>

										{/* Pool Grid - Scrollable */}
										<div className="flex-1 overflow-y-auto p-3">
											<div className="grid grid-cols-3 gap-2">
												{remainingCards.map((card, index) => (
													<motion.div
														key={card.cardTemplateId}
														initial={{ opacity: 0, scale: 0.9 }}
														animate={{ opacity: 1, scale: 1 }}
														transition={{ delay: index * 0.01 }}
														className="group relative"
													>
														<div className={`relative overflow-hidden rounded-lg border-2 bg-card transition-all duration-300 group-hover:scale-105 ${getRarityGlow(card.rarity)}`}>
															<img src={card.imagePath || "https://placehold.co/120x168?text=?"} alt={card.name} className="aspect-[3/4] w-full object-cover" />
															<div className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5 backdrop-blur-sm">{getRarityIcon(card.rarity)}</div>
														</div>
														<div className="mt-1 text-center">
															<p className="line-clamp-1 text-[9px] font-medium text-foreground">{card.name}</p>
															<p className={`text-[8px] ${getRarityTextClass(card.rarity)}`}>{card.rarity}</p>
														</div>
													</motion.div>
												))}
											</div>
										</div>

										{/* Pool Footer */}
										<div className="shrink-0 border-t border-border/50 px-3 py-2 text-center">
											<p className="text-[9px] text-muted-foreground">🎲 RNG sẽ chọn ngẫu nhiên khi mở pack</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}
