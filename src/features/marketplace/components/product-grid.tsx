"use client";

import { Gem, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	formatVnd,
	getRarityLabel,
} from "@/features/marketplace/hooks/use-marketplace";
import type { MarketplaceProduct } from "@/types/commerce";

interface ProductGridProps {
	products: MarketplaceProduct[];
}

function rarityClassName(rarity: MarketplaceProduct["rarity"]): string {
	if (rarity === "LEGENDARY") {
		return "border-yellow-300/60 bg-yellow-300/10 text-yellow-200";
	}
	if (rarity === "RARE") {
		return "border-sky-300/50 bg-sky-400/10 text-sky-200";
	}
	return "border-border bg-muted/50 text-muted-foreground";
}

export function ProductGrid({ products }: ProductGridProps) {
	if (products.length === 0) {
		return (
			<div className="glass-card rounded-2xl border border-border/50 p-8 text-center">
				<p className="text-lg font-semibold text-foreground">
					Không tìm thấy sản phẩm phù hợp
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Hãy đổi bộ lọc hoặc từ khóa để khám phá thêm gói mới.
				</p>
			</div>
		);
	}

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{products.map((product) => (
				<article
					key={product.id}
					className="glass-card group rounded-2xl border border-border/50 p-5 transition-transform duration-300 hover:-translate-y-1"
				>
					<div className="mb-4 flex items-start justify-between">
						<div className="text-3xl">{product.imageEmoji}</div>
						{product.isLimited ? (
							<span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
								<Star className="h-3 w-3" /> Limited
							</span>
						) : null}
					</div>

					<h3 className="text-xl font-semibold text-foreground">
						{product.name}
					</h3>
					<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
						{product.description}
					</p>

					<div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
						<span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
							{product.category}
						</span>
						<span
							className={`rounded-full border px-2.5 py-1 ${rarityClassName(product.rarity)}`}
						>
							{getRarityLabel(product.rarity)}
						</span>
					</div>

					<div className="mt-5 flex items-center justify-between">
						<p className="font-stats text-lg font-bold text-primary">
							{formatVnd(product.price)}
						</p>
						<Button
							type="button"
							size="sm"
							className="gradient-gold-purple-bg text-primary-foreground"
						>
							<Gem className="h-4 w-4" /> Thêm
						</Button>
					</div>

					<div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
						<Sparkles className="h-3 w-3" />
						Cập nhật:{" "}
						{new Date(product.releaseDate).toLocaleDateString("vi-VN")}
					</div>
				</article>
			))}
		</section>
	);
}
