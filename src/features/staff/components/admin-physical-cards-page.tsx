"use client";

import { useQuery } from "@tanstack/react-query";
import {
	CreditCard,
	Loader2,
	Monitor,
	NfcIcon,
	Search,
	ShieldCheck,
	ShieldOff,
	Smartphone,
} from "lucide-react";
import { useState } from "react";
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

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────
interface PhysicalCard {
	id: number;
	nfcUid: string;
	status: "ACTIVE" | "INACTIVE" | "LOST" | "BOUND";
	linkedInventoryId?: number;
	linkedUserId?: number;
	linkedUserName?: string;
	linkedCardName?: string;
	boundAt?: string;
	createdAt: string;
}

// ──────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────
function usePhysicalCards() {
	return useQuery({
		queryKey: ["admin-physical-cards"],
		queryFn: async () => {
			const result = await apiRequest<PhysicalCard[]>(
				API_ENDPOINTS.cardManagement.list,
			);
			return result.data ?? [];
		},
		staleTime: 30_000,
	});
}

// ──────────────────────────────────────────────────
// Status badge
// ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: PhysicalCard["status"] }) {
	const config = {
		ACTIVE: {
			label: "Hoạt động",
			className: "bg-green-500/10 text-green-400 border-green-500/20",
		},
		INACTIVE: { label: "Không hoạt động", className: "text-muted-foreground" },
		LOST: {
			label: "Mất thẻ",
			className: "bg-destructive/10 text-destructive border-destructive/20",
		},
		BOUND: {
			label: "Đã gắn NFC",
			className: "bg-primary/10 text-primary border-primary/20",
		},
	};
	const c = config[status] ?? config.INACTIVE;
	return (
		<Badge variant="outline" className={`text-xs ${c.className}`}>
			{c.label}
		</Badge>
	);
}

// ──────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────
export function AdminPhysicalCardsPage() {
	const { data: cards = [], isLoading } = usePhysicalCards();

	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("ALL");

	const filtered = (Array.isArray(cards) ? cards : []).filter((c) => {
		const matchSearch =
			!search ||
			c.nfcUid.toLowerCase().includes(search.toLowerCase()) ||
			c.linkedUserName?.toLowerCase().includes(search.toLowerCase()) ||
			c.linkedCardName?.toLowerCase().includes(search.toLowerCase());
		const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
		return matchSearch && matchStatus;
	});

	const safeCards = Array.isArray(cards) ? cards : [];
	const statCounts = {
		total: safeCards.length,
		bound: safeCards.filter((c) => c.status === "BOUND").length,
		active: safeCards.filter((c) => c.status === "ACTIVE").length,
		lost: safeCards.filter((c) => c.status === "LOST").length,
	};

	return (
		<div className="space-y-6">
			{/* ── Header ── */}
			<div>
				<h2 className="text-2xl font-heading font-semibold gradient-gold-purple">
					Thẻ Vật Lý (Physical Cards)
				</h2>
				<p className="text-sm text-muted-foreground mt-0.5">
					Giám sát tình trạng thẻ NFC trong hệ thống — chỉ Mobile mới có thể gán
					NFC
				</p>
			</div>

			{/* ── Stats Strip ── */}
			<div className="grid grid-cols-4 gap-3">
				{[
					{
						label: "Tổng thẻ",
						value: statCounts.total,
						icon: CreditCard,
						color: "text-primary",
					},
					{
						label: "Đã gắn NFC",
						value: statCounts.bound,
						icon: NfcIcon,
						color: "text-secondary",
					},
					{
						label: "Hoạt động",
						value: statCounts.active,
						icon: ShieldCheck,
						color: "text-green-400",
					},
					{
						label: "Mất thẻ",
						value: statCounts.lost,
						icon: ShieldOff,
						color: "text-destructive",
					},
				].map((stat) => (
					<div
						key={stat.label}
						className="glass-card rounded-xl px-4 py-3 flex items-center gap-3"
					>
						<stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
						<div className="min-w-0">
							<p className="font-stats text-xl font-semibold text-foreground leading-none">
								{stat.value}
							</p>
							<p className="text-xs text-muted-foreground mt-0.5 truncate">
								{stat.label}
							</p>
						</div>
					</div>
				))}
			</div>

			{/* ── Filters ── */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Tìm NFC UID hoặc tên người dùng..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 font-stats"
					/>
				</div>
				<Select value={filterStatus} onValueChange={setFilterStatus}>
					<SelectTrigger className="w-44">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
						<SelectItem value="ACTIVE">Hoạt động</SelectItem>
						<SelectItem value="BOUND">Đã gắn NFC</SelectItem>
						<SelectItem value="INACTIVE">Không hoạt động</SelectItem>
						<SelectItem value="LOST">Mất thẻ</SelectItem>
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
					<Table>
						<TableHeader>
							<TableRow className="border-border hover:bg-transparent">
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									NFC UID
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Thẻ được gắn
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Chủ sở hữu
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Trạng thái
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Ngày tạo
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-12 text-muted-foreground"
									>
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
									<TableRow
										key={card.id}
										className="border-border transition-colors duration-150 hover:bg-white/3"
									>
										<TableCell>
											<div className="flex items-center gap-2">
												<NfcIcon className="h-4 w-4 text-secondary shrink-0" />
												<span className="font-stats text-sm font-medium text-foreground tracking-wider">
													{card.nfcUid}
												</span>
											</div>
										</TableCell>
										<TableCell>
											{card.linkedCardName ? (
												<div className="flex items-center gap-2">
													<CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
													<span className="text-sm text-foreground">
														{card.linkedCardName}
													</span>
												</div>
											) : (
												<span className="text-sm text-muted-foreground">—</span>
											)}
										</TableCell>
										<TableCell>
											{card.linkedUserName ? (
												<div className="flex items-center gap-2">
													<Smartphone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
													<span className="text-sm text-foreground">
														{card.linkedUserName}
													</span>
												</div>
											) : (
												<span className="text-sm text-muted-foreground">
													Chưa gán
												</span>
											)}
										</TableCell>
										<TableCell>
											<StatusBadge status={card.status} />
										</TableCell>
										<TableCell className="text-sm text-muted-foreground font-stats">
											{new Date(card.createdAt).toLocaleDateString("vi-VN")}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</div>

			{/* ── Note ── */}
			<div className="glass-card rounded-xl p-4 border-l-2 border-secondary flex items-start gap-3">
				<Monitor className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
				<p className="text-sm text-muted-foreground">
					<span className="text-foreground font-medium">Lưu ý:</span> Trang này
					chỉ dùng để <strong>giám sát</strong>. Việc gán NFC vào thẻ vật lý
					phải được thực hiện từ <strong>ứng dụng Mobile</strong> của PixelMage.
				</p>
			</div>
		</div>
	);
}
