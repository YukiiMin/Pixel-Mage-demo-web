"use client";

import { Layers3 } from "lucide-react";
import { useState } from "react";
import { CardDetailModal } from "@/features/inventory/components/card-detail-modal";
import type { MyCardItem } from "@/types/commerce";

interface CardGridProps {
	cards: MyCardItem[];
}

function rarityClassName(rarity: MyCardItem["rarity"]): string {
	if (rarity === "LEGENDARY") return "text-yellow-200 border-yellow-300/60";
	if (rarity === "RARE") return "text-sky-200 border-sky-300/60";
	return "text-muted-foreground border-border";
}

export function CardGrid({ cards }: CardGridProps) {
	const [selected, setSelected] = useState<MyCardItem | null>(null);

	if (cards.length === 0) {
		return (
			<div className="glass-card rounded-2xl border border-border/50 p-8 text-center">
				<p className="text-lg font-semibold text-foreground">
					Chưa có thẻ để hiển thị
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Khi dữ liệu bộ sưu tập có sẵn từ BE, các thẻ sẽ xuất hiện tại đây.
				</p>
			</div>
		);
	}

	return (
		<>
			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{cards.map((card) => (
					<button
						key={card.id}
						type="button"
						className="glass-card w-full cursor-pointer rounded-2xl border border-border/50 p-5 text-left transition-colors hover:border-primary/40"
						onClick={() => setSelected(card)}
					>
						<div className="mb-3 flex items-center justify-between">
							<span className="inline-flex items-center gap-2 rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground">
								<Layers3 className="h-3.5 w-3.5" /> {card.status}
							</span>
							<span
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
							<p className="text-sm text-muted-foreground">Số lượng sở hữu</p>
							<p className="font-stats text-2xl font-bold text-primary">
								{card.quantity}
							</p>
						</div>
						<p className="mt-3 text-[11px] text-muted-foreground">
							Cập nhật: {new Date(card.updatedAt).toLocaleString("vi-VN")}
						</p>
					</button>
				))}
			</section>
			<CardDetailModal card={selected} onClose={() => setSelected(null)} />
		</>
	);
}
