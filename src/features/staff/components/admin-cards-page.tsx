"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Edit2,
	Eye,
	EyeOff,
	FileText,
	Image as ImageIcon,
	LayoutGrid,
	Link as LinkIcon,
	List as ListIcon,
	LoaderCircle,
	Plus,
	Power,
	PowerOff,
	Save,
	Search,
	Trash2,
	Upload,
	Video,
	X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContentManager } from "@/features/staff/components/admin-cards/card-content-manager";
import { CardDescriptionCell } from "@/features/staff/components/admin-cards/card-description-cell";
import { CardContentsViewer } from "@/features/staff/components/admin-cards/card-contents-viewer";
import { CardPreviewModal } from "@/features/staff/components/admin-cards/card-preview-modal";
import { CardTemplateFormModal } from "@/features/staff/components/admin-cards/card-template-form-modal";
import {
	normalizeArcanaType,
	normalizeContentType,
	normalizeRarity,
	normalizeSuit,
	PAGE_SIZE,
	RARITY_COLOR,
} from "@/features/staff/components/admin-cards/shared";
import { useAdminUpload } from "@/features/staff/hooks/use-admin-upload";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type {
	CardContentManagerProps,
	CardContentsViewerProps,
	CardPreviewModalProps,
	CardTemplateFormModalProps,
	CardTemplatesPageResult,
	ToggleContentPayload,
	UpdateContentPayload,
} from "@/features/staff/types/admin-cards";
import type {
	CardContentRequestDTO,
	CardContentResponse,
	CardFrameworkResponse,
	CardTemplateRequestDTO,
	CardTemplateResponse,
	CardTemplateSummary,
} from "@/features/staff/types/catalog";
import { getApiErrorMessage } from "@/types/api";

