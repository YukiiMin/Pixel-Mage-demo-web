"use client";

import { BookMarked } from "lucide-react";
import { CardGrid } from "@/features/inventory/components/card-grid";
import { CollectionProgress } from "@/features/inventory/components/collection-progress";
import { useMyCards } from "@/features/inventory/hooks/use-my-cards";

export function MyCardsPage() {
	const { cards, progress, status, statusMessage, stats } = useMyCards();
	const isReady = status === "ready";

	return (
		<div className="container mx-auto max-w-6xl px-6 pb-20">
			<section className="mb-8 rounded-3xl border border-border/40 bg-linear-to-r from-card/80 via-card/60 to-card/40 p-6 md:p-8">
				<p className="badge-mystic mb-3 inline-flex">Vault</p>
				<h1
					className="text-4xl leading-tight text-foreground md:text-5xl"
					style={{ fontFamily: "Fruktur, var(--font-heading)" }}
				>
					My Cards
				</h1>
				<p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
					Kho thẻ cá nhân đồng bộ từ hệ thống, gồm số lượng sở hữu và tiến độ
					hoàn thành bộ sưu tập.
				</p>

				<div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
					<div className="glass-card rounded-xl border border-border/40 p-4">
						<p className="text-xs text-muted-foreground">Tổng thẻ sở hữu</p>
						<p className="font-stats mt-1 text-2xl font-bold text-primary">
							{stats.totalCards}
						</p>
					</div>
					<div className="glass-card rounded-xl border border-border/40 p-4">
						<p className="text-xs text-muted-foreground">Thẻ độc nhất</p>
						<p className="font-stats mt-1 text-2xl font-bold text-primary">
							{stats.uniqueCards}
						</p>
					</div>
					<div className="glass-card rounded-xl border border-border/40 p-4">
						<p className="text-xs text-muted-foreground">Collection hoàn tất</p>
						<p className="font-stats mt-1 text-2xl font-bold text-primary">
							{stats.completedCollections}
						</p>
					</div>
				</div>
			</section>

			<div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
				<BookMarked className="h-4 w-4 text-primary" />
				{status === "loading"
					? "Đang đồng bộ dữ liệu My Cards từ BE..."
					: "Theo dõi tiến độ collection và số lượng từng thẻ theo thời gian thực."}
			</div>

			{!isReady ? (
				<div className="glass-card mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5">
					<p className="text-sm font-semibold text-amber-200">
						{statusMessage || "Chức năng My Cards chưa cập nhật."}
					</p>
				</div>
			) : null}

			{isReady ? (
				<>
					<CollectionProgress progress={progress} />
					<CardGrid cards={cards} />
				</>
			) : null}
		</div>
	);
}
