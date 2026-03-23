"use client";

import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthGuard } from "@/features/auth/hooks/use-auth-guard";
import { CardGrid } from "@/features/inventory/components/card-grid";
import { CollectionProgress } from "@/features/inventory/components/collection-progress";
import { useCollectionProgress } from "@/features/inventory/hooks/use-collection-progress";
import { useMyCards } from "@/features/inventory/hooks/use-my-cards";
import { getStoredUserId } from "@/lib/api-config";
import type { MyCardItem } from "@/types/commerce";

export function MyCardsPage() {
	const { checking } = useAuthGuard("authenticated-only", "/login");
	const userId = getStoredUserId();

	const [rarityFilter, setRarityFilter] = useState<
		"ALL" | MyCardItem["rarity"]
	>("ALL");

	const {
		data: cards = [],
		isLoading: isLoadingCards,
		isError: isErrorCards,
	} = useMyCards(userId);
	const { data: progress = [], isLoading: isLoadingProgress } =
		useCollectionProgress(userId);

	const isLoading = checking || isLoadingCards || isLoadingProgress;

	const stats = useMemo(() => {
		const totalCards = cards.reduce((sum, item) => sum + item.quantity, 0);
		const uniqueCards = cards.length;
		const completedCollections = progress.filter(
			(item) => item.totalItems > 0 && item.completedItems >= item.totalItems,
		).length;

		return { totalCards, uniqueCards, completedCollections };
	}, [cards, progress]);

	const filteredCards = useMemo(() => {
		if (rarityFilter === "ALL") return cards;
		return cards.filter((card) => card.rarity === rarityFilter);
	}, [cards, rarityFilter]);

	// Global Empty State
	if (!isLoading && cards.length === 0) {
		return (
			<div className="container mx-auto max-w-6xl px-6 pb-20">
				<div
					data-testid="empty-state"
					className="flex flex-col items-center justify-center rounded-3xl border border-border/40 bg-card/60 px-6 py-20 text-center"
				>
					<div className="mb-6 rounded-full bg-primary/10 p-5 text-primary">
						<PackageOpen className="h-12 w-12" strokeWidth={1.5} />
					</div>
					<h2 className="mb-2 text-3xl font-semibold text-foreground">
						Kho thẻ đang trống
					</h2>
					<p className="mb-8 text-muted-foreground">
						Scan NFC để khởi đầu hành trình
					</p>
					<Link
						href="/marketplace"
						className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Mua Pack ngay
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-6xl px-6 pb-20">
			<section className="mb-8 rounded-3xl border border-border/40 bg-linear-to-r from-card/80 via-card/60 to-card/40 p-6 md:p-8">
				<p className="badge-mystic mb-3 inline-flex">Vault</p>
				<h1 className="text-4xl leading-tight text-foreground md:text-5xl">
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

			{!userId && !isLoading ? (
				<div className="glass-card mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5">
					<p className="text-sm font-semibold text-amber-200">
						Bạn cần đăng nhập để xem My Cards.
					</p>
				</div>
			) : null}

			<div className="mb-5 flex items-center justify-between gap-4">
				<div className="flex gap-2 rounded-full border border-border/40 bg-card/50 p-1">
					{["ALL", "COMMON", "RARE", "LEGENDARY"].map((r) => (
						<button
							key={r}
							type="button"
							data-testid={`filter-${r}`}
							onClick={() => setRarityFilter(r as any)}
							className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
								rarityFilter === r
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
							}`}
						>
							{r}
						</button>
					))}
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1fr_300px]">
				{/* Main Content: Card Grid */}
				<div>
					{isLoading ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 12 }).map((_, i) => (
								<div
									key={i}
									data-testid="card-skeleton"
									className="glass-card h-40 animate-shimmer rounded-2xl"
								/>
							))}
						</div>
					) : (
						<CardGrid
							cards={filteredCards}
							activeFilter={rarityFilter}
							onResetFilter={() => setRarityFilter("ALL")}
						/>
					)}
				</div>

				{/* Sidebar: Collection Progress */}
				<div>{!isLoading && <CollectionProgress progress={progress} />}</div>
			</div>
		</div>
	);
}
