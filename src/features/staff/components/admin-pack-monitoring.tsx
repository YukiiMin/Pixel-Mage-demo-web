"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import type { PackStatus, Rarity } from "@/types/commerce";
import type {
	CardStatus,
	Pack,
	PackMonitoringStats,
} from "@/features/staff/types/pack-monitoring";
import {
	Barcode,
	Box,
	CheckCircle2,
	Clock,
	Eye,
	Package,
	PackageOpen,
	RefreshCw,
	Search,
	ShoppingCart,
	Smartphone,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PackStatusBadge, CardStatusBadge, RarityBadge } from "./shared/pack-status-badge";
import { SimpleStatCard } from "./shared/stats-card";

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export function AdminPackMonitoring() {
	const [packs, setPacks] = useState<Pack[]>([]);
	const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<PackMonitoringStats | null>(null);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"ALL" | "STOCKED" | "RESERVED" | "SOLD"
	>("ALL");
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	const fetchPacks = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/packs");
			const json = await res.json();
			if (!res.ok) {
				throw new Error(json.message || "Failed to fetch packs");
			}

			const realPacks: Pack[] = (json.data || []).map((p: any) => ({
				packId: p.packId,
				product: {
					productId: p.packCategoryId,
					name: p.packCategoryName || `Pack ${p.packId}`,
					description: "",
					price: 0,
					imageUrl: p.packCategoryImageUrl,
				},
				status: p.status,
				createdBy: {
					accountId: p.createdByAccountId,
					name: p.createdByAccountId ? `Admin #${p.createdByAccountId}` : "System",
					email: "",
				},
				createdAt: p.createdAt || new Date().toISOString(),
				packDetails: (p.packDetails || []).map((pd: any, j: number) => ({
					packDetailId: j,
					positionIndex: pd.positionIndex,
					card: {
						cardId: pd.cardId || -1,
						nfcUid: pd.nfcUid || "N/A",
						softwareUuid: "",
						status: pd.cardStatus || "READY",
						serialNumber: pd.cardId ? `SN${String(pd.cardId).padStart(6, "0")}` : "",
						productionBatch: "",
						cardCondition: "NEW",
						cardTemplate: {
							cardTemplateId: 0,
							name: pd.cardName || "Unknown Card",
							rarity: pd.rarity || "COMMON",
							imagePath: pd.imagePath || "",
						},
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				})),
				order: undefined,
			}));

			setPacks(realPacks);
			setTotalPages(Math.ceil(realPacks.length / 20) || 1);

			const newStats: PackMonitoringStats = {
				totalPacks: realPacks.length,
				stockedPacks: realPacks.filter((p) => p.status === "STOCKED").length,
				reservedPacks: realPacks.filter((p) => p.status === "RESERVED").length,
				soldPacks: realPacks.filter((p) => p.status === "SOLD").length,
				totalCards: realPacks.reduce((acc, p) => acc + p.packDetails.length, 0),
				linkedCards: realPacks.reduce(
					(acc, p) => acc + p.packDetails.filter((pd) => pd.card.status === "LINKED").length,
					0,
				),
				pendingCards: realPacks.reduce(
					(acc, p) => acc + p.packDetails.filter((pd) => pd.card.status === "READY").length,
					0,
				),
				soldCards: realPacks.reduce(
					(acc, p) => acc + p.packDetails.filter((pd) => pd.card.status === "SOLD").length,
					0,
				),
			};
			setStats(newStats);
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Không thể tải dữ liệu Pack"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPacks();
	}, [fetchPacks]);

	const filteredPacks = packs.filter((pack) => {
		const matchesSearch =
			!search ||
			pack.product.name.toLowerCase().includes(search.toLowerCase()) ||
			pack.packId.toString().includes(search);
		const matchesStatus =
			statusFilter === "ALL" || pack.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	// Shared UI components handle status and rarity colors.
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("vi-VN");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1
						className="text-3xl font-bold text-foreground"
						style={{ fontFamily: "Fruktur, var(--font-heading)" }}
					>
						Pack Monitoring
					</h1>
					<p className="text-muted-foreground">
						Giám sát toàn bộ luồng Pack từ kho đến khách hàng
					</p>
				</div>
				<Button onClick={fetchPacks} disabled={loading}>
					<RefreshCw
						className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
					/>
					Làm mới
				</Button>
			</div>

			{/* Stats Cards */}
			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<SimpleStatCard
						label="Tổng Pack"
						value={stats.totalPacks}
						icon={Package}
						iconColor="text-blue-400"
						iconBgColor="bg-blue-500/10"
					/>
					<SimpleStatCard
						label="Trong kho"
						value={stats.stockedPacks}
						icon={Box}
						iconColor="text-blue-400"
						iconBgColor="bg-blue-500/10"
						valueColor="text-blue-400"
					/>
					<SimpleStatCard
						label="Đã đặt"
						value={stats.reservedPacks}
						icon={Clock}
						iconColor="text-yellow-400"
						iconBgColor="bg-yellow-500/10"
						valueColor="text-yellow-400"
					/>
					<SimpleStatCard
						label="Đã bán"
						value={stats.soldPacks}
						icon={CheckCircle2}
						iconColor="text-green-400"
						iconBgColor="bg-green-500/10"
						valueColor="text-green-400"
					/>
				</div>
			)}

			{/* Card Stats */}
			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<SimpleStatCard
						label="Thẻ đã liên kết"
						value={stats.linkedCards}
						icon={Zap}
						iconColor="text-green-400"
						iconBgColor="bg-green-500/10"
						valueColor="text-green-400"
					/>
					<SimpleStatCard
						label="Thẻ sẵn sàng"
						value={stats.pendingCards}
						icon={PackageOpen}
						iconColor="text-blue-400"
						iconBgColor="bg-blue-500/10"
						valueColor="text-blue-400"
					/>
					<SimpleStatCard
						label="Thẻ đã bán"
						value={stats.soldCards}
						icon={ShoppingCart}
						iconColor="text-yellow-400"
						iconBgColor="bg-yellow-500/10"
						valueColor="text-yellow-400"
					/>
				</div>
			)}

			{/* Filters */}
			<Card className="glass-card">
				<CardContent className="p-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Tìm theo tên Pack hoặc ID..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="flex gap-2">
							<Select
								value={statusFilter}
								onValueChange={(value: any) => setStatusFilter(value)}
							>
								<SelectTrigger className="w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">Tất cả</SelectItem>
									<SelectItem value="STOCKED">Trong kho</SelectItem>
									<SelectItem value="RESERVED">Đã đặt</SelectItem>
									<SelectItem value="SOLD">Đã bán</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Packs Table */}
			<Card className="glass-card">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Pack</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead>Thẻ</TableHead>
								<TableHead>Khách hàng</TableHead>
								<TableHead>Ngày tạo</TableHead>
								<TableHead className="text-right">Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								Array.from({ length: 10 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<div className="h-8 w-8 bg-muted rounded animate-pulse" />
										</TableCell>
										<TableCell>
											<div className="h-4 w-20 bg-muted rounded animate-pulse" />
										</TableCell>
										<TableCell>
											<div className="h-4 w-16 bg-muted rounded animate-pulse" />
										</TableCell>
										<TableCell>
											<div className="h-4 w-24 bg-muted rounded animate-pulse" />
										</TableCell>
										<TableCell>
											<div className="h-4 w-24 bg-muted rounded animate-pulse" />
										</TableCell>
										<TableCell className="text-right">
											<div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" />
										</TableCell>
									</TableRow>
								))
							) : filteredPacks.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-8 text-muted-foreground"
									>
										<Package className="mx-auto h-10 w-10 opacity-30 mb-2" />
										Không tìm thấy Pack nào
									</TableCell>
								</TableRow>
							) : (
								filteredPacks.map((pack) => (
									<TableRow key={pack.packId} className="hover:bg-card/40">
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="h-12 w-16 rounded border border-border/40 overflow-hidden bg-secondary/10">
													{pack.product.imageUrl ? (
														<Image
															src={pack.product.imageUrl}
															alt={pack.product.name}
															width={64}
															height={48}
															className="h-full w-full object-cover"
														/>
													) : (
														<Package className="h-full w-full p-2 text-muted-foreground" />
													)}
												</div>
												<div>
													<p className="font-medium">{pack.product.name}</p>
													<p className="text-sm text-muted-foreground">
														#{pack.packId}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<PackStatusBadge status={pack.status} />
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<div className="flex gap-1">
													{pack.packDetails.slice(0, 3).map((pd) => (
														<RarityBadge
															key={pd.packDetailId}
															rarity={pd.card.cardTemplate.rarity}
															short
														/>
													))}
													{pack.packDetails.length > 3 && (
														<Badge variant="outline" className="text-xs">
															+{pack.packDetails.length - 3}
														</Badge>
													)}
												</div>
												<p className="text-muted-foreground mt-1">
													{
														pack.packDetails.filter(
															(pd) => pd.card.status === "LINKED",
														).length
													}{" "}
													đã liên kết
												</p>
											</div>
										</TableCell>
										<TableCell>
											{pack.order ? (
												<div className="text-sm">
													<p className="font-medium">
														{pack.order.customer.name}
													</p>
													<p className="text-muted-foreground">
														{pack.order.customer.email}
													</p>
												</div>
											) : (
												<span className="text-muted-foreground">—</span>
											)}
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<p>{formatDate(pack.createdAt)}</p>
												<p className="text-muted-foreground">
													by {pack.createdBy.name}
												</p>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setSelectedPack(pack)}
											>
												<Eye className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Pack Detail Dialog */}
			<Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
				<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3">
							<Package className="h-5 w-5" />
							Chi tiết Pack #{selectedPack?.packId}
						</DialogTitle>
					</DialogHeader>

					{selectedPack && (
						<div className="space-y-6">
							{/* Pack Info */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Thông tin Pack</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex items-center gap-4">
											<div className="h-20 w-24 rounded border border-border/40 overflow-hidden bg-secondary/10">
												{selectedPack.product.imageUrl ? (
													<Image
														src={selectedPack.product.imageUrl}
														alt={selectedPack.product.name}
														width={96}
														height={80}
														className="h-full w-full object-cover"
													/>
												) : (
													<Package className="h-full w-full p-4 text-muted-foreground" />
												)}
											</div>
											<div>
												<h3 className="font-bold text-lg">
													{selectedPack.product.name}
												</h3>
												<p className="text-2xl font-bold text-primary">
													{formatCurrency(selectedPack.product.price)}
												</p>
												<PackStatusBadge status={selectedPack.status} />
											</div>
										</div>
										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Ngày tạo:</span>
												<span>{formatDate(selectedPack.createdAt)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													Người tạo:
												</span>
												<span>{selectedPack.createdBy.name}</span>
											</div>
											{selectedPack.order && (
												<>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Đơn hàng:
														</span>
														<span>#{selectedPack.order.orderId}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Khách hàng:
														</span>
														<span>{selectedPack.order.customer.name}</span>
													</div>
												</>
											)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Thống kê thẻ</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="text-center p-3 bg-muted/30 rounded-lg">
												<p className="text-2xl font-bold">
													{selectedPack.packDetails.length}
												</p>
												<p className="text-sm text-muted-foreground">
													Tổng thẻ
												</p>
											</div>
											<div className="text-center p-3 bg-green-500/10 rounded-lg">
												<p className="text-2xl font-bold text-green-400">
													{
														selectedPack.packDetails.filter(
															(pd) => pd.card.status === "LINKED",
														).length
													}
												</p>
												<p className="text-sm text-muted-foreground">
													Đã liên kết
												</p>
											</div>
										</div>
										<div className="space-y-2">
											{["LEGENDARY", "RARE", "COMMON"].map((rarity) => {
												const count = selectedPack.packDetails.filter(
													(pd) => pd.card.cardTemplate.rarity === rarity,
												).length;
												if (count === 0) return null;
												return (
													<div
														key={rarity}
														className="flex items-center justify-between"
													>
														<RarityBadge rarity={rarity} />
														<span className="font-medium">{count} thẻ</span>
													</div>
												);
											})}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Cards Table */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Chi tiết thẻ trong Pack
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Vị trí</TableHead>
												<TableHead>Thẻ</TableHead>
												<TableHead>Loại</TableHead>
												<TableHead>Trạng thái</TableHead>
												<TableHead>NFC UID</TableHead>
												<TableHead>Serial</TableHead>
												<TableHead>Chủ sở hữu</TableHead>
												<TableHead>Ngày liên kết</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{selectedPack.packDetails.map((packDetail) => (
												<TableRow key={packDetail.packDetailId}>
													<TableCell>
														<Badge variant="outline">
															#{packDetail.positionIndex}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-3">
															<div className="h-12 w-8 rounded border border-border/40 overflow-hidden bg-secondary/10">
																{packDetail.card.cardTemplate.imagePath ? (
																	<Image
																		src={packDetail.card.cardTemplate.imagePath}
																		alt={packDetail.card.cardTemplate.name}
																		width={32}
																		height={48}
																		className="h-full w-full object-cover"
																	/>
																) : (
																	<Barcode className="h-full w-full p-1 text-muted-foreground" />
																)}
															</div>
															<div>
																<p className="font-medium text-sm">
																	{packDetail.card.cardTemplate.name}
																</p>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<RarityBadge rarity={packDetail.card.cardTemplate.rarity} />
													</TableCell>
													<TableCell>
														<CardStatusBadge status={packDetail.card.status} />
													</TableCell>
													<TableCell>
														<code className="text-xs bg-muted px-2 py-1 rounded">
															{packDetail.card.nfcUid}
														</code>
													</TableCell>
													<TableCell>
														<span className="text-sm font-mono">
															{packDetail.card.serialNumber || "—"}
														</span>
													</TableCell>
													<TableCell>
														{packDetail.card.owner ? (
															<div className="text-sm">
																<p className="font-medium">
																	{packDetail.card.owner.name}
																</p>
																<p className="text-muted-foreground">
																	{packDetail.card.owner.email}
																</p>
															</div>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
													<TableCell>
														{packDetail.card.linkedAt ? (
															<span className="text-sm">
																{formatDate(packDetail.card.linkedAt)}
															</span>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
