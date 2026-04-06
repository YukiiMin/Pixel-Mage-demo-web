"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Wallet } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { WalletBalance } from "@/types/wallet";

interface AdminWallet extends WalletBalance {
	userId: number;
	email: string;
	name: string;
}

export function AdminWalletPage() {
	const [search, setSearch] = useState("");

	const {
		data: wallets = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["admin-wallets"],
		queryFn: async () => {
			try {
				const result = await apiRequest<AdminWallet[]>(
					API_ENDPOINTS.wallet.adminList,
				);
				return result.data ?? [];
			} catch {
				// Fallback for current BE: only exposes current-user wallet balance
				const me = await apiRequest<WalletBalance>(
					API_ENDPOINTS.wallet.balance,
				);
				return [
					{
						userId: 0,
						email: "current-admin@local",
						name: "Current Admin",
						...(me.data ?? { balance: 0, pointsToNextVoucher: 0 }),
					},
				];
			}
		},
	});

	const filtered = wallets.filter(
		(w) =>
			!search ||
			w.email?.toLowerCase().includes(search.toLowerCase()) ||
			w.name?.toLowerCase().includes(search.toLowerCase()),
	);

	const totalBalance = wallets.reduce((sum, w) => sum + (w.balance ?? 0), 0);
	const totalPointsToNext = wallets.reduce(
		(sum, w) => sum + (w.pointsToNextVoucher ?? 0),
		0,
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-heading font-semibold gradient-gold-purple">
					Quản lý Ví Người Dùng
				</h2>
				<p className="text-sm text-muted-foreground mt-0.5">
					Giám sát số dư PM và điểm đổi thưởng của mọi người dùng trong hệ thống
				</p>
			</div>

			{/* Stats Strip */}
			<div className="grid grid-cols-3 gap-3">
				<div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
					<Wallet className="h-5 w-5 shrink-0 text-primary" />
					<div className="min-w-0">
						<p className="font-stats text-xl font-semibold text-foreground leading-none">
							{wallets.length}
						</p>
						<p className="text-xs text-muted-foreground mt-0.5 truncate">
							Tổng số ví đang hoạt động
						</p>
					</div>
				</div>
				<div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
					<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-primary/20 text-[10px] font-bold text-primary">
						PM
					</div>
					<div className="min-w-0">
						<p className="font-stats text-xl font-semibold text-foreground leading-none">
							{totalBalance.toLocaleString("vi-VN")}
						</p>
						<p className="text-xs text-muted-foreground mt-0.5 truncate">
							Tổng PM lưu hành
						</p>
					</div>
				</div>
				<div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
					<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-secondary/20 text-[10px] font-bold text-secondary-foreground">
						NV
					</div>
					<div className="min-w-0">
						<p className="font-stats text-xl font-semibold text-foreground leading-none">
							{totalPointsToNext.toLocaleString("vi-VN")}
						</p>
						<p className="text-xs text-muted-foreground mt-0.5 truncate">
							Tổng điểm chờ đổi Voucher
						</p>
					</div>
				</div>
			</div>

			{/* Filter */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Tìm theo tên hoặc email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 font-stats"
					/>
				</div>
				<span className="text-sm text-muted-foreground whitespace-nowrap">
					{filtered.length} / {wallets.length} ví
				</span>
			</div>

			{/* Table */}
			<div className="glass-card rounded-xl overflow-hidden">
				{isLoading ? (
					<div className="flex items-center justify-center h-48">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : error ? (
					<div className="flex items-center justify-center h-48 text-destructive text-sm">
						Không thể tải danh sách ví. Kiểm tra kết nối Backend.
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow className="border-border hover:bg-transparent">
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Người dùng
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">
									Số dư PM (Phú Lượng)
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">
									Điểm tới Voucher tiếp theo
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={3}
										className="text-center py-12 text-muted-foreground"
									>
										<Wallet className="h-8 w-8 mx-auto mb-2 opacity-30" />
										<p>Không tìm thấy ví phù hợp.</p>
									</TableCell>
								</TableRow>
							) : (
								filtered.map((wallet) => (
									<TableRow
										key={wallet.userId}
										className="border-border transition-colors duration-150 hover:bg-white/3"
									>
										<TableCell>
											<div className="font-medium text-foreground">
												{wallet.name || "Người dùng"}
											</div>
											<div className="text-xs text-muted-foreground">
												{wallet.email}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<span className="font-stats font-semibold text-primary">
												{wallet.balance?.toLocaleString("vi-VN") ?? 0}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<span className="font-stats font-semibold text-secondary-foreground">
												{wallet.pointsToNextVoucher?.toLocaleString("vi-VN") ??
													0}
											</span>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
}
