"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PackDetailModal } from "@/features/marketplace/components/pack-detail-modal";
import { PackGrid } from "@/features/marketplace/components/pack-grid";
import { ProductFilter } from "@/features/marketplace/components/product-filter";
import { useMarketplace } from "@/features/marketplace/hooks/use-marketplace";

export function MarketplacePage() {
	const {
		status,
		statusMessage,
		filteredPacks,
		searchTerm,
		setSearchTerm,
		sortBy,
		setSortBy,
		limitedOnly,
		setLimitedOnly,
		stats,
	} = useMarketplace();

	const [selectedPackId, setSelectedPackId] = useState<number | null>(null);

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

			{!canUseMarketplace && status !== "loading" ? (
				<div className="glass-card mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5">
					<p className="text-sm font-semibold text-amber-200">
						{statusMessage || "Chức năng chưa cập nhật."}
					</p>
				</div>
			) : null}

			{status === "loading" ? (
				<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="glass-card flex h-60 flex-col justify-between rounded-2xl border border-border/50 p-5"
						>
							<div>
								<div className="mb-3 flex justify-between">
									<Skeleton className="h-6 w-32 rounded-md" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<Skeleton className="mb-2 h-4 w-full rounded-md" />
								<Skeleton className="mb-4 h-4 w-2/3 rounded-md" />
								<div className="flex -space-x-2">
									{[1, 2, 3].map((j) => (
										<Skeleton
											key={j}
											className="h-10 w-10 rounded-full border-2 border-background"
										/>
									))}
								</div>
							</div>
							<div className="mt-4 flex items-end justify-between border-t border-border/50 pt-4">
								<div>
									<Skeleton className="mb-1 h-3 w-8" />
									<Skeleton className="h-6 w-24 rounded-md" />
								</div>
								<Skeleton className="h-9 w-28 rounded-lg" />
							</div>
						</div>
					))}
				</div>
			) : canUseMarketplace ? (
				<>
					<ProductFilter
						searchTerm={searchTerm}
						onSearchTermChange={setSearchTerm}
						sortBy={sortBy}
						onSortByChange={setSortBy}
						limitedOnly={limitedOnly}
						onLimitedOnlyChange={setLimitedOnly}
					/>

					<div className="mt-6">
						<PackGrid packs={filteredPacks} onSelectPack={setSelectedPackId} />
					</div>
				</>
			) : null}

			<PackDetailModal
				open={selectedPackId !== null}
				packId={selectedPackId}
				onClose={() => setSelectedPackId(null)}
			/>
		</div>
	);
}
