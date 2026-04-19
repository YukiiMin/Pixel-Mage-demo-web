"use client";

import { motion } from "framer-motion";
import { Package, Sparkles, Star } from "lucide-react";
import type { ProductResponse } from "@/types/commerce";
import { formatVnd } from "@/features/marketplace/hooks/use-marketplace";

interface ShopProductCardProps {
	product: ProductResponse;
	onSelect: () => void;
	index: number;
}

export function ShopProductCard({
	product,
	onSelect,
	index,
}: ShopProductCardProps) {
	const delay = Math.min(index * 0.1, 0.5);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.4 }}
			className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_-12px_rgba(var(--primary),0.3)]"
		>
			{/* Background Glow */}
			<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			{/* Limited Badge */}
			{product.isLimited && (
				<div className="absolute right-3 top-3 z-10">
					<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-500">
						<Star className="h-3 w-3" /> Limited
					</span>
				</div>
			)}

			{/* Product Type Badge */}
			<div className="absolute left-3 top-3 z-10">
				{product.productType === "SINGLE_CARD" ? (
					<span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-1 text-[10px] font-semibold text-sky-400 border border-sky-500/30">
						🃏 Thẻ vật lý
					</span>
				) : (
					<span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-1 text-[10px] font-semibold text-purple-400 border border-purple-500/30">
						✨ Gacha Pack
					</span>
				)}
			</div>

			<div className="relative z-10">
				{/* Pack Visual */}
				<div className="relative mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
					{product.imageUrl ? (
						<img
							src={product.imageUrl}
							alt={product.name}
							className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
						/>
					) : (
						<div className="relative">
							<div className="flex h-24 w-20 items-center justify-center rounded-lg border-2 border-primary/30 bg-card/80 shadow-lg">
								<Package className="h-10 w-10 text-primary opacity-60" />
							</div>
							<div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
								?
							</div>
						</div>
					)}
					{/* Gradient fade overlay for smooth blend into title */}
					<div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
				</div>

				{/* Title & Description */}
				<h3 className="mb-2 text-lg font-bold text-foreground">
					{product.name}
				</h3>
				<p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
					{product.description}
				</p>

				{/* Pool Preview / Card Template Info */}
				{product.poolPreview && product.poolPreview.length > 0 && (
					<div className="mb-4">
						<p className="mb-2 text-xs font-medium text-muted-foreground">
							<Sparkles className="mr-1 inline h-3 w-3" />
							{product.productType === "SINGLE_CARD" ? "Loại lá bài:" : "Có thể nhận được:"}
						</p>
						<div className="flex -space-x-2 overflow-hidden">
							{product.poolPreview.slice(0, 5).map((preview) => (
								<div
									key={preview.cardTemplateId}
									className="relative inline-block h-10 w-10 overflow-hidden rounded-full border-2 border-background"
									title={`${preview.name} (${preview.rarity})`}
								>
									<img
										src={
											preview.imagePath || "https://placehold.co/100x140?text=?"
										}
										alt={preview.name}
										className="h-full w-full object-cover opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
									/>
									{preview.rarity === "LEGENDARY" && (
										<div className="absolute inset-0 border-2 border-amber-400/50 rounded-full" />
									)}
								</div>
							))}
							{product.poolPreview.length > 5 && (
								<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
									+{product.poolPreview.length - 5}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Stock Badge */}
				<div className="mb-3 flex items-center gap-2">
					<span
						className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
							product.stockCount > 10
								? "bg-emerald-500/10 text-emerald-500"
								: product.stockCount > 0
									? "bg-amber-500/10 text-amber-500"
									: "bg-red-500/10 text-red-500"
						}`}
					>
						<Package className="h-3 w-3" />
						{product.stockCount > 0 ? `Còn ${product.stockCount}` : "Hết hàng"}
					</span>
				</div>

				{/* Price & CTA */}
				<div className="flex items-end justify-between border-t border-border/50 pt-4">
					<div>
						<p className="text-xs text-muted-foreground">Giá</p>
						<p className="font-stats text-xl font-bold text-foreground">
							{formatVnd(product.price)}
						</p>
					</div>
					<button
						onClick={onSelect}
						disabled={product.stockCount <= 0}
						className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{product.stockCount > 0 ? "Xem chi tiết" : "Hết hàng"}
					</button>
				</div>
			</div>
		</motion.div>
	);
}
