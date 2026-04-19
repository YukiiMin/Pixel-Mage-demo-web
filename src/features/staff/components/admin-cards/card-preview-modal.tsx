"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { RARITY_COLOR } from "@/features/staff/components/admin-cards/shared";
import { CardContentsViewer } from "@/features/staff/components/admin-cards/card-contents-viewer";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";

import type { CardPreviewModalProps } from "@/features/staff/types/admin-cards";
import type { CardTemplateResponse } from "@/features/staff/types/catalog";

export function CardPreviewModal({ card, onClose }: CardPreviewModalProps) {
	const [tab, setTab] = useState<"info" | "contents">("info");
	const { data: fullCard } = useQuery({
		queryKey: ["admin", "card-template-preview", card.cardTemplateId],
		queryFn: () =>
			apiRequest<CardTemplateResponse>(
				API_ENDPOINTS.cardTemplates.byId(card.cardTemplateId),
			).then((res) => res.data),
		enabled: !!card?.cardTemplateId,
	});

	const previewCard = fullCard || card;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Đóng"
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="glass-card flex flex-col md:flex-row relative max-w-4xl w-full rounded-2xl border border-border/60 p-0 overflow-hidden shadow-2xl">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 z-10 rounded-full p-2 bg-background/50 hover:bg-muted text-foreground transition-colors backdrop-blur-md"
				>
					<X className="h-5 w-5" />
				</button>

				<div className="w-full md:w-80 bg-secondary/10 p-8 flex flex-col items-center justify-center border-r border-border/40">
					{previewCard.imagePath ? (
						<div className="relative h-72 w-48 overflow-hidden rounded-xl border border-border/50 shadow-lg">
							<Image
								src={previewCard.imagePath}
								alt={previewCard.name}
								fill
								className="object-cover"
								unoptimized
							/>
						</div>
					) : (
						<div className="flex h-72 w-48 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-lg">
							<CreditCard className="h-16 w-16 text-muted-foreground/30" />
						</div>
					)}
					<div className="text-center mt-6">
						<h3
							className="text-xl font-bold text-foreground text-balance"
							style={{ fontFamily: "Fruktur" }}
						>
							{previewCard.name}
						</h3>
						<span
							className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${RARITY_COLOR[previewCard.rarity || "COMMON"] ?? "bg-muted/40 text-muted-foreground"}`}
						>
							{previewCard.rarity}
						</span>
					</div>
				</div>

				<div className="flex-1 flex flex-col bg-background/90 min-h-125">
					<div className="flex border-b border-border/40 px-6 pt-4 gap-6 shrink-0">
						<button
							type="button"
							onClick={() => setTab("info")}
							className={`pb-3 border-b-2 font-medium transition-colors ${tab === "info" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
						>
							Thông Tin Template
						</button>
						<button
							type="button"
							onClick={() => setTab("contents")}
							className={`pb-3 border-b-2 font-medium transition-colors ${tab === "contents" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
						>
							Nội Dung Đặc Biệt (Card Contents)
						</button>
					</div>

					<ScrollArea className="flex-1 p-6">
						{tab === "info" ? (
							<div className="space-y-6">
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
											Loại Bài
										</p>
										<p className="font-semibold text-foreground">
											{previewCard.arcanaType || "MINOR"} ARCANA
										</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
											Suit (Chất)
										</p>
										<p className="font-semibold text-foreground">
											{previewCard.suit || "N/A"}
										</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
											Số / Tên Rút Gọn
										</p>
										<p className="font-semibold text-foreground">
											{previewCard.cardNumber}
										</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
											Framework
										</p>
										<p className="font-semibold text-foreground">
											{previewCard.frameworkName || "N/A"}
										</p>
									</div>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Ý Nghĩa Cơ Bản</h4>
									<p className="text-muted-foreground leading-relaxed text-sm bg-accent/30 p-4 rounded-xl border border-border/30">
										{previewCard.description || "Chưa có mô tả cho lá bài này."}
									</p>
								</div>
							</div>
						) : (
							<CardContentsViewer templateId={previewCard.cardTemplateId} />
						)}
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
