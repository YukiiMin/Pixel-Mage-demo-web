"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/features/staff/hooks/use-accounts";
import { useAccountDetail } from "@/features/staff/hooks/use-account-detail";
import { useCreateStaff } from "@/features/staff/hooks/use-create-staff";
import { useToggleAccountStatus } from "@/features/staff/hooks/use-toggle-account-status";
import type {
	AccountRow,
	StaffFormState,
	UserStats,
} from "@/features/staff/types";
import {
	Ban,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Eye,
	Filter,
	Pencil,
	Search,
	UserPlus,
	Users,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { UserDetailProfile } from "./user-detail-profile";

function normalizeRole(rawRole?: { roleName?: string } | string): string {
	const roleValue =
		typeof rawRole === "string"
			? rawRole
			: typeof rawRole === "object" && rawRole
				? rawRole.roleName
				: undefined;
	return (roleValue || "USER").replace("ROLE_", "").toUpperCase();
}

function getStatus(
	acc: Pick<AccountRow, "active" | "isActive" | "emailVerified">,
): "ACTIVE" | "UNVERIFIED" | "BANNED" {
	const isActive = Boolean(acc.active ?? acc.isActive);
	if (!isActive) return "BANNED";
	if (acc.emailVerified === false) return "UNVERIFIED";
	return "ACTIVE";
}

const SKELETON_ROW_KEYS = [
	"row-1",
	"row-2",
	"row-3",
	"row-4",
	"row-5",
	"row-6",
	"row-7",
	"row-8",
];

const roleColor: Record<string, string> = {
	ADMIN: "bg-purple-500/15 text-purple-400 border-purple-500/25",
	STAFF: "bg-blue-500/15 text-blue-400 border-blue-500/25",
	USER: "bg-green-500/15 text-green-400 border-green-500/25",
};

// Transform for UserDetailProfile
function transformToUserDetail(
	account: AccountRow | null,
	stats: UserStats | null,
) {
	if (!account) return null;

	return {
		...account,
		roleName: account.roleName || "USER",
		active: Boolean(account.active ?? account.isActive),
		emailVerified: account.emailVerified ?? true,
		createdAt: account.createdAt || new Date().toISOString(),
		digitalCardsCount: stats?.digitalCardsCount || 0,
		cardsByRarity: stats?.cardsByRarity || { legendary: 0, rare: 0, common: 0 },
		totalOrdersCount: stats?.totalOrdersCount || 0,
		totalSpent: stats?.totalSpent || 0,
		walletBalance: stats?.walletBalance || 0,
		lastLoginAt: undefined,
		lastLoginIp: undefined,
		lastLoginDevice: undefined,
		addresses: [],
		nfcClaimHistory: [],
	};
}

export function AdminAccountsPage() {
	// Pagination & filters
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [searchField, setSearchField] = useState<
		"ALL" | "NAME" | "EMAIL" | "ID"
	>("ALL");
	const [roleFilter, setRoleFilter] = useState<
		"ALL" | "USER" | "STAFF" | "ADMIN"
	>("ALL");
	const [statusFilter, setStatusFilter] = useState<
		"ALL" | "ACTIVE" | "UNVERIFIED" | "BANNED"
	>("ALL");

	// Modal states
	const [createStaffOpen, setCreateStaffOpen] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(
		null,
	);
	const [staffForm, setStaffForm] = useState<StaffFormState>({
		email: "",
		name: "",
		password: "",
		phoneNumber: "",
	});

	// TanStack Query hooks
	const { data: accountsData, isLoading } = useAccounts({
		page,
		roleFilter,
	});

	const { data: accountDetail, isLoading: detailLoading } = useAccountDetail({
		account: selectedAccount,
		enabled: !!selectedAccount,
	});

	const createStaffMutation = useCreateStaff();
	const toggleStatusMutation = useToggleAccountStatus();

	const accounts = accountsData?.accounts ?? [];
	const totalPages = accountsData?.totalPages ?? 1;
	const totalElements = accountsData?.totalElements ?? 0;

	// Client-side filtering
	const filtered = useMemo(() => {
		return accounts.filter((a) => {
			const query = search.trim().toLowerCase();
			const byName = a.name?.toLowerCase().includes(query);
			const byEmail = a.email?.toLowerCase().includes(query);
			const byId = String(a.id).includes(query);
			const matchesSearch =
				query === "" ||
				(searchField === "NAME" && byName) ||
				(searchField === "EMAIL" && byEmail) ||
				(searchField === "ID" && byId) ||
				(searchField === "ALL" && (byName || byEmail || byId));

			const status = getStatus(a);
			const matchesStatus = statusFilter === "ALL" || statusFilter === status;
			return matchesSearch && matchesStatus;
		});
	}, [accounts, search, searchField, statusFilter]);

	const handleCreateStaff = async () => {
		if (!staffForm.email.trim()) return;
		if (staffForm.password.length < 8) return;

		createStaffMutation.mutate(
			{
				email: staffForm.email,
				name: staffForm.name,
				password: staffForm.password,
				phoneNumber: staffForm.phoneNumber,
			},
			{
				onSuccess: () => {
					setCreateStaffOpen(false);
					setStaffForm({ email: "", name: "", password: "", phoneNumber: "" });
				},
			},
		);
	};

	const handleToggleActive = (account: AccountRow) => {
		toggleStatusMutation.mutate({
			accountId: account.id,
			email: account.email,
			currentActive: Boolean(account.active ?? account.isActive),
		});
	};

	const handleSelectAccount = (account: AccountRow) => {
		setSelectedAccount(account);
	};

	return (
		<div className="space-y-6">
			{/* Create Staff Dialog */}
			<Dialog open={createStaffOpen} onOpenChange={setCreateStaffOpen}>
				<DialogContent className="border-border/50 glass-card">
					<DialogHeader>
						<DialogTitle>Tạo tài khoản Staff</DialogTitle>
						<DialogDescription>
							Tạo nhanh tài khoản nhân viên kho/scanner NFC.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<input
							type="email"
							placeholder="Email"
							value={staffForm.email}
							onChange={(e) =>
								setStaffForm((p) => ({ ...p, email: e.target.value }))
							}
							className="w-full rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-sm"
						/>
						<input
							type="text"
							placeholder="Tên hiển thị"
							value={staffForm.name}
							onChange={(e) =>
								setStaffForm((p) => ({ ...p, name: e.target.value }))
							}
							className="w-full rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-sm"
						/>
						<input
							type="text"
							placeholder="Số điện thoại"
							value={staffForm.phoneNumber}
							onChange={(e) =>
								setStaffForm((p) => ({ ...p, phoneNumber: e.target.value }))
							}
							className="w-full rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-sm"
						/>
						<input
							type="password"
							placeholder="Mật khẩu tạm (>=8 ký tự)"
							value={staffForm.password}
							onChange={(e) =>
								setStaffForm((p) => ({ ...p, password: e.target.value }))
							}
							className="w-full rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-sm"
						/>
						<div className="flex justify-end gap-2 pt-2">
							<button
								type="button"
								onClick={() => setCreateStaffOpen(false)}
								className="rounded-lg border border-border/50 px-3 py-2 text-sm"
							>
								Huỷ
							</button>
							<button
								type="button"
								onClick={handleCreateStaff}
								disabled={createStaffMutation.isPending}
								className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
							>
								{createStaffMutation.isPending ? "Đang tạo..." : "Tạo Staff"}
							</button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* User Detail Profile */}
			<UserDetailProfile
				user={transformToUserDetail(
					accountDetail?.account || selectedAccount,
					accountDetail?.stats ?? null,
				)}
				open={!!selectedAccount}
				onClose={() => setSelectedAccount(null)}
				loading={detailLoading}
			/>

			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="badge-mystic inline-flex mb-2">Admin</p>
					<h1
						className="text-3xl text-foreground"
						style={{ fontFamily: "Fruktur, var(--font-heading)" }}
					>
						Accounts
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Tổng cộng{" "}
						<span className="font-semibold text-foreground">
							{totalElements}
						</span>{" "}
						tài khoản
					</p>
				</div>
				<button
					type="button"
					onClick={() => setCreateStaffOpen(true)}
					className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
					title="Tạo staff mới"
				>
					<UserPlus className="h-4 w-4" />
					Thêm Staff
				</button>
			</div>

			{/* Filters */}
			<div className="glass-card flex flex-col gap-3 rounded-2xl border border-border/50 p-4 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Tìm tên hoặc email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-lg border border-border/50 bg-card/60 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
					/>
				</div>
				<div className="flex items-center gap-2 rounded-lg border border-border/50 px-2 py-1">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<select
						value={searchField}
						onChange={(e) =>
							setSearchField(e.target.value as "ALL" | "NAME" | "EMAIL" | "ID")
						}
						className="bg-transparent text-xs text-foreground outline-none"
					>
						<option value="ALL">Tìm: Tất cả</option>
						<option value="NAME">Theo tên</option>
						<option value="EMAIL">Theo email</option>
						<option value="ID">Theo ID</option>
					</select>
				</div>
				<div className="flex gap-2">
					{(["ALL", "USER", "STAFF", "ADMIN"] as const).map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => {
								setRoleFilter(r);
								setPage(0);
							}}
							className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
								roleFilter === r
									? "gradient-gold-purple-bg border-transparent text-primary-foreground"
									: "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
							}`}
						>
							{r}
						</button>
					))}
				</div>
				<select
					value={statusFilter}
					onChange={(e) =>
						setStatusFilter(
							e.target.value as "ALL" | "ACTIVE" | "UNVERIFIED" | "BANNED",
						)
					}
					className="rounded-full border border-border/50 bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground focus:outline-none"
				>
					<option value="ALL">Status: Tất cả</option>
					<option value="ACTIVE">Active</option>
					<option value="UNVERIFIED">Unverified</option>
					<option value="BANNED">Banned</option>
				</select>
			</div>

			{/* Table */}
			<div className="glass-card overflow-hidden rounded-2xl border border-border/50">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border/40 bg-card/60">
								{[
									"ID / Avatar",
									"Username / Email",
									"Vai trò",
									"Trạng thái",
									"Joined Date",
									"Thao tác",
								].map((h) => (
									<th
										key={h}
										className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground last:text-right"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								SKELETON_ROW_KEYS.map((rowKey) => (
									<tr key={rowKey} className="border-b border-border/20">
										{[6, 28, 40, 14, 16, 24].map((w) => (
											<td key={`${rowKey}-cell-${w}`} className="px-4 py-3">
												<Skeleton
													className={`h-4 w-${w} ${w === 24 ? "ml-auto" : ""}`}
												/>
											</td>
										))}
									</tr>
								))
							) : filtered.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										className="py-12 text-center text-sm text-muted-foreground"
									>
										<Users className="mx-auto mb-3 h-10 w-10 opacity-30" />
										Không tìm thấy tài khoản
									</td>
								</tr>
							) : (
								filtered.map((acc) => {
									const roleName = acc.roleName ?? "USER";
									const status = getStatus(acc);
									return (
										<tr
											key={String(acc.id)}
											className="border-b border-border/20 transition-colors hover:bg-card/40 last:border-0"
										>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<div className="h-8 w-8 overflow-hidden rounded-full bg-secondary/40">
														{acc.avatarUrl ? (
															<Image
																src={acc.avatarUrl}
																alt={acc.name || "Avatar"}
																width={32}
																height={32}
																className="h-full w-full object-cover"
																unoptimized={
																	acc.avatarUrl.includes("dicebear.com") ||
																	acc.avatarUrl.includes(".svg")
																}
															/>
														) : (
															<div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
																{(acc.name || "U").slice(0, 1).toUpperCase()}
															</div>
														)}
													</div>
													<span className="font-stats text-xs text-muted-foreground">
														#{acc.id}
													</span>
												</div>
											</td>
											<td className="px-4 py-3">
												<p className="font-medium text-foreground">
													{acc.name || "—"}
												</p>
												<p className="text-muted-foreground">{acc.email}</p>
											</td>
											<td className="px-4 py-3">
												<span
													className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
														roleColor[roleName] ??
														"bg-muted/40 text-muted-foreground"
													}`}
												>
													{roleName}
												</span>
											</td>
											<td className="px-4 py-3">
												<span
													className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
														acc.active
															? "border-green-500/25 bg-green-500/10 text-green-400"
															: "border-destructive/25 bg-destructive/10 text-destructive"
													}`}
												>
													{status}
												</span>
											</td>
											<td className="px-4 py-3 text-xs text-muted-foreground">
												{acc.createdAt
													? new Date(acc.createdAt).toLocaleDateString("vi-VN")
													: "—"}
											</td>
											<td className="px-4 py-3 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														type="button"
														onClick={() => handleSelectAccount(acc)}
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
														title="Xem chi tiết"
													>
														<Eye className="h-4 w-4" />
													</button>
													<button
														type="button"
														onClick={() => handleSelectAccount(acc)}
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
														title="Sửa nhanh"
													>
														<Pencil className="h-4 w-4" />
													</button>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<button
																type="button"
																disabled={
																	toggleStatusMutation.isPending ||
																	roleName === "ADMIN"
																}
																className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
																	acc.active
																		? "border-destructive/30 text-destructive hover:bg-destructive/10"
																		: "border-green-500/30 text-green-400 hover:bg-green-500/10"
																}`}
															>
																{acc.active ? (
																	<Ban className="h-3.5 w-3.5" />
																) : (
																	<CheckCircle2 className="h-3.5 w-3.5" />
																)}
																{acc.active ? "Ban" : "Unban"}
															</button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>
																	{acc.active
																		? "Vô hiệu hoá tài khoản?"
																		: "Kích hoạt tài khoản?"}
																</AlertDialogTitle>
																<AlertDialogDescription>
																	Bạn chắc chắn muốn{" "}
																	{acc.active ? "vô hiệu hoá" : "kích hoạt"} tài
																	khoản <strong>{acc.email}</strong>?
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Huỷ</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => handleToggleActive(acc)}
																	className={
																		acc.active
																			? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
																			: ""
																	}
																>
																	Xác nhận
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{totalPages > 1 && (
					<div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
						<p className="text-xs text-muted-foreground">
							Trang {page + 1} / {totalPages}
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								disabled={page === 0}
								className="rounded-lg border border-border/50 p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
								disabled={page >= totalPages - 1}
								className="rounded-lg border border-border/50 p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
