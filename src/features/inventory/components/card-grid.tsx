"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Layers3 } from "lucide-react";
import { useState } from "react";
import { CardDetailModal } from "@/features/inventory/components/card-detail-modal";
import type { MyCardItem } from "@/types/commerce";

interface CardGridProps {
	cards: MyCardItem[];
	activeFilter?: string;
	onResetFilter?: () => void;
}

const fogInVariants = {
	hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.6, ease: "easeOut" as const },
	},
};

function rarityClassName(rarity: MyCardItem["rarity"]): string {
	if (rarity === "LEGENDARY") return "text-primary border-primary/60";
	if (rarity === "RARE") return "text-secondary border-secondary/60";
	return "text-muted-foreground border-border";
}

export function CardGrid({
	cards,
	activeFilter,
	onResetFilter,
}: CardGridProps) {
	const [selected, setSelected] = useState<MyCardItem | null>(null);
	const shouldReduceMotion = useReducedMotion();

	if (cards.length === 0) {
		return (
			<div
				data-testid="filter-empty-state"
				className="glass-card flex flex-col items-center justify-center rounded-2xl border border-border/50 p-12 text-center"
			>
				<p className="mb-2 text-lg font-semibold text-foreground">
					Không có thẻ {activeFilter} nào trong bộ sưu tập
				</p>
				<button
					type="button"
					onClick={onResetFilter}
					className="mt-4 rounded-full border border-primary px-6 py-2 text-sm font-medium text-primary hover:bg-primary/10"
				>
					Xem tất cả
				</button>
			</div>
		);
	}

	return (
		<>
			<section
				data-testid="card-grid"
				className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
			>
				{cards.map((card, i) => {
					// Add special styles for legendary cards
					const isLegendary = card.rarity === "LEGENDARY";
					const isRare = card.rarity === "RARE";

					const glowClass = isLegendary
						? "animate-pulse-glow glow-gold border-primary/60"
						: isRare
							? "hover:glow-purple"
							: "";

					return (
						<motion.button
							key={card.id}
							variants={shouldReduceMotion ? {} : fogInVariants}
							initial="hidden"
							animate="visible"
							style={{
								animationDelay: `${Math.min(i, 5) * 0.08}s`,
								animationDuration: cards.length === 1 ? "0.8s" : "",
							}}
							data-testid={`card-${card.id}`}
							data-rarity={card.rarity}
							type="button"
							className={`glass-card w-full cursor-pointer rounded-2xl border p-5 text-left transition-colors hover:border-primary/40 ${glowClass} ${!isLegendary && "border-border/50"}`}
							onClick={() => setSelected(card)}
						>
							<div className="mb-3 flex items-center justify-between">
								<span className="inline-flex items-center gap-2 rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground">
									<Layers3 className="h-3.5 w-3.5" /> {card.status}
								</span>
								<span
									data-testid={`rarity-badge-${card.id}`}
									data-rarity={card.rarity}
									className={`rounded-full border px-2.5 py-1 text-xs ${rarityClassName(card.rarity)}`}
								>
									{card.rarity}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-foreground">
								{card.name}
							</h3>
							<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
								{card.description || "Không có mô tả"}
							</p>
							<div className="mt-4 flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									Số lượng sở hữu:
								</p>
								<p className="font-stats text-2xl font-bold text-primary">
									{card.quantity}
								</p>
							</div>
							<p className="mt-3 text-[11px] text-muted-foreground">
								Cập nhật: {new Date(card.updatedAt).toLocaleString("vi-VN")}
							</p>
						</motion.button>
					);
				})}
			</section>
			<CardDetailModal card={selected} onClose={() => setSelected(null)} />
		</>
	);
}
