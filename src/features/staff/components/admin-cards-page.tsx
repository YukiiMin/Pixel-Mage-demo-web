"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, API_ENDPOINTS } from "@/lib/api-config";
import { getApiErrorMessage } from "@/types/api";
import type { CardTemplate } from "@/types/commerce";
import {
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Eye,
	Plus,
	Search,
	Trash2,
	X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const RARITY_COLOR: Record<string, string> = {
	COMMON: "bg-slate-500/15 text-slate-400 border-slate-500/25",
	RARE: "bg-blue-500/15 text-blue-400 border-blue-500/25",
	LEGENDARY: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

function CardPreviewModal({ card, onClose }: { card: CardTemplate | null; onClose: () => void }) {
	if (!card) return null;
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="glass-card relative max-w-sm w-full rounded-2xl border border-border/60 p-6"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
				>
					<X className="h-4 w-4" />
				</button>
				<div className="flex flex-col items-center gap-4">
					{card.imagePath ? (
						<div className="relative h-48 w-36 overflow-hidden rounded-xl border border-border/50">
							<Image src={card.imagePath} alt={card.name} fill className="object-cover" unoptimized />
						</div>
					) : (
						<div className="flex h-48 w-36 items-center justify-center rounded-xl border border-border/50 bg-card/60">
							<CreditCard className="h-12 w-12 text-muted-foreground/30" />
						</div>
					)}
					<div className="text-center">
						<h3 className="text-lg font-bold text-foreground">{card.name}</h3>
						{card.cardCode && <p className="mt-1 text-xs text-muted-foreground">{card.cardCode}</p>}
						<span
							className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RARITY_COLOR[card.rarity] ?? "bg-muted/40 text-muted-foreground"}`}
						>
							{card.rarity}
						</span>
						{card.description && (
							<p className="mt-3 text-sm text-muted-foreground">{card.description}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

const PAGE_SIZE = 12;

export function AdminCardsPage() {
	const [cards, setCards] = useState<CardTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [rarityFilter, setRarityFilter] = useState("ALL");
	const [page, setPage] = useState(0);
	const [previewCard, setPreviewCard] = useState<CardTemplate | null>(null);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	const fetchCards = useCallback(async () => {
		setLoading(true);
		try {
			const res = await apiRequest<CardTemplate[] | { content: CardTemplate[]; totalPages: number }>(
				API_ENDPOINTS.cardTemplates.list,
				{ method: "GET" },
			);
			const d = res.data;
			const list: CardTemplate[] = Array.isArray(d) ? d : (d as { content: CardTemplate[] }).content ?? [];
			setCards(list);
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Không thể tải danh sách card template"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchCards(); }, [fetchCards]);

	const handleDelete = async (card: CardTemplate) => {
		setDeletingId(card.cardTemplateId);
		try {
			await apiRequest(API_ENDPOINTS.cardTemplates.byId(card.cardTemplateId), { method: "DELETE" });
			toast.success(`Đã xoá "${card.name}"`);
			await fetchCards();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Xoá thất bại"));
		} finally {
			setDeletingId(null);
		}
	};

	const filtered = cards.filter((c) => {
		const matchSearch =
			search === "" ||
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.cardCode?.toLowerCase().includes(search.toLowerCase());
		const matchRarity = rarityFilter === "ALL" || c.rarity === rarityFilter;
		return matchSearch && matchRarity;
	});

	const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
	const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
	const rarities = ["ALL", "COMMON", "RARE", "LEGENDARY"];

	return (
		<>
			<CardPreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="badge-mystic inline-flex mb-2">Admin</p>
						<h1 className="text-3xl text-foreground" style={{ fontFamily: "Fruktur, var(--font-heading)" }}>
							Card Manager
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							{filtered.length} template{filtered.length !== cards.length && ` / ${cards.length} tổng`}
						</p>
					</div>
					<button
						type="button"
						disabled
						className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary opacity-60 cursor-not-allowed"
					>
						<Plus className="h-4 w-4" />
						Thêm Template
					</button>
				</div>

				<div className="glass-card flex flex-col gap-3 rounded-2xl border border-border/50 p-4 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Tìm tên hoặc card code..."
							value={search}
							onChange={(e) => { setSearch(e.target.value); setPage(0); }}
							className="w-full rounded-lg border border-border/50 bg-card/60 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
						/>
					</div>
					<div className="flex flex-wrap gap-2">
						{rarities.map((r) => (
							<button
								key={r}
								type="button"
								onClick={() => { setRarityFilter(r); setPage(0); }}
								className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
									rarityFilter === r
										? "gradient-gold-purple-bg border-transparent text-primary-foreground"
										: "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
								}`}
							>
								{r}
							</button>
						))}
					</div>
				</div>

				{loading ? (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="glass-card flex flex-col rounded-2xl border border-border/50 p-4">
								<Skeleton className="mx-auto mb-3 h-36 w-28 rounded-xl" />
								<Skeleton className="mb-1.5 h-4 w-3/4" />
								<Skeleton className="h-5 w-16 rounded-full" />
							</div>
						))}
					</div>
				) : paginated.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<CreditCard className="mb-4 h-12 w-12 text-muted-foreground/30" />
						<p className="text-sm text-muted-foreground">Không có card template nào phù hợp</p>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{paginated.map((card) => (
							<div
								key={card.cardTemplateId}
								className="glass-card group relative flex flex-col rounded-2xl border border-border/50 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
							>
								<div className="relative mx-auto mb-3 h-36 w-28 overflow-hidden rounded-xl border border-border/40">
									{card.imagePath ? (
										<Image
											src={card.imagePath}
											alt={card.name}
											fill
											className="object-cover transition-transform duration-300 group-hover:scale-105"
											unoptimized
										/>
									) : (
										<div className="flex h-full items-center justify-center bg-card/60">
											<CreditCard className="h-8 w-8 text-muted-foreground/30" />
										</div>
									)}
								</div>
								<p className="truncate text-sm font-semibold text-foreground">{card.name}</p>
								{card.cardCode && (
									<p className="truncate text-[10px] text-muted-foreground">{card.cardCode}</p>
								)}
								<span
									className={`mt-1.5 inline-flex self-start rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RARITY_COLOR[card.rarity] ?? "bg-muted/40 text-muted-foreground"}`}
								>
									{card.rarity}
								</span>
								<div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
									<button
										type="button"
										onClick={() => setPreviewCard(card)}
										className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border/50 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
									>
										<Eye className="h-3.5 w-3.5" />
										Xem
									</button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<button
												type="button"
												disabled={deletingId === card.cardTemplateId}
												className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-destructive/30 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-40"
											>
												<Trash2 className="h-3.5 w-3.5" />
												Xoá
											</button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Xoá card template?</AlertDialogTitle>
												<AlertDialogDescription>
													Bạn chắc chắn muốn xoá <strong>{card.name}</strong>? Hành động này không thể hoàn tác.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Huỷ</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleDelete(card)}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													Xoá
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-3">
						<button
							type="button"
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={page === 0}
							className="rounded-lg border border-border/50 p-2 text-muted-foreground hover:bg-accent disabled:opacity-40"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
						<button
							type="button"
							onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
							disabled={page >= totalPages - 1}
							className="rounded-lg border border-border/50 p-2 text-muted-foreground hover:bg-accent disabled:opacity-40"
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				)}
			</div>
		</>
	);
}
