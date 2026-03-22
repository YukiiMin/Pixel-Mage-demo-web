"use client";

import { ShoppingBag } from "lucide-react";
import { ProductFilter } from "@/features/marketplace/components/product-filter";
import { ProductGrid } from "@/features/marketplace/components/product-grid";
import { useMarketplace } from "@/features/marketplace/hooks/use-marketplace";

export function MarketplacePage() {
	const {
		status,
		statusMessage,
		filteredProducts,
		searchTerm,
		setSearchTerm,
		category,
		setCategory,
		rarity,
		setRarity,
		sortBy,
		setSortBy,
		limitedOnly,
		setLimitedOnly,
		stats,
	} = useMarketplace();

	const canUseMarketplace = status === "ready";

	return (
		<div className="container mx-auto max-w-6xl px-6 pb-20">
			<section className="mb-8 rounded-3xl border border-border/40 bg-linear-to-r from-card/80 via-card/60 to-card/40 p-6 md:p-8">
				<p className="badge-mystic mb-3 inline-flex">Market Arcana</p>
				<h1
					className="text-4xl leading-tight text-foreground md:text-5xl"
					style={{ fontFamily: "Fruktur, var(--font-heading)" }}
				>
					Marketplace PixelMage
				</h1>
				<p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
					Khám phá deck, booster và collectible mới nhất để mở rộng trải nghiệm
					đọc bài và bộ sưu tập của bạn.
				</p>

				<div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
					<div className="glass-card rounded-xl border border-border/40 p-4">
						<p className="text-xs text-muted-foreground">Sản phẩm hiển thị</p>
						<p className="font-stats mt-1 text-2xl font-bold text-primary">
							{stats.total}
						</p>
					</div>
					<div className="glass-card rounded-xl border border-border/40 p-4">
						<p className="text-xs text-muted-foreground">Giá trung bình</p>
						<p className="font-stats mt-1 text-2xl font-bold text-primary">
							{new Intl.NumberFormat("vi-VN").format(stats.avgPrice)} đ
						</p>
					</div>
					<div className="glass-card rounded-xl border border-border/40 p-4">
						<p className="text-xs text-muted-foreground">Bản giới hạn</p>
						<p className="font-stats mt-1 text-2xl font-bold text-primary">
							{stats.limitedCount}
						</p>
					</div>
				</div>
			</section>

			<div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
				<ShoppingBag className="h-4 w-4 text-primary" />
				{status === "loading"
					? "Đang đồng bộ dữ liệu sản phẩm từ BE..."
					: "Gợi ý tốt nhất hôm nay dành cho người mới và người sưu tầm lâu năm."}
			</div>

			{!canUseMarketplace ? (
				<div className="glass-card mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5">
					<p className="text-sm font-semibold text-amber-200">
						{statusMessage || "Chức năng chưa cập nhật."}
					</p>
				</div>
			) : null}

			{canUseMarketplace ? (
				<>
					<ProductFilter
						searchTerm={searchTerm}
						onSearchTermChange={setSearchTerm}
						category={category}
						onCategoryChange={setCategory}
						rarity={rarity}
						onRarityChange={setRarity}
						sortBy={sortBy}
						onSortByChange={setSortBy}
						limitedOnly={limitedOnly}
						onLimitedOnlyChange={setLimitedOnly}
					/>

					<div className="mt-6">
						<ProductGrid products={filteredProducts} />
					</div>
				</>
			) : null}
		</div>
	);
}
