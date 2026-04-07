"use client";

import { Badge } from "@/components/ui/badge";
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
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { CardProductStatus, PhysicalCard } from "@/types/admin-cards";
import { useQuery } from "@tanstack/react-query";
import {
	Box,
	CreditCard,
	Hash,
	Loader2,
	Monitor,
	NfcIcon,
	Package,
	Search,
	ShieldCheck,
	ShieldOff,
	Smartphone,
	User,
} from "lucide-react";
import { useState } from "react";

// Page response type from Spring Boot
interface PageResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
}

// ──────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────
function usePhysicalCards() {
	return useQuery({
		queryKey: ["admin-physical-cards"],
		queryFn: async () => {
			const result = await apiRequest<PageResponse<PhysicalCard>>(
				API_ENDPOINTS.cardManagement.list,
			);
			return result.data?.content ?? [];
		},
		staleTime: 30_000,
	});
}

// ──────────────────────────────────────────────────
// Status badge component
// ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: CardProductStatus }) {
	const config: Record<CardProductStatus, { label: string; className: string }> = {
		PENDING_BIND: { label: "Chờ gắn NFC", className: "text-muted-foreground" },
		READY: { label: "Sẵn sàng", className: "bg-green-500/10 text-green-400 border-green-500/20" },
		SOLD: { label: "Đã bán", className: "text-amber-400 border-amber-500/20" },
		LINKED: { label: "Đã gắn NFC", className: "bg-primary/10 text-primary border-primary/20" },
		DEACTIVATED: { label: "Vô hiệu hóa", className: "bg-destructive/10 text-destructive border-destructive/20" },
	};
	const c = config[status] ?? config.PENDING_BIND;
	return (
		<Badge variant="outline" className={`text-xs ${c.className}`}>
			{c.label}
		</Badge>
	);
}

