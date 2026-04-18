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
	PackCategory,
	PackCategoryRequest,
	RarityRates,
} from "@/features/staff/types/pack-category";
import {
	Eye,
	EyeOff,
	Layers,
	PackagePlus,
	Pencil,
	Plus,
	RefreshCw,
	Search,
	Trash2,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const DEFAULT_RARITY: RarityRates = { COMMON: 60, RARE: 30, LEGENDARY: 10 };

function parseRarityRates(json: string): RarityRates {
	try {
		return JSON.parse(json) as RarityRates;
	} catch {
		return DEFAULT_RARITY;
	}
}

function stringifyRarity(rates: RarityRates): string {
	return JSON.stringify(rates);
}

// ─────────────────────────────────────────────
// Rarity Editor sub-component
// ─────────────────────────────────────────────
function RarityEditor({
	value,
	onChange,
}: {
	value: RarityRates;
	onChange: (rates: RarityRates) => void;
}) {
	const total = Object.values(value).reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
	const isValid = total === 100;

	const update = (key: string, num: number) => {
		onChange({ ...value, [key]: Number.isNaN(num) ? 0 : num });
	};

	return (
		<div className="space-y-3">
			{Object.entries(value).map(([rarity, rate]) => (
				<div key={rarity} className="flex items-center gap-3">
					<Badge
						className={
							rarity === "LEGENDARY"
								? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 w-24 justify-center text-xs"
								: rarity === "RARE"
									? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30 w-24 justify-center text-xs"
									: "bg-gray-500/10 text-gray-400 border-gray-500/30 w-24 justify-center text-xs"
						}
					>
						{rarity}
					</Badge>
					<Input
						type="number"
						min="0"
						max="100"
						value={rate ?? 0}
						onChange={(e) => update(rarity, Number.parseInt(e.target.value))}
						className="w-24"
					/>
					<span className="text-muted-foreground text-sm">%</span>
				</div>
			))}
			<div
				className={`text-sm font-medium ${isValid ? "text-green-400" : "text-red-400"}`}
			>
				Tổng: {total}% {isValid ? "✓" : `— cần đủ 100%`}
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function AdminPackCategoriesPage() {
	const [categories, setCategories] = useState<PackCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [showInactive, setShowInactive] = useState(false);

	// Modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<PackCategory | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<PackCategory | null>(null);
	const [submitting, setSubmitting] = useState(false);

	// Form state
	const [form, setForm] = useState<PackCategoryRequest>({
		name: "",
		description: "",
		imageUrl: "",
		cardsPerPack: 5,
		rarityRates: stringifyRarity(DEFAULT_RARITY),
		isActive: true,
		cardTemplateIds: [],
	});
	const [rarityObj, setRarityObj] = useState<RarityRates>(DEFAULT_RARITY);

	// ── Fetch ────────────────────────────────────────────────────────────────
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

	// ── Filtered List ─────────────────────────────────────────────────────────
	const filtered = categories.filter((c) => {
		const matchSearch =
			!search || c.name.toLowerCase().includes(search.toLowerCase());
		const matchActive = showInactive || c.isActive;
		return matchSearch && matchActive;
	});

	// ── Open Modal ────────────────────────────────────────────────────────────
	const openCreate = () => {
		setEditTarget(null);
		const defaultRarity = DEFAULT_RARITY;
		setRarityObj(defaultRarity);
		setForm({
			name: "",
			description: "",
			imageUrl: "",
			cardsPerPack: 5,
			rarityRates: stringifyRarity(defaultRarity),
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

	// ── Form handlers ─────────────────────────────────────────────────────────
	const handleRarityChange = (rates: RarityRates) => {
		setRarityObj(rates);
		setForm((f) => ({ ...f, rarityRates: stringifyRarity(rates) }));
	};

	// ── Submit ────────────────────────────────────────────────────────────────
	const handleSubmit = async () => {
		if (!form.name.trim()) {
			toast.error("Tên Pack Category không được để trống");
			return;
		}
		const total = Object.values(rarityObj).reduce(
			(a, b) => (a ?? 0) + (b ?? 0),
			0,
		);
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
			const method = editTarget ? "PUT" : "POST";
			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message ?? "Lỗi không xác định");
			}
			toast.success(
				editTarget ? "Cập nhật thành công!" : "Tạo Pack Category thành công!",
			);
			setModalOpen(false);
			fetchCategories();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Lưu thất bại"));
		} finally {
			setSubmitting(false);
		}
	};

	// ── Toggle Active ─────────────────────────────────────────────────────────
	const handleToggleActive = async (cat: PackCategory) => {
		try {
			const res = await fetch(
				`/api/pack-categories/${cat.packCategoryId}/toggle-active`,
				{ method: "PUT" },
			);
			if (!res.ok) throw new Error("Toggle failed");
			toast.success(
				cat.isActive
					? `"${cat.name}" đã bị vô hiệu hóa`
					: `"${cat.name}" đã được kích hoạt`,
			);
			fetchCategories();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Toggle thất bại"));
		}
	};

	// ── Delete (Soft) ─────────────────────────────────────────────────────────
	const handleDelete = async (cat: PackCategory) => {
		try {
			const res = await fetch(
				`/api/pack-categories/${cat.packCategoryId}`,
				{ method: "DELETE" },
			);
			if (!res.ok) throw new Error("Delete failed");
			toast.success(`Đã vô hiệu hóa "${cat.name}"`);
			setDeleteTarget(null);
			fetchCategories();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Xóa thất bại"));
		}
	};

	// ─────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1
						className="text-3xl font-bold text-foreground"
						style={{ fontFamily: "Fruktur, var(--font-heading)" }}
					>
						Pack Categories
					</h1>
					<p className="text-muted-foreground mt-1">
						Quản lý loại Pack — cấu hình tỷ lệ Gacha & Card Pool
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={fetchCategories} disabled={loading}>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Làm mới
					</Button>
					<Button onClick={openCreate}>
						<Plus className="h-4 w-4 mr-2" />
						Tạo mới
					</Button>
				</div>
			</div>

			{/* Filters */}
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
							<Switch
								checked={showInactive}
								onCheckedChange={setShowInactive}
							/>
							Hiển thị đã vô hiệu hóa
						</label>
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
							{loading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										{Array.from({ length: 5 }).map((__, j) => (
											<TableCell key={j}>
												<div className="h-4 w-24 bg-muted rounded animate-pulse" />
											</TableCell>
										))}
									</TableRow>
								))
							) : filtered.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-12 text-muted-foreground"
									>
										<Layers className="mx-auto h-10 w-10 opacity-30 mb-2" />
										Không có Pack Category nào
									</TableCell>
								</TableRow>
							) : (
								filtered.map((cat) => {
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
														<span className="font-medium">
															{cat.cardsPerPack}
														</span>
													</div>
													<div className="flex gap-1 flex-wrap">
														{Object.entries(rates).map(([rarity, rate]) => (
															<Badge
																key={rarity}
																variant="outline"
																className="text-xs"
															>
																{rarity[0]}:{rate}%
															</Badge>
														))}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{cat.cardPools && cat.cardPools.length > 0 ? (
														<span className="text-green-400">
															{cat.cardPools.length} templates
														</span>
													) : (
														<span className="text-yellow-400">Chưa cấu hình</span>
													)}
												</div>
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
															<Eye className="h-4 w-4" />
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
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Create / Edit Modal */}
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
						{/* Name */}
						<div className="space-y-1.5">
							<Label htmlFor="pc-name">
								Tên Pack Category <span className="text-red-400">*</span>
							</Label>
							<Input
								id="pc-name"
								value={form.name}
								onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
								placeholder="Ví dụ: Premium Mystic Pack"
							/>
						</div>

						{/* Description */}
						<div className="space-y-1.5">
							<Label htmlFor="pc-desc">Mô tả</Label>
							<Textarea
								id="pc-desc"
								value={form.description}
								onChange={(e) =>
									setForm((f) => ({ ...f, description: e.target.value }))
								}
								placeholder="Mô tả ngắn về loại pack này..."
								rows={3}
							/>
						</div>

						{/* Image URL */}
						<div className="space-y-1.5">
							<Label htmlFor="pc-img">URL Ảnh đại diện</Label>
							<Input
								id="pc-img"
								value={form.imageUrl}
								onChange={(e) =>
									setForm((f) => ({ ...f, imageUrl: e.target.value }))
								}
								placeholder="https://example.com/image.png"
							/>
						</div>

						{/* Cards per pack */}
						<div className="space-y-1.5">
							<Label htmlFor="pc-cpp">
								Số bài/gói <span className="text-red-400">*</span>
							</Label>
							<Input
								id="pc-cpp"
								type="number"
								min="1"
								max="20"
								value={form.cardsPerPack}
								onChange={(e) =>
									setForm((f) => ({
										...f,
										cardsPerPack: Number.parseInt(e.target.value) || 1,
									}))
								}
							/>
						</div>

						{/* Rarity Rates */}
						<div className="space-y-2">
							<Label>
								Tỷ lệ Rarity (tổng phải = 100%){" "}
								<span className="text-red-400">*</span>
							</Label>
							<div className="p-4 rounded-lg border border-border/40 bg-card/30">
								<RarityEditor value={rarityObj} onChange={handleRarityChange} />
							</div>
						</div>

						{/* Active */}
						<div className="flex items-center gap-3">
							<Switch
								id="pc-active"
								checked={form.isActive ?? true}
								onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
							/>
							<Label htmlFor="pc-active">Kích hoạt ngay sau khi lưu</Label>
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
			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={() => setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Vô hiệu hóa Pack Category?</AlertDialogTitle>
						<AlertDialogDescription>
							Pack Category &quot;{deleteTarget?.name}&quot; sẽ bị đặt thành
							không hoạt động (soft delete). Dữ liệu Pack đã tạo trước đó không
							bị xóa.
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
