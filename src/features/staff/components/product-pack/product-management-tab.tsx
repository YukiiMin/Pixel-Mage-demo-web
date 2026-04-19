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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import type {
	AdminProduct,
	PackCategory,
	ProductRequest,
	ProductType,
	CardTemplateInfo
} from "@/features/staff/types/pack-category";
import { SimpleStatCard } from "../shared";
import {
	ChevronLeft,
	ChevronRight,
	Eye,
	EyeOff,
	Package,
	Pencil,
	Plus,
	RefreshCw,
	Search,
	ShoppingBag,
	Trash2,
	FileText,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (n: number) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — PRODUCT MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════
export function ProductManagementTab() {
	const [products, setProducts] = useState<AdminProduct[]>([]);
	const [packCategories, setPackCategories] = useState<PackCategory[]>([]);
	const [cardTemplates, setCardTemplates] = useState<CardTemplateInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<"ALL" | ProductType>("ALL");
	const [showInactive, setShowInactive] = useState(false);
	const [prodPage, setProdPage] = useState(0);
	const PROD_PAGE_SIZE = 12;

	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<AdminProduct | null>(null);
	const [viewTarget, setViewTarget] = useState<AdminProduct | null>(null);
	const [activeTarget, setActiveTarget] = useState<AdminProduct | null>(null);
	const [visibilityTarget, setVisibilityTarget] = useState<AdminProduct | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const [form, setForm] = useState<ProductRequest>({
		name: "",
		description: "",
		price: 0,
		imageUrl: "",
		productType: "GACHA_PACK",
		isVisible: true,
		isActive: true,
		packCategoryId: undefined,
		cardTemplateId: undefined,
	});

	const fetchAll = useCallback(async () => {
		setLoading(true);
		try {
			const [pRes, cRes, ctRes] = await Promise.all([
				fetch("/api/products"),
				fetch("/api/pack-categories"),
				fetch("/api/card-templates?size=500&includeInvisible=true"),
			]);
			const [pJson, cJson, ctJson] = await Promise.all([pRes.json(), cRes.json(), ctRes.json()]);
			setProducts(pJson.data ?? []);
			setPackCategories(cJson.data ?? []);
			
			const ctPayload = ctJson.data;
			if (ctPayload?.content) {
				setCardTemplates(ctPayload.content);
			} else if (Array.isArray(ctPayload)) {
				setCardTemplates(ctPayload);
			} else {
				setCardTemplates([]);
			}
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Không thể tải dữ liệu"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	const filtered = products.filter((p) => {
		const ms = !search || p.name.toLowerCase().includes(search.toLowerCase());
		const mt = typeFilter === "ALL" || p.productType === typeFilter;
		const ma = showInactive || p.isActive;
		return ms && mt && ma;
	});

	// Reset page when filters change
	useEffect(() => { setProdPage(0); }, [search, typeFilter, showInactive]); // eslint-disable-line react-hooks/exhaustive-deps

	const totalProdPages = Math.ceil(filtered.length / PROD_PAGE_SIZE);
	const pagedFiltered = filtered.slice(prodPage * PROD_PAGE_SIZE, (prodPage + 1) * PROD_PAGE_SIZE);

	const selectedPackCat = packCategories.find(
		(c) => c.packCategoryId === form.packCategoryId
	);
	const selectedCardTemplate = cardTemplates.find(
		(c) => c.cardTemplateId === form.cardTemplateId
	);
	const effectiveImage = form.imageUrl || selectedPackCat?.imageUrl || selectedCardTemplate?.imagePath || "";

	const openCreate = () => {
		setEditTarget(null);
		setForm({
			name: "",
			description: "",
			price: 0,
			imageUrl: "",
			productType: "GACHA_PACK",
			isVisible: true,
			isActive: true,
			packCategoryId: undefined,
			cardTemplateId: undefined,
		});
		setModalOpen(true);
	};

	const openEdit = (p: AdminProduct) => {
		setEditTarget(p);
		setForm({
			name: p.name,
			description: p.description ?? "",
			price: p.price,
			imageUrl: p.imageUrl ?? "",
			productType: p.productType,
			isVisible: p.isVisible,
			isActive: p.isActive,
			packCategoryId: p.packCategory?.packCategoryId,
			cardTemplateId: p.cardTemplate?.cardTemplateId,
		});
		setModalOpen(true);
	};

	const handleSubmit = async () => {
		if (!form.name?.trim() && form.productType !== "GACHA_PACK") {
			toast.error("Tên sản phẩm không được để trống");
			return;
		}
		if (form.price == null || form.price < 0) {
			toast.error("Giá sản phẩm không hợp lệ");
			return;
		}
		if (form.productType === "GACHA_PACK" && !form.packCategoryId) {
			toast.error("Sản phẩm GACHA_PACK phải chọn Pack Category");
			return;
		}
		if (form.productType === "SINGLE_CARD" && !form.cardTemplateId) {
			toast.error("Sản phẩm SINGLE_CARD phải chọn Card Template");
			return;
		}
		setSubmitting(true);
		try {
			const url = editTarget
				? `/api/products/${editTarget.productId}`
				: "/api/products";
			const res = await fetch(url, {
				method: editTarget ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (!res.ok) {
				const e = await res.json();
				throw new Error(e.message ?? "Lỗi");
			}
			toast.success(editTarget ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
			setModalOpen(false);
			fetchAll();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Lưu thất bại"));
		} finally {
			setSubmitting(false);
		}
	};

	const handleToggleActive = async (p: AdminProduct) => {
		try {
			await fetch(`/api/products/${p.productId}/toggle-active`, { method: "PUT" });
			toast.success(p.isActive ? `"${p.name}" đã vô hiệu hóa` : `"${p.name}" đã kích hoạt`);
			fetchAll();
			setActiveTarget(null);
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Toggle thất bại"));
		}
	};

	const handleToggleVisibility = async (p: AdminProduct) => {
		try {
			await fetch(`/api/products/${p.productId}/toggle-visibility`, { method: "PUT" });
			toast.success(
				p.isVisible ? `"${p.name}" đã ẩn khỏi shop` : `"${p.name}" đã hiển thị trên shop`
			);
			fetchAll();
			setVisibilityTarget(null);
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Toggle visibility thất bại"));
		}
	};

	const handleDelete = async (p: AdminProduct) => {
		try {
			await fetch(`/api/products/${p.productId}`, { method: "DELETE" });
			toast.success(`Đã vô hiệu hóa "${p.name}"`);
			setDeleteTarget(null);
			fetchAll();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Xóa thất bại"));
		}
	};

	const stats = [
		{ label: "Tổng SP", value: products.length, icon: ShoppingBag, iconColor: "text-muted-foreground", iconBgColor: "bg-card/40" },
		{ label: "Gacha Pack", value: products.filter((p) => p.productType === "GACHA_PACK").length, icon: Zap, iconColor: "text-purple-400", iconBgColor: "bg-purple-500/10", valueColor: "text-purple-400" },
		{ label: "Single Card", value: products.filter((p) => p.productType === "SINGLE_CARD").length, icon: Package, iconColor: "text-blue-400", iconBgColor: "bg-blue-500/10", valueColor: "text-blue-400" },
		{ label: "Đang hiển thị", value: products.filter((p) => p.isVisible && p.isActive).length, icon: Eye, iconColor: "text-green-400", iconBgColor: "bg-green-500/10", valueColor: "text-green-400" },
	];

	return (
		<div className="space-y-5">
			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{stats.map((s) => (
					<SimpleStatCard key={s.label} {...s} />
				))}
			</div>

			{/* Toolbar */}
			<Card className="glass-card">
				<CardContent className="p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Tìm tên sản phẩm..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={typeFilter}
							onValueChange={(v: "ALL" | ProductType) => setTypeFilter(v)}
						>
							<SelectTrigger className="w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">Tất cả loại</SelectItem>
								<SelectItem value="GACHA_PACK">Gacha Pack</SelectItem>
								<SelectItem value="SINGLE_CARD">Single Card</SelectItem>
							</SelectContent>
						</Select>
						<label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
							<Switch checked={showInactive} onCheckedChange={setShowInactive} />
							Hiển thị đã ẩn
						</label>
						<Button onClick={openCreate} size="sm">
							<Plus className="h-4 w-4 mr-1" /> Thêm sản phẩm
						</Button>
						<Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
							<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Table */}
			<div className="relative group/prodtable">

				{/* Hover Left Arrow */}
				{totalProdPages > 1 && prodPage > 0 && (
					<button
						type="button"
						onClick={() => setProdPage((p) => Math.max(0, p - 1))}
						className="absolute -left-6 top-0 bottom-0 z-20 w-12 flex items-center justify-center opacity-0 group-hover/prodtable:opacity-100 bg-gradient-to-r from-background/80 to-transparent transition-all duration-300 pointer-events-auto"
					>
						<div className="h-10 w-10 rounded-full bg-card/80 border border-border/50 flex items-center justify-center shadow-lg hover:bg-primary/20 hover:text-primary transition-colors backdrop-blur-md">
							<ChevronLeft className="h-6 w-6" />
						</div>
					</button>
				)}

				{/* Hover Right Arrow */}
				{totalProdPages > 1 && prodPage < totalProdPages - 1 && (
					<button
						type="button"
						onClick={() => setProdPage((p) => Math.min(totalProdPages - 1, p + 1))}
						className="absolute -right-6 top-0 bottom-0 z-20 w-12 flex items-center justify-center opacity-0 group-hover/prodtable:opacity-100 bg-gradient-to-l from-background/80 to-transparent transition-all duration-300 pointer-events-auto"
					>
						<div className="h-10 w-10 rounded-full bg-card/80 border border-border/50 flex items-center justify-center shadow-lg hover:bg-primary/20 hover:text-primary transition-colors backdrop-blur-md">
							<ChevronRight className="h-6 w-6" />
						</div>
					</button>
				)}

				<Card className="glass-card">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Sản phẩm</TableHead>
								<TableHead>Loại</TableHead>
								<TableHead>Giá</TableHead>
								<TableHead>Nguồn gốc</TableHead>
								<TableHead>Tồn kho</TableHead>
								<TableHead>Hiển thị</TableHead>
								<TableHead>Active</TableHead>
								<TableHead className="text-right">Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading
								? Array.from({ length: 5 }).map((_, i) => (
										<TableRow key={i}>
											{Array.from({ length: 8 }).map((__, j) => (
												<TableCell key={j}>
													<div className="h-4 w-16 bg-muted rounded animate-pulse" />
												</TableCell>
											))}
										</TableRow>
									))
								: pagedFiltered.length === 0
									? (
										<TableRow>
											<TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
												<ShoppingBag className="mx-auto h-10 w-10 opacity-30 mb-2" />
												Không có sản phẩm nào
											</TableCell>
										</TableRow>
									)
									: pagedFiltered.map((p) => (
										<TableRow
											key={p.productId}
											className={`hover:bg-card/40 ${!p.isActive ? "opacity-50" : ""}`}
										>
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="h-12 w-12 rounded-lg border border-border/40 overflow-hidden bg-secondary/10 flex-shrink-0">
														{p.imageUrl ? (
															<Image
																src={p.imageUrl}
																alt={p.name}
																width={48}
																height={48}
																className="h-full w-full object-cover"
															/>
														) : (
															<Package className="h-full w-full p-2 text-muted-foreground" />
														)}
													</div>
													<div>
														<p className="font-medium">{p.name}</p>
														<p className="text-xs text-muted-foreground">ID: {p.productId}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													className={
														p.productType === "GACHA_PACK"
															? "bg-purple-500/10 text-purple-400 border-purple-500/25"
															: "bg-blue-500/10 text-blue-400 border-blue-500/25"
													}
												>
													{p.productType === "GACHA_PACK" ? "🎲 Gacha" : "🃏 Single"}
												</Badge>
											</TableCell>
											<TableCell>
												<span className="font-medium text-primary">
													{formatCurrency(p.price)}
												</span>
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{p.packCategory?.name ?? p.cardTemplate?.name ?? "—"}
												</span>
											</TableCell>
											<TableCell>
												{p.stockCount != null ? (
													<Badge variant="outline" className="text-xs">
														{p.stockCount} {p.productType === "GACHA_PACK" ? "gói" : "thẻ"}
													</Badge>
												) : (
													<span className="text-muted-foreground text-xs">—</span>
												)}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setVisibilityTarget(p)}
													title={p.isVisible ? "Đang hiển thị" : "Đang ẩn"}
												>
													{p.isVisible ? (
														<Eye className="h-4 w-4 text-green-400" />
													) : (
														<EyeOff className="h-4 w-4 text-muted-foreground" />
													)}
												</Button>
											</TableCell>
											<TableCell>
												<Switch
													checked={p.isActive}
													onCheckedChange={() => setActiveTarget(p)}
												/>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-1">
													<Button variant="ghost" size="sm" onClick={() => setViewTarget(p)}>
														<FileText className="h-4 w-4 text-blue-400" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
														<Pencil className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="text-red-400 hover:text-red-300"
														onClick={() => setDeleteTarget(p)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			{/* Pagination info pill */}
			{totalProdPages > 1 && (
				<p className="text-xs text-muted-foreground text-center">
					Trang {prodPage + 1} / {totalProdPages} — {filtered.length} sản phẩm
				</p>
			)}
			</div>

			{/* Create/Edit Modal */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ShoppingBag className="h-5 w-5 text-primary" />
							{editTarget ? "Chỉnh sửa Sản Phẩm" : "Thêm Sản Phẩm mới"}
						</DialogTitle>
						<DialogDescription>
							Sản phẩm hiển thị trong cửa hàng để người dùng mua
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						{/* Product Type */}
						<div className="space-y-1.5">
							<Label>
								Loại sản phẩm <span className="text-red-400">*</span>
							</Label>
							<Select
								value={form.productType}
								onValueChange={(v: ProductType) =>
									setForm((f) => ({
										...f,
										productType: v,
										packCategoryId: undefined,
										cardTemplateId: undefined,
										imageUrl: "",
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="GACHA_PACK">
										🎲 Gacha Pack — Gói bài ngẫu nhiên
									</SelectItem>
									<SelectItem value="SINGLE_CARD">
										🃏 Single Card — Bài lẻ cụ thể
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Pack Category picker */}
						{form.productType === "GACHA_PACK" && (
							<div className="space-y-1.5">
								<Label>
									Pack Category <span className="text-red-400">*</span>
								</Label>
								<Select
									value={form.packCategoryId?.toString() ?? ""}
									onValueChange={(v) => {
										const cat = packCategories.find(
											(c) => c.packCategoryId === parseInt(v)
										);
										setForm((f) => ({
											...f,
											packCategoryId: parseInt(v),
											name: f.name || cat?.name || "",
											description: f.description || cat?.description || "",
											imageUrl: f.imageUrl || cat?.imageUrl || "",
										}));
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn Pack Category..." />
									</SelectTrigger>
									<SelectContent>
										{packCategories
											.filter((c) => c.isActive)
											.map((c) => (
												<SelectItem
													key={c.packCategoryId}
													value={c.packCategoryId.toString()}
												>
													{c.name} — {c.cardsPerPack} bài/gói
												</SelectItem>
											))}
									</SelectContent>
								</Select>
								{selectedPackCat && (
									<div className="p-3 rounded-lg border border-border/40 bg-card/20 flex gap-3 items-center mt-1">
										{selectedPackCat.imageUrl && (
											<Image
												src={selectedPackCat.imageUrl}
												alt={selectedPackCat.name}
												width={48}
												height={48}
												className="rounded-lg object-cover"
											/>
										)}
										<div className="text-xs text-muted-foreground">
											<p className="font-medium text-foreground">
												{selectedPackCat.name}
											</p>
											<p>
												{selectedPackCat.cardsPerPack} bài/gói ·{" "}
												{selectedPackCat.cardPools?.length ?? 0} templates trong pool
											</p>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Card Template picker */}
						{form.productType === "SINGLE_CARD" && (
							<div className="space-y-1.5">
								<Label>
									Card Template <span className="text-red-400">*</span>
								</Label>
								<Select
									value={form.cardTemplateId?.toString() ?? ""}
									onValueChange={(v) => {
										const template = cardTemplates.find(
											(t) => t.cardTemplateId === parseInt(v)
										);
										setForm((f) => ({
											...f,
											cardTemplateId: parseInt(v),
											name: f.name || template?.name || "",
											imageUrl: f.imageUrl || template?.imagePath || "",
										}));
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn Card Template..." />
									</SelectTrigger>
									<SelectContent>
										{cardTemplates.map((t) => (
											<SelectItem
												key={t.cardTemplateId}
												value={t.cardTemplateId.toString()}
											>
												{t.name} {t.rarity ? `— ${t.rarity}` : ""}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{selectedCardTemplate && (
									<div className="p-3 rounded-lg border border-border/40 bg-card/20 flex gap-3 items-center mt-1">
										{selectedCardTemplate.imagePath && (
											<Image
												src={selectedCardTemplate.imagePath}
												alt={selectedCardTemplate.name}
												width={48}
												height={48}
												className="rounded-lg object-cover"
											/>
										)}
										<div className="text-xs text-muted-foreground">
											<p className="font-medium text-foreground">
												{selectedCardTemplate.name}
											</p>
											<p>
												Độ hiếm: {selectedCardTemplate.rarity || "—"}
											</p>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Quick Stock Generator for SINGLE_CARD */}
						{form.productType === "SINGLE_CARD" && (
							<div className="space-y-1.5 p-4 rounded-lg border border-primary/20 bg-primary/5">
								<Label className="flex items-center gap-2 text-primary font-medium">
									<Package className="h-4 w-4" /> Số lượng nhập kho ban đầu
								</Label>
								<p className="text-xs text-muted-foreground mb-2">
									Hệ thống sẽ tự động tạo sẵn ngần này thẻ vật lý (không có NFC)
									để bán ngay trên cửa hàng. Bạn có thể gán NFC sau khi có đơn hàng.
								</p>
								<Input
									type="number"
									min={0}
									max={100}
									value={form.initialStock ?? ""}
									onChange={(e) =>
										setForm((f) => ({
											...f,
											initialStock: parseInt(e.target.value) || 0,
										}))
									}
									placeholder="VD: 50"
									className="w-[120px]"
								/>
							</div>
						)}

						{/* Name */}
						<div className="space-y-1.5">
							<Label>
								Tên sản phẩm{" "}
								{form.productType === "GACHA_PACK" ? (
									"(auto từ Category nếu để trống)"
								) : (
									<span className="text-red-400">*</span>
								)}
							</Label>
							<Input
								value={form.name ?? ""}
								onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
								placeholder="Tên hiển thị trong cửa hàng..."
							/>
						</div>

						{/* Description */}
						<div className="space-y-1.5">
							<Label>Mô tả</Label>
							<Textarea
								value={form.description ?? ""}
								onChange={(e) =>
									setForm((f) => ({ ...f, description: e.target.value }))
								}
								rows={2}
								placeholder="Mô tả ngắn..."
							/>
						</div>

						{/* Price */}
						<div className="space-y-1.5">
							<Label>
								Giá (VNĐ) <span className="text-red-400">*</span>
							</Label>
							<Input
								type="number"
								min="0"
								value={form.price ?? ""}
								onChange={(e) =>
									setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
								}
								placeholder="99000"
							/>
						</div>

						{/* Image URL */}
						<div className="space-y-1.5">
							<Label>
								URL Ảnh{" "}
								{form.productType === "GACHA_PACK"
									? "(auto từ Category nếu để trống)"
									: ""}
							</Label>
							<Input
								value={form.imageUrl ?? ""}
								onChange={(e) =>
									setForm((f) => ({ ...f, imageUrl: e.target.value }))
								}
								placeholder="https://example.com/image.png"
							/>
							{effectiveImage && (
								<Image
									src={effectiveImage}
									alt="preview"
									width={80}
									height={80}
									className="rounded-lg object-cover border border-border/30 mt-1"
								/>
							)}
						</div>

						{/* Toggles */}
						<div className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-card/30">
							<div className="flex items-center gap-3">
								<Switch
									id="pv"
									checked={form.isVisible ?? true}
									onCheckedChange={(v) => setForm((f) => ({ ...f, isVisible: v }))}
								/>
								<Label htmlFor="pv" className="cursor-pointer">
									Hiển thị trong cửa hàng (Visibility)
								</Label>
							</div>
							<div className="flex items-center gap-3">
								<Switch
									id="pa"
									checked={form.isActive ?? true}
									onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
								/>
								<Label htmlFor="pa" className="cursor-pointer">
									Kích hoạt sản phẩm (Active)
								</Label>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setModalOpen(false)}>
							Hủy
						</Button>
						<Button onClick={handleSubmit} disabled={submitting}>
							{submitting ? "Đang lưu..." : editTarget ? "Cập nhật" : "Tạo sản phẩm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirm */}
			<AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Vô hiệu hóa sản phẩm?</AlertDialogTitle>
						<AlertDialogDescription>
							Sản phẩm &quot;{deleteTarget?.name}&quot; sẽ bị ẩn khỏi cửa hàng (soft
							delete).
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

			{/* Product Active Confirm */}
			<AlertDialog open={!!activeTarget} onOpenChange={() => setActiveTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{activeTarget?.isActive ? "Vô hiệu hóa" : "Kích hoạt"} sản phẩm?</AlertDialogTitle>
						<AlertDialogDescription>
							Sản phẩm &quot;{activeTarget?.name}&quot; sẽ {activeTarget?.isActive ? "bị vô hiệu hóa khỏi hệ thống" : "được kích hoạt và có thể thao tác"}.
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

			{/* Product Visibility Confirm */}
			<AlertDialog open={!!visibilityTarget} onOpenChange={() => setVisibilityTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{visibilityTarget?.isVisible ? "Ẩn" : "Hiển thị"} sản phẩm?</AlertDialogTitle>
						<AlertDialogDescription>
							Sản phẩm &quot;{visibilityTarget?.name}&quot; sẽ {visibilityTarget?.isVisible ? "bị ẩn khỏi shop" : "được hiển thị trên shop"}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => visibilityTarget && handleToggleVisibility(visibilityTarget)}
						>
							Xác nhận
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* View Detail Modal */}
			<Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
				<DialogContent className="max-w-md bg-background border-border">
					<DialogHeader>
						<DialogTitle>Chi tiết Sản phẩm</DialogTitle>
					</DialogHeader>
					{viewTarget && (
						<div className="space-y-4 pt-4">
							<div className="flex items-center gap-4">
								<div className="h-20 w-20 rounded-lg border border-border/40 overflow-hidden bg-secondary/10 flex-shrink-0">
									{viewTarget.imageUrl ? (
										<Image
											src={viewTarget.imageUrl}
											alt={viewTarget.name}
											width={80}
											height={80}
											className="h-full w-full object-cover"
										/>
									) : (
										<Package className="h-full w-full p-4 text-muted-foreground" />
									)}
								</div>
								<div>
									<h3 className="font-semibold text-lg">{viewTarget.name}</h3>
									<p className="text-sm text-muted-foreground">ID: {viewTarget.productId}</p>
									<Badge
										className={
											viewTarget.productType === "GACHA_PACK"
												? "bg-purple-500/10 text-purple-400 border-purple-500/25 mt-1"
												: "bg-blue-500/10 text-blue-400 border-blue-500/25 mt-1"
										}
									>
										{viewTarget.productType === "GACHA_PACK" ? "🎲 Gacha Pack" : "🃏 Single Card"}
									</Badge>
								</div>
							</div>
							
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Giá bán</Label>
									<p className="font-medium text-primary">{formatCurrency(viewTarget.price)}</p>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Tồn kho</Label>
									<p className="font-medium">{viewTarget.stockCount ?? "—"} gói</p>
								</div>
							</div>

							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">Mô tả</Label>
								<div className="text-sm bg-secondary/20 p-3 rounded-md min-h-[60px]">
									{viewTarget.description || <span className="italic text-muted-foreground">Không có mô tả</span>}
								</div>
							</div>

							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">
									{viewTarget.productType === "GACHA_PACK" ? "Pack Category liên kết" : "Card Template liên kết"}
								</Label>
								<div className="text-sm border border-border bg-card p-2 rounded-md font-medium">
									{viewTarget.packCategory?.name ?? viewTarget.cardTemplate?.name ?? "—"}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 pt-2">
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">Trạng thái:</span>
									{viewTarget.isActive ? (
										<Badge variant="outline" className="text-green-400 border-green-400/20">Active</Badge>
									) : (
										<Badge variant="outline" className="text-muted-foreground border-muted">Inactive</Badge>
									)}
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">Hiển thị:</span>
									{viewTarget.isVisible ? (
										<Badge variant="outline" className="text-blue-400 border-blue-400/20">Visible</Badge>
									) : (
										<Badge variant="outline" className="text-muted-foreground border-muted">Hidden</Badge>
									)}
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setViewTarget(null)}>
							Đóng
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
