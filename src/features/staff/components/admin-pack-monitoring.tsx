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
			// TODO: Implement actual API calls
			// Mock data for demonstration
			const mockPacks: Pack[] = Array.from({ length: 50 }, (_, i) => ({
				packId: i + 1,
				product: {
					productId: (i % 3) + 1,
					name: [
						"PixelMage Standard Pack",
						"Major Sealed Box",
						"PixelMage Blister Promo",
					][i % 3],
					description: "Standard pack with 5 random cards",
					price: [99000, 299000, 49000][i % 3],
					imageUrl: `/api/placeholder/200/150?text=Pack${(i % 3) + 1}`,
				},
				status: ["STOCKED", "RESERVED", "SOLD"][i % 3] as PackStatus,
				createdBy: {
					accountId: 1,
					name: "Warehouse Staff",
					email: "staff@pixelmage.com",
				},
				createdAt: new Date(
					Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
				).toISOString(),
				packDetails: Array.from({ length: 5 }, (_, j) => ({
					packDetailId: j + 1,
					positionIndex: j + 1,
					card: {
						cardId: i * 5 + j + 1,
						nfcUid: `nfc_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
						softwareUuid: `uuid_${Math.random().toString(36).substr(2, 8)}`,
						status: j < 2 ? "LINKED" : j < 4 ? "SOLD" : ("READY" as CardStatus),
						serialNumber: `SN${String(Math.floor(Math.random() * 100000)).padStart(6, "0")}`,
						productionBatch: `BATCH${String(Math.floor(Math.random() * 100)).padStart(3, "0")}`,
						cardCondition: "NEW",
						cardTemplate: {
							cardTemplateId: Math.floor(Math.random() * 20) + 1,
							name: `Mystic Card #${Math.floor(Math.random() * 100)}`,
							rarity: ["COMMON", "RARE", "LEGENDARY"][j % 3] as Rarity,
							imagePath: `/api/placeholder/100/150?text=Card${Math.floor(Math.random() * 100)}`,
						},
						owner:
							j < 2
								? {
										accountId: Math.floor(Math.random() * 100) + 1,
										name: `Customer ${Math.floor(Math.random() * 100) + 1}`,
										email: `customer${Math.floor(Math.random() * 100) + 1}@example.com`,
									}
								: undefined,
						linkedAt:
							j < 2
								? new Date(
										Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
									).toISOString()
								: undefined,
						soldAt:
							j < 4
								? new Date(
										Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
									).toISOString()
								: undefined,
						createdAt: new Date(
							Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
						).toISOString(),
						updatedAt: new Date(
							Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
						).toISOString(),
					},
				})),
				order: ["RESERVED", "SOLD"].includes(
					["STOCKED", "RESERVED", "SOLD"][i % 3],
				)
					? {
							orderId: i + 1,
							customer: {
								accountId: Math.floor(Math.random() * 100) + 1,
								name: `Customer ${Math.floor(Math.random() * 100) + 1}`,
								email: `customer${Math.floor(Math.random() * 100) + 1}@example.com`,
							},
							orderDate: new Date(
								Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
							).toISOString(),
						}
					: undefined,
			}));

			setPacks(mockPacks);
			setTotalPages(Math.ceil(mockPacks.length / 20));

			// Calculate stats
			const mockStats: PackMonitoringStats = {
				totalPacks: mockPacks.length,
				stockedPacks: mockPacks.filter((p) => p.status === "STOCKED").length,
				reservedPacks: mockPacks.filter((p) => p.status === "RESERVED").length,
				soldPacks: mockPacks.filter((p) => p.status === "SOLD").length,
				totalCards: mockPacks.reduce((acc, p) => acc + p.packDetails.length, 0),
				linkedCards: mockPacks.reduce(
					(acc, p) =>
						acc +
						p.packDetails.filter((pd) => pd.card.status === "LINKED").length,
					0,
				),
				pendingCards: mockPacks.reduce(
					(acc, p) =>
						acc +
						p.packDetails.filter((pd) => pd.card.status === "READY").length,
					0,
				),
				soldCards: mockPacks.reduce(
					(acc, p) =>
						acc +
						p.packDetails.filter((pd) => pd.card.status === "SOLD").length,
					0,
				),
			};
			setStats(mockStats);
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "STOCKED":
				return "bg-blue-500/10 text-blue-400 border-blue-500/25";
			case "RESERVED":
				return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
			case "SOLD":
				return "bg-green-500/10 text-green-400 border-green-500/25";
			default:
				return "bg-muted/40 text-muted-foreground";
		}
	};

	const getCardStatusColor = (status: string) => {
		switch (status) {
			case "PENDING_BIND":
				return "bg-gray-500/10 text-gray-400 border-gray-500/25";
			case "READY":
				return "bg-blue-500/10 text-blue-400 border-blue-500/25";
			case "SOLD":
				return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
			case "LINKED":
				return "bg-green-500/10 text-green-400 border-green-500/25";
			case "DEACTIVATED":
				return "bg-red-500/10 text-red-400 border-red-500/25";
			default:
				return "bg-muted/40 text-muted-foreground";
		}
	};

	const getRarityColor = (rarity: string) => {
		switch (rarity) {
			case "LEGENDARY":
				return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30";
			case "RARE":
				return "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30";
			case "COMMON":
				return "bg-gray-500/10 text-gray-400 border-gray-500/30";
			default:
				return "bg-muted/40 text-muted-foreground";
		}
	};

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
					<Card className="glass-card">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-500/10 rounded-lg">
									<Package className="h-5 w-5 text-blue-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Tổng Pack</p>
									<p className="text-2xl font-bold">{stats.totalPacks}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="glass-card">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-500/10 rounded-lg">
									<Box className="h-5 w-5 text-blue-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Trong kho</p>
									<p className="text-2xl font-bold text-blue-400">
										{stats.stockedPacks}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="glass-card">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-yellow-500/10 rounded-lg">
									<Clock className="h-5 w-5 text-yellow-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Đã đặt</p>
									<p className="text-2xl font-bold text-yellow-400">
										{stats.reservedPacks}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="glass-card">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-500/10 rounded-lg">
									<CheckCircle2 className="h-5 w-5 text-green-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Đã bán</p>
									<p className="text-2xl font-bold text-green-400">
										{stats.soldPacks}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Card Stats */}
			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="glass-card">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-500/10 rounded-lg">
									<Zap className="h-5 w-5 text-green-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Thẻ đã liên kết
									</p>
									<p className="text-xl font-bold text-green-400">
										{stats.linkedCards}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="glass-card">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-500/10 rounded-lg">
									<PackageOpen className="h-5 w-5 text-blue-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Thẻ sẵn sàng</p>
									<p className="text-xl font-bold text-blue-400">
										{stats.pendingCards}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="glass-card">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-yellow-500/10 rounded-lg">
									<ShoppingCart className="h-5 w-5 text-yellow-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Thẻ đã bán</p>
									<p className="text-xl font-bold text-yellow-400">
										{stats.soldCards}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
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
											<Badge className={getStatusColor(pack.status)}>
												{pack.status === "STOCKED" && (
													<Box className="h-3 w-3 mr-1" />
												)}
												{pack.status === "RESERVED" && (
													<Clock className="h-3 w-3 mr-1" />
												)}
												{pack.status === "SOLD" && (
													<CheckCircle2 className="h-3 w-3 mr-1" />
												)}
												{pack.status}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<div className="flex gap-1">
													{pack.packDetails.slice(0, 3).map((pd) => (
														<Badge
															key={pd.packDetailId}
															variant="outline"
															className={`text-xs ${getRarityColor(pd.card.cardTemplate.rarity)}`}
														>
															{pd.card.cardTemplate.rarity[0]}
														</Badge>
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
												<Badge className={getStatusColor(selectedPack.status)}>
													{selectedPack.status}
												</Badge>
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
														<Badge className={getRarityColor(rarity)}>
															{rarity}
														</Badge>
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
														<Badge
															className={getRarityColor(
																packDetail.card.cardTemplate.rarity,
															)}
														>
															{packDetail.card.cardTemplate.rarity}
														</Badge>
													</TableCell>
													<TableCell>
														<Badge
															className={getCardStatusColor(
																packDetail.card.status,
															)}
														>
															{packDetail.card.status === "LINKED" && (
																<Smartphone className="h-3 w-3 mr-1" />
															)}
															{packDetail.card.status === "READY" && (
																<PackageOpen className="h-3 w-3 mr-1" />
															)}
															{packDetail.card.status === "SOLD" && (
																<ShoppingCart className="h-3 w-3 mr-1" />
															)}
															{packDetail.card.status}
														</Badge>
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
