"use client";

import { Layers3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { MyCardItem } from "@/types/commerce";

interface CardDetailModalProps {
	card: MyCardItem | null;
	onClose: () => void;
}

const RARITY_CONFIG: Record<
	MyCardItem["rarity"],
	{ label: string; className: string; glow: string }
> = {
	LEGENDARY: {
		label: "Legendary",
		className: "border-yellow-300/60 bg-yellow-300/10 text-yellow-200",
		glow: "glow-gold",
	},
	RARE: {
		label: "Rare",
		className: "border-sky-300/60 bg-sky-300/10 text-sky-200",
		glow: "",
	},
	COMMON: {
		label: "Common",
		className: "border-border bg-muted/30 text-muted-foreground",
		glow: "",
	},
};

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
	if (!card) return null;

	const rarity = RARITY_CONFIG[card.rarity];

	return (
		<Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className={`glass-card ${rarity.glow} max-w-md border border-border/50 p-0`}
			>
				<DialogHeader className="border-b border-border/40 px-6 py-5">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="badge-mystic mb-2 inline-flex">
								<Layers3 className="mr-1.5 h-3 w-3" /> {card.status}
							</p>
							<DialogTitle className="text-2xl text-foreground">
								{card.name}
							</DialogTitle>
						</div>
						<DialogClose asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
							>
								<X className="h-4 w-4" />
							</Button>
						</DialogClose>
					</div>
				</DialogHeader>

				<div className="space-y-5 px-6 py-5">
					{/* Rarity badge */}
					<span
						className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${rarity.className}`}
					>
						{rarity.label}
					</span>

					{/* Description */}
					<div>
						<p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
							Mô tả
						</p>
						<p className="text-sm leading-relaxed text-foreground">
							{card.description || "Không có mô tả cho lá bài này."}
						</p>
					</div>

					{/* Quantity */}
					<div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
						<p className="text-sm text-muted-foreground">Số lượng sở hữu</p>
						<p className="font-stats text-3xl font-bold text-primary">
							{card.quantity}
						</p>
					</div>

					{/* Metadata */}
					<p className="text-right text-[11px] text-muted-foreground">
						Cập nhật:{" "}
						{new Date(card.updatedAt).toLocaleString("vi-VN", {
							dateStyle: "medium",
							timeStyle: "short",
						})}
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