// ──────────────────────────────────────────────────
// Condition badge component
// ──────────────────────────────────────────────────
function ConditionBadge({ condition }: { condition: string }) {
	const config: Record<string, { label: string; className: string }> = {
		NEW: { label: "Mới", className: "bg-green-500/10 text-green-400 border-green-500/20" },
		EXCELLENT: { label: "Xuất sắc", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
		GOOD: { label: "Tốt", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
		FAIR: { label: "Khá", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
		POOR: { label: "Kém", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
		DAMAGED: { label: "Hỏng", className: "bg-destructive/10 text-destructive border-destructive/20" },
	};
	const c = config[condition] ?? { label: condition, className: "text-muted-foreground" };
	return (
		<Badge variant="outline" className={`text-xs ${c.className}`}>
			{c.label}
		</Badge>
	);
}

// ──────────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────────
export function AdminPhysicalCardsPage() {
	const { data: cards = [], isLoading } = usePhysicalCards();

	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("ALL");

	const filtered = (Array.isArray(cards) ? cards : []).filter((c) => {
		const matchSearch =
			!search ||
			c.nfcUid?.toLowerCase().includes(search.toLowerCase()) ||
			c.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
			c.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
			c.ownerEmail?.toLowerCase().includes(search.toLowerCase()) ||
			c.cardTemplateName?.toLowerCase().includes(search.toLowerCase()) ||
			c.productionBatch?.toLowerCase().includes(search.toLowerCase());
		const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
		return matchSearch && matchStatus;
	});

	const safeCards = Array.isArray(cards) ? cards : [];
	const statCounts = {
		total: safeCards.length,
		pending: safeCards.filter((c) => c.status === "PENDING_BIND").length,
		linked: safeCards.filter((c) => c.status === "LINKED").length,
		ready: safeCards.filter((c) => c.status === "READY").length,
		sold: safeCards.filter((c) => c.status === "SOLD").length,
		deactivated: safeCards.filter((c) => c.status === "DEACTIVATED").length,
	};

	return (
		<div className="space-y-6">
			{/* ── Header ── */}
			<div>
				<h2 className="text-2xl font-heading font-semibold gradient-gold-purple">
					Thẻ Vật Lý (Physical Cards)
				</h2>
				<p className="text-sm text-muted-foreground mt-0.5">
					Quản lý toàn bộ thẻ NFC vật lý trong hệ thống — chỉ Mobile mới có thể gán NFC
				</p>
			</div>

			{/* ── Stats Strip ── */}
			<div className="grid grid-cols-6 gap-3">
				{[
					{ label: "Tổng thẻ", value: statCounts.total, icon: CreditCard, color: "text-primary" },
					{ label: "Chờ gắn NFC", value: statCounts.pending, icon: NfcIcon, color: "text-muted-foreground" },
					{ label: "Sẵn sàng", value: statCounts.ready, icon: ShieldCheck, color: "text-green-400" },
					{ label: "Đã bán", value: statCounts.sold, icon: Package, color: "text-amber-400" },
					{ label: "Đã gắn NFC", value: statCounts.linked, icon: Smartphone, color: "text-secondary" },
					{ label: "Vô hiệu hóa", value: statCounts.deactivated, icon: ShieldOff, color: "text-destructive" },
				].map((stat) => (
					<div key={stat.label} className="glass-card rounded-xl px-3 py-3 flex items-center gap-2">
						<stat.icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
						<div className="min-w-0">
							<p className="font-stats text-lg font-semibold text-foreground leading-none">{stat.value}</p>
							<p className="text-xs text-muted-foreground mt-0.5 truncate">{stat.label}</p>
						</div>
					</div>
				))}
			</div>

			{/* ── Filters ── */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Tìm NFC UID, Serial, Batch, Tên người dùng, Email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10 font-stats"
					/>
				</div>
				<Select value={filterStatus} onValueChange={setFilterStatus}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
						<SelectItem value="PENDING_BIND">Chờ gắn NFC</SelectItem>
						<SelectItem value="READY">Sẵn sàng</SelectItem>
						<SelectItem value="SOLD">Đã bán</SelectItem>
						<SelectItem value="LINKED">Đã gắn NFC</SelectItem>
						<SelectItem value="DEACTIVATED">Vô hiệu hóa</SelectItem>
					</SelectContent>
				</Select>
				<span className="text-sm text-muted-foreground whitespace-nowrap">
					{filtered.length} / {cards.length} thẻ
				</span>
			</div>

			{/* ── Table ── */}
			<div className="glass-card rounded-xl overflow-hidden">
				{isLoading ? (
					<div className="flex items-center justify-center h-48">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="border-border hover:bg-transparent">
									<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium w-32">NFC UID</TableHead>
									<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium w-24">Serial</TableHead>
									<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium w-28">Batch</TableHead>
									<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Card Template</TableHead>
									<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Chủ sở hữu</TableHead>
									<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium w-28">Trạng thái</TableHead>
									<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium w-24">Tình trạng</TableHead>
									<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium w-24">Ngày tạo</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
											<CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
											<p>
												{search || filterStatus !== "ALL"
													? "Không tìm thấy thẻ phù hợp."
													: "Chưa có thẻ vật lý nào trong hệ thống."}
											</p>
										</TableCell>
									</TableRow>
								) : (
									filtered.map((card) => (
										<TableRow key={card.id} className="border-border transition-colors duration-150 hover:bg-white/3">
											{/* NFC UID */}
											<TableCell>
												<div className="flex items-center gap-2">
													<NfcIcon className="h-4 w-4 text-secondary shrink-0" />
													<span className="font-stats text-sm font-medium text-foreground tracking-wider">
														{card.nfcUid || "—"}
													</span>
												</div>
											</TableCell>

											{/* Serial Number */}
											<TableCell>
												<div className="flex items-center gap-1.5">
													<Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
													<span className="text-sm text-foreground font-stats">
														{card.serialNumber || "—"}
													</span>
												</div>
											</TableCell>

											{/* Production Batch */}
											<TableCell>
												<div className="flex items-center gap-1.5">
													<Box className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
													<span className="text-sm text-foreground font-stats">
														{card.productionBatch || "—"}
													</span>
												</div>
											</TableCell>

											{/* Card Template */}
											<TableCell>
												{card.cardTemplateName ? (
													<div className="flex items-center gap-2">
														<CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
														<span className="text-sm text-foreground">{card.cardTemplateName}</span>
													</div>
												) : (
													<span className="text-sm text-muted-foreground">—</span>
												)}
												{card.productName && (
													<p className="text-xs text-muted-foreground mt-0.5">{card.productName}</p>
												)}
											</TableCell>

											{/* Owner */}
											<TableCell>
												{card.ownerName ? (
													<div>
														<div className="flex items-center gap-2">
															<User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
															<span className="text-sm text-foreground">{card.ownerName}</span>
														</div>
														{card.ownerEmail && (
															<p className="text-xs text-muted-foreground truncate max-w-[150px]">{card.ownerEmail}</p>
														)}
													</div>
												) : (
													<span className="text-sm text-muted-foreground">Chưa gán</span>
												)}
											</TableCell>

											{/* Status */}
											<TableCell>
												<StatusBadge status={card.status} />
											</TableCell>

											{/* Condition */}
											<TableCell>
												<ConditionBadge condition={card.cardCondition} />
											</TableCell>

											{/* Created Date */}
											<TableCell className="text-sm text-muted-foreground font-stats">
												{new Date(card.createdAt).toLocaleDateString("vi-VN")}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				)}
			</div>

			{/* ── Note ── */}
			<div className="glass-card rounded-xl p-4 border-l-2 border-secondary flex items-start gap-3">
				<Monitor className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
				<p className="text-sm text-muted-foreground">
					<span className="text-foreground font-medium">Lưu ý:</span> Trang này hiển thị đầy đủ thông tin thẻ vật lý cho Admin.
					Việc gán NFC vào thẻ phải được thực hiện từ <strong>ứng dụng Mobile</strong>.
				</p>
			</div>
		</div>
	);
}
