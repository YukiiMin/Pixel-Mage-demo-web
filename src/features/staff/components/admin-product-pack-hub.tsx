"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	PackCategoryRequest,
	ProductRequest,
	ProductType,
} from "@/features/staff/types/pack-category";
import type { PackStatus } from "@/types/commerce";

// ── Shared components ─────────────────────────────────────────────────────────
import { PackStatusBadge, PACK_STATUS_CONFIG, RarityBadge } from "./shared/pack-status-badge";
import {
	RarityEditor,
	SimpleStatCard,
	parseRarityRates,
	stringifyRarityRates,
	DEFAULT_RARITY_RATES,
} from "./shared";
import type { RarityRates } from "@/features/staff/types/pack-category";

import {
	Box,
	CheckCircle2,
	Clock,
	Eye,
	EyeOff,
	Layers,
	Package,
	PackagePlus,
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

const formatDateTime = (iso: string) => new Date(iso).toLocaleString("vi-VN");

// ─── Pack Item type ───────────────────────────────────────────────────────────
interface PackItem {
	packId: number;
	packCategory: { packCategoryId: number; name: string; imageUrl?: string };
	status: PackStatus;
	createdAt: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — PRODUCT MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════
function ProductManagementTab() {
	const [products, setProducts] = useState<AdminProduct[]>([]);
	const [packCategories, setPackCategories] = useState<PackCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<"ALL" | ProductType>("ALL");
	const [showInactive, setShowInactive] = useState(false);

	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<AdminProduct | null>(null);
	const [viewTarget, setViewTarget] = useState<AdminProduct | null>(null);
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
			const [pRes, cRes] = await Promise.all([
				fetch("/api/products"),
				fetch("/api/pack-categories"),
			]);
			const [pJson, cJson] = await Promise.all([pRes.json(), cRes.json()]);
			setProducts(pJson.data ?? []);
			setPackCategories(cJson.data ?? []);
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

	const selectedPackCat = packCategories.find(
		(c) => c.packCategoryId === form.packCategoryId
	);
	const effectiveImage = form.imageUrl || selectedPackCat?.imageUrl || "";

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
			await fetch(`/api/products/${p.productId}/active`, { method: "PATCH" });
			toast.success(p.isActive ? `"${p.name}" đã vô hiệu hóa` : `"${p.name}" đã kích hoạt`);
			fetchAll();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Toggle thất bại"));
		}
	};

	const handleToggleVisibility = async (p: AdminProduct) => {
		try {
			await fetch(`/api/products/${p.productId}/visibility`, { method: "PATCH" });
			toast.success(
				p.isVisible ? `"${p.name}" đã ẩn khỏi shop` : `"${p.name}" đã hiển thị trên shop`
			);
			fetchAll();
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
								: filtered.length === 0
									? (
										<TableRow>
											<TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
												<ShoppingBag className="mx-auto h-10 w-10 opacity-30 mb-2" />
												Không có sản phẩm nào
											</TableCell>
										</TableRow>
									)
									: filtered.map((p) => (
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
														{p.stockCount} gói
													</Badge>
												) : (
													<span className="text-muted-foreground text-xs">—</span>
												)}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleToggleVisibility(p)}
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
													onCheckedChange={() => handleToggleActive(p)}
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

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 — PACK MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════
function PackManagementTab() {
	return (
		<Tabs defaultValue="pack-list" className="space-y-4">
			<TabsList className="glass-card">
				<TabsTrigger value="pack-list">📦 Danh sách Pack</TabsTrigger>
				<TabsTrigger value="pack-category">⚙️ Pack Categories</TabsTrigger>
			</TabsList>
			<TabsContent value="pack-list">
				<PackListSection />
			</TabsContent>
			<TabsContent value="pack-category">
				<PackCategorySection />
			</TabsContent>
		</Tabs>
	);
}

// ─── Pack List Section ────────────────────────────────────────────────────────
function PackListSection() {
	const [packs, setPacks] = useState<PackItem[]>([]);
	const [categories, setCategories] = useState<PackCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"ALL" | PackStatus>("ALL");
	const [catFilter, setCatFilter] = useState("ALL");

	const [genModalOpen, setGenModalOpen] = useState(false);
	const [genCategoryId, setGenCategoryId] = useState<number | null>(null);
	const [genQuantity, setGenQuantity] = useState(10);
	const [generating, setGenerating] = useState(false);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [pRes, cRes] = await Promise.all([
				fetch("/api/packs"),
				fetch("/api/pack-categories"),
			]);
			const [pJson, cJson] = await Promise.all([pRes.json(), cRes.json()]);
			setPacks(pJson.data ?? []);
			setCategories(cJson.data ?? []);
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Không thể tải dữ liệu"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const filteredPacks = packs.filter((p) => {
		const ms =
			!search ||
			p.packCategory.name.toLowerCase().includes(search.toLowerCase()) ||
			p.packId.toString().includes(search);
		const mst = statusFilter === "ALL" || p.status === statusFilter;
		const mc =
			catFilter === "ALL" ||
			p.packCategory.packCategoryId.toString() === catFilter;
		return ms && mst && mc;
	});

	const selectedCat = categories.find((c) => c.packCategoryId === genCategoryId);

	const handleGenerate = async () => {
		if (!genCategoryId) {
			toast.error("Vui lòng chọn Pack Category");
			return;
		}
		if (genQuantity <= 0 || genQuantity > 500) {
			toast.error("Số lượng phải từ 1 đến 500");
			return;
		}
		setGenerating(true);
		try {
			const res = await fetch(
				`/api/packs/generate?packCategoryId=${genCategoryId}&quantity=${genQuantity}`,
				{ method: "POST" }
			);
			if (!res.ok) {
				const e = await res.json();
				throw new Error(e.message ?? "Lỗi");
			}
			const json = await res.json();
			const count = Array.isArray(json.data) ? json.data.length : genQuantity;
			toast.success(`✨ Đã generate thành công ${count} pack!`);
			setGenModalOpen(false);
			setGenCategoryId(null);
			setGenQuantity(10);
			fetchData();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Generate thất bại"));
		} finally {
			setGenerating(false);
		}
	};

	const packStats = [
		{ label: "Tổng Pack", value: packs.length, icon: Package, iconColor: "text-muted-foreground", iconBgColor: "bg-card/40" },
		{ label: "Trong kho", value: packs.filter((p) => p.status === "STOCKED").length, icon: Box, iconColor: "text-blue-400", iconBgColor: "bg-blue-500/10", valueColor: "text-blue-400" },
		{ label: "Đã đặt", value: packs.filter((p) => p.status === "RESERVED").length, icon: Clock, iconColor: "text-yellow-400", iconBgColor: "bg-yellow-500/10", valueColor: "text-yellow-400" },
		{ label: "Đã bán", value: packs.filter((p) => p.status === "SOLD").length, icon: CheckCircle2, iconColor: "text-green-400", iconBgColor: "bg-green-500/10", valueColor: "text-green-400" },
	];

	return (
		<div className="space-y-5">
			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{packStats.map((s) => (
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
								placeholder="Tìm Pack ID hoặc tên Category..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={catFilter} onValueChange={setCatFilter}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Tất cả Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">Tất cả Category</SelectItem>
								{categories.map((c) => (
									<SelectItem
										key={c.packCategoryId}
										value={c.packCategoryId.toString()}
									>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={statusFilter}
							onValueChange={(v: "ALL" | PackStatus) => setStatusFilter(v)}
						>
							<SelectTrigger className="w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">Tất cả</SelectItem>
								<SelectItem value="STOCKED">Trong kho</SelectItem>
								<SelectItem value="RESERVED">Đã đặt</SelectItem>
								<SelectItem value="SOLD">Đã bán</SelectItem>
							</SelectContent>
						</Select>
						<Button
							onClick={() => setGenModalOpen(true)}
							className="bg-primary hover:bg-primary/90"
						>
							<Zap className="h-4 w-4 mr-2" /> Generate Pack
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={fetchData}
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
				<CardHeader className="pb-3">
					<CardTitle className="text-base">
						Danh sách Pack ({filteredPacks.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Pack ID</TableHead>
								<TableHead>Pack Category</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead>Ngày tạo</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading
								? Array.from({ length: 8 }).map((_, i) => (
										<TableRow key={i}>
											{Array.from({ length: 4 }).map((__, j) => (
												<TableCell key={j}>
													<div className="h-4 w-24 bg-muted rounded animate-pulse" />
												</TableCell>
											))}
										</TableRow>
									))
								: filteredPacks.length === 0
									? (
										<TableRow>
											<TableCell
												colSpan={4}
												className="text-center py-12 text-muted-foreground"
											>
												<Package className="mx-auto h-10 w-10 opacity-30 mb-2" />
												Không có Pack nào
											</TableCell>
										</TableRow>
									)
									: filteredPacks.map((pack) => (
										<TableRow key={pack.packId} className="hover:bg-card/40">
											<TableCell>
												<Badge variant="outline">#{pack.packId}</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{pack.packCategory.imageUrl ? (
														<Image
															src={pack.packCategory.imageUrl}
															alt={pack.packCategory.name}
															width={32}
															height={32}
															className="h-8 w-8 rounded object-cover"
														/>
													) : (
														<PackagePlus className="h-8 w-8 p-1 text-muted-foreground" />
													)}
													<span className="font-medium text-sm">
														{pack.packCategory.name}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<PackStatusBadge status={pack.status} />
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{formatDateTime(pack.createdAt)}
											</TableCell>
										</TableRow>
									))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Generate Modal */}
			<Dialog open={genModalOpen} onOpenChange={setGenModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5 text-primary" /> Auto-Generate Packs
						</DialogTitle>
						<DialogDescription>
							Hệ thống sẽ tự động RNG card templates theo tỷ lệ rarity. Các pack sẽ
							có trạng thái <strong>STOCKED</strong>.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label>
								Pack Category <span className="text-red-400">*</span>
							</Label>
							<Select
								value={genCategoryId?.toString() ?? ""}
								onValueChange={(v) => setGenCategoryId(parseInt(v))}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn loại Pack để generate..." />
								</SelectTrigger>
								<SelectContent>
									{categories
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
						</div>
						{selectedCat && (
							<div className="p-3 rounded-lg border border-border/40 bg-card/30 space-y-2">
								<p className="text-sm font-medium">{selectedCat.name}</p>
								<div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
									<span>📦 {selectedCat.cardsPerPack} bài/gói</span>
									{(() => {
										try {
											const rates = JSON.parse(selectedCat.rarityRates) as Record<
												string,
												number
											>;
											return Object.entries(rates).map(([k, v]) => (
												<span key={k}>
													{k}: {v}%
												</span>
											));
										} catch {
											return null;
										}
									})()}
								</div>
								{(!selectedCat.cardPools || selectedCat.cardPools.length === 0) && (
									<p className="text-xs text-yellow-400">
										⚠️ Chưa có Card Pool — generate có thể thất bại
									</p>
								)}
							</div>
						)}
						<div className="space-y-1.5">
							<Label>
								Số lượng Pack (1–500) <span className="text-red-400">*</span>
							</Label>
							<Input
								type="number"
								min="1"
								max="500"
								value={genQuantity}
								onChange={(e) => setGenQuantity(parseInt(e.target.value) || 1)}
							/>
							<p className="text-xs text-muted-foreground">
								Tổng thẻ sẽ tạo:{" "}
								<strong>{(selectedCat?.cardsPerPack ?? 5) * genQuantity}</strong>{" "}
								PackDetail records
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setGenModalOpen(false)}>
							Hủy
						</Button>
						<Button
							onClick={handleGenerate}
							disabled={generating || !genCategoryId}
							className="bg-primary hover:bg-primary/90"
						>
							{generating ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									Đang generate...
								</>
							) : (
								<>
									<Zap className="h-4 w-4 mr-2" />
									Generate {genQuantity} Pack
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

// ─── Pack Category Section ────────────────────────────────────────────────────
function PackCategorySection() {
	const [categories, setCategories] = useState<PackCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [showInactive, setShowInactive] = useState(false);

	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<PackCategory | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<PackCategory | null>(null);
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

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const filtered = categories.filter((c) => {
		const ms = !search || c.name.toLowerCase().includes(search.toLowerCase());
		const ma = showInactive || c.isActive;
		return ms && ma;
	});

	const openCreate = () => {
		setEditTarget(null);
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
															{Object.entries(rates).map(([rarity, rate]) => (
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
															onClick={() => handleToggleActive(cat)}
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
		</div>
	);
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT — Main Hub
// ═════════════════════════════════════════════════════════════════════════════
export function AdminProductPackHub() {
	return (
		<div className="space-y-6">
			<div>
				<h1
					className="text-3xl font-bold text-foreground"
					style={{ fontFamily: "Fruktur, var(--font-heading)" }}
				>
					Quản Lý Sản Phẩm & Pack
				</h1>
				<p className="text-muted-foreground mt-1">
					Quản lý toàn bộ sản phẩm kinh doanh — Gacha Pack & Single Card, và quản lý
					kho Pack vật lý
				</p>
			</div>

			<Tabs defaultValue="products" className="space-y-4">
				<TabsList className="glass-card">
					<TabsTrigger value="products">🛒 Sản Phẩm (Product)</TabsTrigger>
					<TabsTrigger value="packs">📦 Pack Management</TabsTrigger>
				</TabsList>

				<TabsContent value="products">
					<ProductManagementTab />
				</TabsContent>

				<TabsContent value="packs">
					<PackManagementTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
