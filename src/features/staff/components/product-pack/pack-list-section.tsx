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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/types/api";
import type { PackCategory } from "@/features/staff/types/pack-category";
import type { PackStatus } from "@/types/commerce";

// shared
import { PackStatusBadge } from "../shared/pack-status-badge";
import { SimpleStatCard } from "../shared";

import {
	Box,
	CheckCircle2,
	Clock,
	Package,
	PackagePlus,
	RefreshCw,
	Search,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDateTime = (iso: string) => new Date(iso).toLocaleString("vi-VN");

// ─── Pack Item type ───────────────────────────────────────────────────────────
interface PackItem {
	packId: number;
	packCategoryId: number;
	packCategoryName: string;
	packCategoryImageUrl?: string;
	status: PackStatus;
	createdAt: string;
}

export function PackListSection() {
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
			p.packCategoryName?.toLowerCase().includes(search.toLowerCase()) ||
			p.packId.toString().includes(search);
		const mst = statusFilter === "ALL" || p.status === statusFilter;
		const mc =
			catFilter === "ALL" ||
			p.packCategoryId?.toString() === catFilter;
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
													{pack.packCategoryImageUrl ? (
														<Image
															src={pack.packCategoryImageUrl}
															alt={pack.packCategoryName}
															width={32}
															height={32}
															className="h-8 w-8 rounded object-cover"
														/>
													) : (
														<PackagePlus className="h-8 w-8 p-1 text-muted-foreground" />
													)}
													<span className="font-medium text-sm">
														{pack.packCategoryName}
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
