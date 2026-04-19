"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/types/api";
import type { CardTemplateInfo, PackCategory, PackCategoryRequest, RarityRates } from "@/features/staff/types/pack-category";

// shared
import { RarityBadge } from "../shared/pack-status-badge";
import {
	RarityEditor,
	parseRarityRates,
	stringifyRarityRates,
	DEFAULT_RARITY_RATES,
} from "../shared";

import {
	Check,
	Eye,
	EyeOff,
	Layers,
	PackagePlus,
	Pencil,
	Plus,
	RefreshCw,
	Search,
	Trash2,
	X,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function PackCategorySection() {
	const [categories, setCategories] = useState<PackCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [showInactive, setShowInactive] = useState(false);

	const [cardTemplates, setCardTemplates] = useState<CardTemplateInfo[]>([]);
	const [templateSearch, setTemplateSearch] = useState("");

	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<PackCategory | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<PackCategory | null>(null);
	const [activeTarget, setActiveTarget] = useState<PackCategory | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const [form, setForm] = useState<PackCategoryRequest>({
		name: "",
		description: "",
		imageUrl: "",
		cardsPerPack: 5,
		rarityRates: stringifyRarityRates(DEFAULT_RARITY_RATES),
		isActive: true,
		cardTemplateIds: [],
	});
	const [rarityObj, setRarityObj] = useState<RarityRates>(DEFAULT_RARITY_RATES);

	// Filtered card templates based on search
	const filteredTemplates = useMemo(() => {
		if (!templateSearch.trim()) return cardTemplates;
		const q = templateSearch.toLowerCase();
		return cardTemplates.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				t.rarity?.toLowerCase().includes(q)
		);
	}, [cardTemplates, templateSearch]);

	const toggleTemplateInPool = (id: number) => {
		setForm((f) => {
			const ids = f.cardTemplateIds ?? [];
			return {
				...f,
				cardTemplateIds: ids.includes(id)
					? ids.filter((x) => x !== id)
					: [...ids, id],
			};
		});
	};

	const fetchCategories = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/pack-categories");
			const json = await res.json();
			setCategories(json.data ?? []);
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Không thể tải Pack Categories"));
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchCardTemplates = useCallback(async () => {
		try {
			const res = await fetch("/api/card-templates?size=500&includeInvisible=true");
			const json = await res.json();
			const payload = json.data;
			if (payload?.content) {
				setCardTemplates(payload.content);
			} else if (Array.isArray(payload)) {
				setCardTemplates(payload);
			}
		} catch {
			// silently fail — not critical
		}
	}, []);

	useEffect(() => {
		fetchCategories();
		fetchCardTemplates();
	}, [fetchCategories, fetchCardTemplates]);

	const filtered = categories.filter((c) => {
		const ms = !search || c.name.toLowerCase().includes(search.toLowerCase());
		const ma = showInactive || c.isActive;
		return ms && ma;
	});

	const openCreate = () => {
		setEditTarget(null);
		setTemplateSearch("");
		setRarityObj({ ...DEFAULT_RARITY_RATES });
		setForm({
			name: "",
			description: "",
			imageUrl: "",
			cardsPerPack: 5,
			rarityRates: stringifyRarityRates(DEFAULT_RARITY_RATES),
			isActive: true,
			cardTemplateIds: [],
		});
		setModalOpen(true);
	};

	const openEdit = (cat: PackCategory) => {
		setEditTarget(cat);
		setTemplateSearch("");
		const rates = parseRarityRates(cat.rarityRates);
		setRarityObj(rates);
		setForm({
			name: cat.name,
			description: cat.description ?? "",
			imageUrl: cat.imageUrl ?? "",
			cardsPerPack: cat.cardsPerPack,
			rarityRates: cat.rarityRates,
			isActive: cat.isActive,
			cardTemplateIds: cat.cardPools?.map((c) => c.cardTemplateId) ?? [],
		});
		setModalOpen(true);
	};

	const handleRarityChange = (rates: RarityRates) => {
		setRarityObj(rates);
		setForm((f) => ({ ...f, rarityRates: stringifyRarityRates(rates) }));
	};

	const handleSubmit = async () => {
		if (!form.name.trim()) {
			toast.error("Tên Pack Category không được để trống");
			return;
		}
		const total = Object.values(rarityObj).reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
		if (total !== 100) {
			toast.error(`Tổng tỷ lệ độ hiếm phải đủ 100% (hiện: ${total}%)`);
			return;
		}
		if (form.cardsPerPack <= 0) {
			toast.error("Số bài/gói phải lớn hơn 0");
			return;
		}
		setSubmitting(true);
		try {
			const url = editTarget
				? `/api/pack-categories/${editTarget.packCategoryId}`
				: "/api/pack-categories";
			const res = await fetch(url, {
				method: editTarget ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (!res.ok) {
				const e = await res.json();
				throw new Error(e.message ?? "Lỗi");
			}
			toast.success(
				editTarget ? "Cập nhật thành công!" : "Tạo Pack Category thành công!"
			);
			setModalOpen(false);
			fetchCategories();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Lưu thất bại"));
		} finally {
			setSubmitting(false);
		}
	};

	const handleToggleActive = async (cat: PackCategory) => {
		try {
			await fetch(
				`/api/pack-categories/${cat.packCategoryId}/toggle-active`,
				{ method: "PUT" }
			);
			toast.success(
				cat.isActive
					? `"${cat.name}" đã vô hiệu hóa`
					: `"${cat.name}" đã kích hoạt`
			);
			fetchCategories();
			setActiveTarget(null);
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Toggle thất bại"));
		}
	};

	const handleDelete = async (cat: PackCategory) => {
		try {
			await fetch(`/api/pack-categories/${cat.packCategoryId}`, {
				method: "DELETE",
			});
			toast.success(`Đã vô hiệu hóa "${cat.name}"`);
			setDeleteTarget(null);
			fetchCategories();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Xóa thất bại"));
		}
	};

	return (
		<div className="space-y-5">
			{/* Toolbar */}
			<Card className="glass-card">
				<CardContent className="p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Tìm theo tên..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
						<label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
							<Switch checked={showInactive} onCheckedChange={setShowInactive} />
							Hiển thị vô hiệu hóa
						</label>
						<Button onClick={openCreate} size="sm">
							<Plus className="h-4 w-4 mr-1" /> Tạo Category
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={fetchCategories}
							disabled={loading}
						>
							<RefreshCw
								className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
							/>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Table */}
			<Card className="glass-card">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Pack Category</TableHead>
								<TableHead>Cấu hình Gacha</TableHead>
								<TableHead>Card Pool</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead className="text-right">Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading
								? Array.from({ length: 5 }).map((_, i) => (
										<TableRow key={i}>
											{Array.from({ length: 5 }).map((__, j) => (
												<TableCell key={j}>
													<div className="h-4 w-24 bg-muted rounded animate-pulse" />
												</TableCell>
											))}
										</TableRow>
									))
								: filtered.length === 0
									? (
										<TableRow>
											<TableCell
												colSpan={5}
												className="text-center py-12 text-muted-foreground"
											>
												<Layers className="mx-auto h-10 w-10 opacity-30 mb-2" />
												Không có Pack Category nào
											</TableCell>
										</TableRow>
									)
									: filtered.map((cat) => {
										const rates = parseRarityRates(cat.rarityRates);
										return (
											<TableRow
												key={cat.packCategoryId}
												className={`hover:bg-card/40 ${!cat.isActive ? "opacity-50" : ""}`}
											>
												<TableCell>
													<div className="flex items-center gap-3">
														<div className="h-12 w-12 rounded-lg border border-border/40 overflow-hidden bg-secondary/10 flex-shrink-0">
															{cat.imageUrl ? (
																<Image
																	src={cat.imageUrl}
																	alt={cat.name}
																	width={48}
																	height={48}
																	className="h-full w-full object-cover"
																/>
															) : (
																<PackagePlus className="h-full w-full p-2 text-muted-foreground" />
															)}
														</div>
														<div>
															<p className="font-medium">{cat.name}</p>
															{cat.description && (
																<p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
																	{cat.description}
																</p>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="space-y-1">
														<div className="text-sm">
															<span className="text-muted-foreground">
																Số bài/pack:{" "}
															</span>
															<span className="font-medium">{cat.cardsPerPack}</span>
														</div>
														<div className="flex gap-1 flex-wrap">
															{Object.entries(rates).map(([rarity]) => (
																<RarityBadge
																	key={rarity}
																	rarity={rarity}
																	short
																/>
															))}
														</div>
													</div>
												</TableCell>
												<TableCell>
													{cat.cardPools && cat.cardPools.length > 0 ? (
														<span className="text-green-400 text-sm">
															{cat.cardPools.length} templates
														</span>
													) : (
														<span className="text-yellow-400 text-sm">
															Chưa cấu hình
														</span>
													)}
												</TableCell>
												<TableCell>
													<Badge
														className={
															cat.isActive
																? "bg-green-500/10 text-green-400 border-green-500/25"
																: "bg-muted/40 text-muted-foreground border-border/25"
														}
													>
														{cat.isActive ? "Hoạt động" : "Vô hiệu"}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-1">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => setActiveTarget(cat)}
															title={cat.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
														>
															{cat.isActive ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4 text-green-400" />
															)}
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => openEdit(cat)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-red-400 hover:text-red-300"
															onClick={() => setDeleteTarget(cat)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Create/Edit Modal */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5 text-primary" />
							{editTarget ? "Chỉnh sửa Pack Category" : "Tạo Pack Category mới"}
						</DialogTitle>
						<DialogDescription>
							Cấu hình thông tin & tỷ lệ gacha cho loại pack này
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label>
								Tên Pack Category <span className="text-red-400">*</span>
							</Label>
							<Input
								value={form.name}
								onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
								placeholder="Ví dụ: Premium Mystic Pack"
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Mô tả</Label>
							<Textarea
								value={form.description}
								onChange={(e) =>
									setForm((f) => ({ ...f, description: e.target.value }))
								}
								rows={3}
								placeholder="Mô tả ngắn về loại pack này..."
							/>
						</div>
						<div className="space-y-1.5">
							<Label>URL Ảnh đại diện</Label>
							<Input
								value={form.imageUrl}
								onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
								placeholder="https://example.com/image.png"
							/>
						</div>
						<div className="space-y-1.5">
							<Label>
								Số bài/gói <span className="text-red-400">*</span>
							</Label>
							<Input
								type="number"
								min="1"
								max="20"
								value={form.cardsPerPack}
								onChange={(e) =>
									setForm((f) => ({
										...f,
										cardsPerPack: parseInt(e.target.value) || 1,
									}))
								}
							/>
						</div>
						{/* Card Pool Picker */}
						<div className="space-y-2">
							<Label>
								Card Pool{" "}
								<span className="text-muted-foreground text-xs font-normal">
									({form.cardTemplateIds?.length ?? 0} đã chọn)
								</span>
							</Label>
							{/* Selected chips */}
							{(form.cardTemplateIds?.length ?? 0) > 0 && (
								<div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border/40 bg-card/20 min-h-[36px]">
									{form.cardTemplateIds!.map((id) => {
										const t = cardTemplates.find((c) => c.cardTemplateId === id);
										if (!t) return null;
										return (
											<span
												key={id}
												className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary border border-primary/25"
											>
												{t.name}
												<button
													type="button"
													onClick={() => toggleTemplateInPool(id)}
													className="hover:text-red-400 transition-colors"
												>
													<X className="h-3 w-3" />
												</button>
											</span>
										);
									})}
								</div>
							)}
							{/* Search box */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<input
									type="text"
									placeholder="Tìm card template theo tên hoặc rarity..."
									value={templateSearch}
									onChange={(e) => setTemplateSearch(e.target.value)}
									className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/40 bg-card/20 text-sm focus:outline-none focus:border-primary transition-colors"
								/>
							</div>
							{/* Template list */}
							<div className="max-h-52 overflow-y-auto rounded-lg border border-border/40 bg-card/10 divide-y divide-border/20">
								{filteredTemplates.length === 0 ? (
									<p className="text-center text-xs text-muted-foreground py-4">
										{cardTemplates.length === 0 ? "Đang tải..." : "Không tìm thấy template"}
									</p>
								) : (
									filteredTemplates.map((t) => {
										const selected = form.cardTemplateIds?.includes(t.cardTemplateId);
										const rarityColor =
											t.rarity === "LEGENDARY"
												? "text-yellow-400"
												: t.rarity === "RARE"
													? "text-blue-400"
													: "text-muted-foreground";
										return (
											<button
												type="button"
												key={t.cardTemplateId}
												onClick={() => toggleTemplateInPool(t.cardTemplateId)}
												className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-card/50 ${
													selected ? "bg-primary/10" : ""
												}`}
											>
												{t.imagePath ? (
													<Image
														src={t.imagePath}
														alt={t.name}
														width={28}
														height={28}
														className="rounded object-cover flex-shrink-0"
													/>
												) : (
													<div className="w-7 h-7 rounded bg-secondary/20 flex-shrink-0" />
												)}
												<span className="flex-1 font-medium truncate">{t.name}</span>
												<span className={`text-xs shrink-0 ${rarityColor}`}>{t.rarity}</span>
												{selected && <Check className="h-4 w-4 text-primary shrink-0" />}
											</button>
										);
									})
								)}
							</div>
						</div>

						{/* Rarity Editor */}
						<div className="space-y-2">
							<Label>
								Tỷ lệ Rarity (tổng phải = 100%){" "}
								<span className="text-red-400">*</span>
							</Label>
							<div className="p-4 rounded-lg border border-border/40 bg-card/30">
								<RarityEditor value={rarityObj} onChange={handleRarityChange} />
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Switch
								id="pca"
								checked={form.isActive ?? true}
								onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
							/>
							<Label htmlFor="pca">Kích hoạt ngay sau khi lưu</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setModalOpen(false)}>
							Hủy
						</Button>
						<Button onClick={handleSubmit} disabled={submitting}>
							{submitting ? "Đang lưu..." : editTarget ? "Cập nhật" : "Tạo mới"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirm */}
			<AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Vô hiệu hóa Pack Category?</AlertDialogTitle>
						<AlertDialogDescription>
							Pack Category &quot;{deleteTarget?.name}&quot; sẽ bị đặt thành không hoạt
							động (soft delete).
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:bg-red-700"
							onClick={() => deleteTarget && handleDelete(deleteTarget)}
						>
							Vô hiệu hóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Category Active Confirm */}
			<AlertDialog open={!!activeTarget} onOpenChange={() => setActiveTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{activeTarget?.isActive ? "Vô hiệu hóa" : "Kích hoạt"} danh mục Pack?</AlertDialogTitle>
						<AlertDialogDescription>
							Danh mục &quot;{activeTarget?.name}&quot; sẽ {activeTarget?.isActive ? "bị vô hiệu hóa khỏi hệ thống" : "được kích hoạt trở lại"}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => activeTarget && handleToggleActive(activeTarget)}
						>
							Xác nhận
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