export function AdminCardsPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [rarityFilter, setRarityFilter] = useState("ALL");
	const [frameworkFilter, setFrameworkFilter] = useState("ALL");
	const [page, setPage] = useState(0);
	const [viewMode, setViewMode] = useState<"grid" | "list">("list");

	const [previewCard, setPreviewCard] = useState<CardTemplateResponse | null>(
		null,
	);
	const [editCard, setEditCard] = useState<CardTemplateResponse | null>(null);
	const [editInitialTab, setEditInitialTab] = useState<"info" | "contents">(
		"info",
	);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const { data, isLoading } = useQuery<CardTemplatesPageResult>({
		queryKey: ["admin", "card-templates", page, rarityFilter],
		queryFn: async () => {
			if (rarityFilter !== "ALL") {
				// Use dedicated rarity endpoint: GET /api/card-templates/by-rarity/{rarity}?page=0&size=12
				const params = new URLSearchParams({
					page: String(page),
					size: String(PAGE_SIZE),
					includeInvisible: "true",
				});
				const res = await apiRequest(
					`${API_ENDPOINTS.cardTemplates.byRarity(rarityFilter)}?${params}`,
				);
				// BE may return Page<T> or Array — normalise both
				const raw = res.data as unknown;
				if (Array.isArray(raw)) {
					return {
						content: raw,
						totalElements: raw.length,
						totalPages: 1,
						number: 0,
					};
				}
				return raw as CardTemplatesPageResult;
			}
			const params = new URLSearchParams({
				page: String(page),
				size: String(PAGE_SIZE),
				includeInvisible: "true",
			});
			const res = await apiRequest(
				`${API_ENDPOINTS.cardTemplates.list}?${params}`,
			);
			const raw = res.data as unknown;
			if (Array.isArray(raw)) {
				return {
					content: raw,
					totalElements: raw.length,
					totalPages: 1,
					number: 0,
				};
			}
			return raw as CardTemplatesPageResult;
		},
	});

	const cards: CardTemplateResponse[] = data?.content || [];
	const totalPages = data?.totalPages || 1;
	const totalElements = data?.totalElements ?? cards.length;
	const frameworkOptions = [
		"ALL",
		...Array.from(
			new Set(
				cards
					.map((card) => card.frameworkName?.trim())
					.filter((name): name is string => Boolean(name)),
			),
		).sort((a, b) => a.localeCompare(b)),
	];

	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			apiRequest(API_ENDPOINTS.cardTemplates.byId(id), { method: "DELETE" }),
		onSuccess: () => {
			toast.success("Đã xoá Card Template");
			queryClient.invalidateQueries({ queryKey: ["admin", "card-templates"] });
		},
	});

	const toggleVisibilityMutation = useMutation({
		mutationFn: (id: number) =>
			apiRequest(API_ENDPOINTS.cardTemplates.toggleVisibility(id), {
				method: "PATCH",
			}),
		onSuccess: () => {
			toast.success("Cập nhật hiển thị thành công!");
			queryClient.invalidateQueries({ queryKey: ["admin", "card-templates"] });
		},
		onError: (err) => {
			toast.error(getApiErrorMessage(err, "Không thể toggle visibility"));
		},
	});

	// Client-side search filter (rarity already handled server-side via endpoint)
	const filtered = cards.filter((c) => {
		const matchesSearch =
			search === "" || c.name.toLowerCase().includes(search.toLowerCase());
		// Belt-and-suspenders: also filter client-side in case BE returns mixed
		const matchesRarity = rarityFilter === "ALL" || c.rarity === rarityFilter;
		const matchesFramework =
			frameworkFilter === "ALL" ||
			(c.frameworkName || "").toLowerCase() === frameworkFilter.toLowerCase();
		return matchesSearch && matchesRarity && matchesFramework;
	});

	const rarities = ["ALL", "COMMON", "RARE", "LEGENDARY"];

	return (
		<>
			{previewCard && (
				<CardPreviewModal
					card={previewCard}
					onClose={() => setPreviewCard(null)}
				/>
			)}

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				{isCreateOpen && (
					<CardTemplateFormModal
						mode="create"
						onClose={() => setIsCreateOpen(false)}
						onCreated={(created) => {
							setIsCreateOpen(false);
							setEditInitialTab("contents");
							setEditCard(created);
						}}
					/>
				)}
			</Dialog>

			<Dialog
				open={!!editCard}
				onOpenChange={(isOpen) => !isOpen && setEditCard(null)}
			>
				{editCard && (
					<CardTemplateFormModal
						cardSummary={editCard}
						mode="edit"
						initialTab={editInitialTab}
						onClose={() => setEditCard(null)}
					/>
				)}
			</Dialog>

			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="badge-mystic inline-flex mb-2">
							Admin / Quản Trị Hệ Thống
						</p>
						<h1
							className="text-3xl text-foreground"
							style={{ fontFamily: "Fruktur, var(--font-heading)" }}
						>
							Quản Lý Thẻ Gốc
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Quản lý các mẫu {totalElements} thẻ bài (Template) để đưa vào các
							Gacha Pool
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsCreateOpen(true)}
						className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
					>
						<Plus className="h-4 w-4" />
						Thêm Thẻ Mới
					</button>
				</div>

				<div className="glass-card flex flex-col gap-3 rounded-2xl border border-border/50 p-4 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Tìm tên thẻ bài..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(0);
							}}
							className="w-full rounded-lg border border-border/50 bg-card/60 py-2 pl-9 pr-4 text-sm text-foreground focus:outline-primary focus:border-primary/50 transition-all"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex bg-secondary/30 rounded-lg p-1 border border-border/50">
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
							>
								<LayoutGrid className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={() => setViewMode("list")}
								className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
							>
								<ListIcon className="h-4 w-4" />
							</button>
						</div>
						<div className="h-8 w-px bg-border/50 mx-1"></div>
						{rarities.map((r) => (
							<button
								type="button"
								key={r}
								onClick={() => {
									setRarityFilter(r);
									setPage(0);
								}}
								className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
									rarityFilter === r
										? "gradient-gold-purple-bg border-transparent text-primary-foreground"
										: "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
								}`}
							>
								{r === "ALL" ? "Tất Cả" : r}
							</button>
						))}
						<select
							value={frameworkFilter}
							onChange={(e) => {
								setFrameworkFilter(e.target.value);
								setPage(0);
							}}
							className="rounded-full border border-border/50 bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground focus:outline-primary"
						>
							{frameworkOptions.map((framework) => (
								<option key={framework} value={framework}>
									{framework === "ALL" ? "Framework: Tất Cả" : framework}
								</option>
							))}
						</select>
					</div>
				</div>

				{isLoading ? (
					<div className="flex justify-center p-12">
						<LoaderCircle className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
						<CreditCard className="mb-4 h-12 w-12 text-muted-foreground/30" />
						<p className="text-sm text-muted-foreground font-medium">
							Không tìm thấy Card Template nào.
						</p>
					</div>
				) : (
					<div className="relative group/pagination">
						{/* Hover left arrow */}
						{totalPages > 1 && page > 0 && (
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								className="absolute left-0 top-0 bottom-0 z-20 w-16 flex items-center justify-center opacity-0 group-hover/pagination:opacity-100 bg-linear-to-r from-background/90 to-transparent transition-all duration-300 pointer-events-auto"
							>
								<div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-card/80 border border-border/50 flex items-center justify-center shadow-lg hover:bg-primary/20 hover:text-primary transition-colors backdrop-blur-md">
									<ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
								</div>
							</button>
						)}

						{/* Hover right arrow */}
						{totalPages > 1 && page < totalPages - 1 && (
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
								className="absolute right-0 top-0 bottom-0 z-20 w-16 flex items-center justify-center opacity-0 group-hover/pagination:opacity-100 bg-linear-to-l from-background/90 to-transparent transition-all duration-300 pointer-events-auto"
							>
								<div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-card/80 border border-border/50 flex items-center justify-center shadow-lg hover:bg-primary/20 hover:text-primary transition-colors backdrop-blur-md">
									<ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
								</div>
							</button>
						)}

						{viewMode === "grid" ? (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 lg:gap-6 px-1 sm:px-4">
						{filtered.map((card) => (
							<div
								key={card.cardTemplateId}
								className="glass-card group relative flex flex-col rounded-2xl border border-border/50 p-4 transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 cursor-default duration-300"
							>
								<div className="relative mx-auto mb-4 h-48 w-32 overflow-hidden rounded-xl border border-border/40 shadow-inner">
									{card.imagePath ? (
										<Image
											src={card.imagePath}
											alt={card.name}
											fill
											className="object-cover transition-transform duration-500 group-hover:scale-110"
											unoptimized
										/>
									) : (
										<div className="flex h-full items-center justify-center bg-card/60">
											<CreditCard className="h-8 w-8 text-muted-foreground/30" />
										</div>
									)}
									<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
								<p
									className="truncate text-base font-bold text-foreground text-center"
									style={{ fontFamily: "Outfit" }}
								>
									{card.name}
								</p>
								<div className="flex items-center justify-center mt-2">
									<span
										className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase ${RARITY_COLOR[card.rarity || "COMMON"] ?? "bg-muted/40 text-muted-foreground"}`}
									>
										{card.rarity}
									</span>
								</div>

								<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/90 p-4 opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100">
									<button
										type="button"
										onClick={() => setPreviewCard(card)}
										className="flex w-full max-w-[140px] items-center justify-center gap-2 rounded-lg bg-primary/20 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
									>
										<Eye className="h-4 w-4" /> Chi Tiết
									</button>
									<button
										type="button"
										onClick={() => {
											setEditInitialTab("info");
											setEditCard(card);
										}}
										className="flex w-full max-w-[140px] items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
									>
										<Edit2 className="h-4 w-4" /> Sửa Thẻ
									</button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<button
												type="button"
												className="flex w-full max-w-[140px] items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
											>
												<Trash2 className="h-4 w-4" /> Xoá Bỏ
											</button>
										</AlertDialogTrigger>
										<AlertDialogContent className="border-border/50 glass-card">
											<AlertDialogHeader>
												<AlertDialogTitle>Xác nhận xoá thẻ?</AlertDialogTitle>
												<AlertDialogDescription>
													Hành động xoá Card Template{" "}
													<strong>{card.name}</strong> sẽ làm lỗi các hệ thống
													đang tham chiếu nếu nó đã được phát hành!
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border">
													Huỷ bỏ
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() =>
														deleteMutation.mutate(card.cardTemplateId)
													}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
												>
													Vẫn Xoá
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
						<div className="overflow-x-auto min-h-[400px]">
							<table className="w-full text-sm text-left">
								<thead className="border-b border-border/40 bg-card/60 text-xs text-muted-foreground">
									<tr>
										<th className="px-4 py-3 font-semibold text-left">
											Ảnh Thẻ
										</th>
										<th className="px-4 py-3 font-semibold text-left">
											Tên Thẻ
										</th>
										<th className="px-4 py-3 font-semibold text-left">
											Rare & Bộ Ẩn
										</th>
										<th className="px-4 py-3 font-semibold text-left">Mô Tả</th>
										<th className="px-4 py-3 font-semibold text-center">
											Hiển Thị
										</th>
										<th className="px-4 py-3 font-semibold text-right">
											Thao Tác
										</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map((card) => (
										<tr
											key={card.cardTemplateId}
											className="border-b border-border/20 transition-colors hover:bg-card/40 last:border-0 group"
										>
											<td className="px-4 py-3 w-28">
												<div className="relative h-20 w-14 rounded-md border border-border/40 overflow-hidden shadow-sm">
													{card.imagePath ? (
														<Image
															src={card.imagePath}
															alt={card.name}
															fill
															className="object-cover"
														/>
													) : (
														<div className="flex h-full items-center justify-center bg-card/60">
															<CreditCard className="h-5 w-5 text-muted-foreground/30" />
														</div>
													)}
												</div>
											</td>
											<td className="px-4 py-3">
												<p className="font-bold text-foreground text-sm tracking-normal">
													{card.name}
												</p>
												<p className="text-xs text-muted-foreground mt-0.5 font-medium">
													#{card.cardNumber} •{" "}
													{card.frameworkName || "Rider-Waite"}
												</p>
											</td>
											<td className="px-4 py-3">
												<div className="flex flex-col items-start gap-1.5">
													<span
														className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${RARITY_COLOR[card.rarity || "COMMON"] ?? "bg-muted/40 text-muted-foreground"}`}
													>
														{card.rarity}
													</span>
													<span className="text-xs font-medium text-muted-foreground">- {card.cardType}</span>
												</div>
											</td>
											<td className="px-4 py-3 text-center">
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<button
															type="button"
															title={card.isVisible !== false ? "Nhấn để Ẩn khỏi Gallery" : "Nhấn để Hiện lại"}
															className={`inline-flex items-center justify-center rounded-lg border p-1.5 transition-colors ${
																card.isVisible !== false
																	? "border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20"
																	: "border-muted/30 bg-muted/10 text-muted-foreground hover:bg-muted/20"
															}`}
														>
															{card.isVisible !== false ? (
																<Eye className="h-4 w-4" />
															) : (
																<EyeOff className="h-4 w-4" />
															)}
														</button>
													</AlertDialogTrigger>
													<AlertDialogContent className="border-border/50 glass-card">
														<AlertDialogHeader>
															<AlertDialogTitle>
																Xác nhận thay đổi hiển thị?
															</AlertDialogTitle>
															<AlertDialogDescription>
																{card.isVisible !== false
																	? `Ẩn "<strong>${card.name}</strong>" khỏi Card Gallery công khai. Người dùng sẽ không thấy thẻ này.`
																	: `Hiện lại "<strong>${card.name}</strong>" trong Card Gallery công khai.`}
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border">
																Huỷ bỏ
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	toggleVisibilityMutation.mutate(card.cardTemplateId)
																}
																className={card.isVisible !== false ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-green-600 text-white hover:bg-green-700"}
															>
																{card.isVisible !== false ? "Ẩn Thẻ" : "Hiện Thẻ"}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</td>
											<td className="px-4 py-3 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														type="button"
														onClick={() => setPreviewCard(card)}
														title="Xem chi tiết"
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
													>
														<Eye className="h-4 w-4" />
													</button>
													<button
														type="button"
														onClick={() => {
															setEditInitialTab("info");
															setEditCard(card);
														}}
														title="Chỉnh sửa"
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
													>
														<Edit2 className="h-4 w-4" />
													</button>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<button
																type="button"
																title="Xoá"
																className="inline-flex items-center justify-center rounded-lg border border-destructive/20 p-1.5 text-destructive transition-colors hover:bg-destructive/10"
															>
																<Trash2 className="h-4 w-4" />
															</button>
														</AlertDialogTrigger>
														<AlertDialogContent className="border-border/50 glass-card">
															<AlertDialogHeader>
																<AlertDialogTitle>
																	Xác nhận xoá thẻ?
																</AlertDialogTitle>
																<AlertDialogDescription>
																	Hành động xoá Card Template{" "}
																	<strong>{card.name}</strong> sẽ làm lỗi các hệ
																	thống đang tham chiếu nếu nó đã được phát
																	hành!
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border">
																	Huỷ bỏ
																</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() =>
																		deleteMutation.mutate(card.cardTemplateId)
																	}
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
																>
																	Vẫn Xoá
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
						)}
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex items-center justify-between border-t border-border/40 px-4 py-3 mt-4 glass-card rounded-2xl">
						<p className="text-xs text-muted-foreground">
							Trang {page + 1} / {totalPages}
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								disabled={page === 0}
								className="rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
								disabled={page >= totalPages - 1}
								className="rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
