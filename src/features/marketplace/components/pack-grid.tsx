"use client";

import { Package } from "lucide-react";
import { formatVnd } from "@/features/marketplace/hooks/use-marketplace";
import type { ProductResponse } from "@/types/commerce";

interface PackGridProps {
	packs: ProductResponse[];
	onSelectPack: (packId: number) => void;
}

export function PackGrid({ packs, onSelectPack }: PackGridProps) {
	if (packs.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<div className="mb-4 rounded-full bg-muted p-4">
					<Package className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-medium text-foreground">
					Chưa có pack nào
				</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					Cửa hàng hiện tại chưa có pack nào phù hợp với tìm kiếm của bạn.
				</p>
			</div>
		);
	}

	return (
		<div
			className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
			data-testid="pack-grid"
		>
			{packs.map((pack, index) => {
				// limit animation delay to index 5
				const delay = Math.min(index, 5);
				return (
					<div
						key={pack.productId}
						data-testid={`pack-card-${pack.name}`}
						className="glass-card animate-fog-in group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_-12px_rgba(var(--primary),0.3)]"
						style={{
							animationDelay: `${delay * 0.1}s`,
							animationFillMode: "both",
						}}
					>
						{/* Background glow Effect */}
						<div className="absolute inset-0 z-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

						<div className="relative z-10">
							<div className="mb-3 flex items-start justify-between">
								<div>
									<h3 className="text-lg font-bold text-foreground">
										{pack.name}
									</h3>
									<div className="mt-1 flex gap-2">
										<span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
											Kho: {pack.stockCount}
										</span>
										{pack.isLimited && (
											<span className="inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
												Limited
											</span>
										)}
									</div>
								</div>
							</div>
							<p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
								{pack.description}
							</p>

							{/* Gacha Pool Preview */}
							{pack.poolPreview && pack.poolPreview.length > 0 && (
								<div className="mb-4 space-y-2">
									<p className="text-xs font-semibold text-muted-foreground">Có thể nhận được:</p>
									<div className="flex -space-x-3 overflow-hidden p-1">
										{pack.poolPreview.slice(0, 5).map((preview, i) => (
											<img 
												key={preview.cardTemplateId}
												src={preview.imagePath || "https://placehold.co/150x210?text=Card"} 
												alt={preview.name}
												className="inline-block h-12 w-12 rounded-full border-2 border-background object-cover shadow-xs transition-transform hover:z-20 hover:-translate-y-1 hover:scale-110"
												title={`${preview.name} (${preview.rarity})`}
											/>
										))}
									</div>
								</div>
							)}
						</div>

						<div className="relative z-10 mt-auto flex items-end justify-between border-t border-border/50 pt-4">
							<div>
								<p className="text-xs text-muted-foreground">Giá</p>
								<p
									className="font-stats text-xl font-bold text-foreground"
									style={{ fontFamily: "Space Grotesk, var(--font-heading)" }}
								>
									{formatVnd(pack.price)}
								</p>
							</div>

							<button
								type="button"
								onClick={() => onSelectPack(pack.productId)}
								className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
							>
								Xem chi tiết
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}
