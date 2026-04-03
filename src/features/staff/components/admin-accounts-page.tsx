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
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, API_ENDPOINTS } from "@/lib/api-config";
import { getApiErrorMessage } from "@/types/api";
import {
	Ban,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Search,
	UserPlus,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface AccountRow {
	id: number;
	name: string;
	email: string;
	phoneNumber?: string;
	role: { roleName: string };
	active: boolean;
	createdAt?: string;
}

interface PageData {
	content: AccountRow[];
	totalPages: number;
	totalElements: number;
	number: number;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export function AdminAccountsPage() {
	const [accounts, setAccounts] = useState<AccountRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "STAFF" | "ADMIN">("ALL");
	const [actionLoading, setActionLoading] = useState<number | null>(null);

	const fetchAccounts = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ page: String(page), size: "15" });
			if (roleFilter !== "ALL") params.set("role", roleFilter);

			const res = await apiRequest<PageData | AccountRow[]>(
				`${API_ENDPOINTS.accountManagement.list}?${params}`,
				{ method: "GET" },
			);

			const d = res.data;
			if (d && "content" in d) {
				setAccounts((d as PageData).content);
				setTotalPages((d as PageData).totalPages);
				setTotalElements((d as PageData).totalElements);
			} else if (Array.isArray(d)) {
				setAccounts(d);
				setTotalPages(1);
				setTotalElements(d.length);
			}
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Không thể tải danh sách tài khoản"));
		} finally {
			setLoading(false);
		}
	}, [page, roleFilter]);

	useEffect(() => {
		fetchAccounts();
	}, [fetchAccounts]);

	const handleToggleActive = async (account: AccountRow) => {
		setActionLoading(account.id);
		try {
			await apiRequest(API_ENDPOINTS.accountManagement.toggleStatus(account.id), { method: "PATCH" });
			toast.success(
				account.active
					? `Đã vô hiệu hoá ${account.email}`
					: `Đã kích hoạt ${account.email}`,
			);
			await fetchAccounts();
		} catch (err) {
			toast.error(getApiErrorMessage(err, "Thao tác thất bại"));
		} finally {
			setActionLoading(null);
		}
	};

	// Client-side search
	const filtered = accounts.filter(
		(a) =>
			search === "" ||
			a.name?.toLowerCase().includes(search.toLowerCase()) ||
			a.email?.toLowerCase().includes(search.toLowerCase()),
	);

	const roleColor: Record<string, string> = {
		ADMIN: "bg-purple-500/15 text-purple-400 border-purple-500/25",
		STAFF: "bg-blue-500/15 text-blue-400 border-blue-500/25",
		USER: "bg-green-500/15 text-green-400 border-green-500/25",
	};

	return (
		<div className="space-y-6">
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
						<span className="font-semibold text-foreground">{totalElements}</span> tài khoản
					</p>
				</div>
				<button
					type="button"
					disabled
					className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary opacity-60 cursor-not-allowed"
					title="Cần BE implement POST /api/admin/accounts/staff"
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
				<div className="flex gap-2">
					{(["ALL", "USER", "STAFF", "ADMIN"] as const).map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => { setRoleFilter(r); setPage(0); }}
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
			</div>

			{/* Table */}
			<div className="glass-card overflow-hidden rounded-2xl border border-border/50">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border/40 bg-card/60">
								{["#", "Tên", "Email", "Vai trò", "Trạng thái", "Thao tác"].map((h) => (
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
							{loading ? (
								Array.from({ length: 8 }).map((_, i) => (
									<tr key={i} className="border-b border-border/20">
										{[6, 28, 40, 14, 16, 24].map((w, j) => (
											<td key={j} className="px-4 py-3">
												<Skeleton className={`h-4 w-${w} ${j === 5 ? "ml-auto" : ""}`} />
											</td>
										))}
									</tr>
								))
							) : filtered.length === 0 ? (
								<tr>
									<td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
										<Users className="mx-auto mb-3 h-10 w-10 opacity-30" />
										Không tìm thấy tài khoản
									</td>
								</tr>
							) : (
								filtered.map((acc) => {
									const roleName = acc.role?.roleName ?? "USER";
									return (
										<tr
											key={acc.id}
											className="border-b border-border/20 transition-colors hover:bg-card/40 last:border-0"
										>
											<td className="px-4 py-3 font-stats text-xs text-muted-foreground">
												{acc.id}
											</td>
											<td className="px-4 py-3 font-medium text-foreground">
												{acc.name || "—"}
											</td>
											<td className="px-4 py-3 text-muted-foreground">{acc.email}</td>
											<td className="px-4 py-3">
												<span
													className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${roleColor[roleName] ?? "bg-muted/40 text-muted-foreground"}`}
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
													{acc.active ? "Active" : "Inactive"}
												</span>
											</td>
											<td className="px-4 py-3 text-right">
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<button
															type="button"
															disabled={actionLoading === acc.id || roleName === "ADMIN"}
															className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
																acc.active
																	? "border-destructive/30 text-destructive hover:bg-destructive/10"
																	: "border-green-500/30 text-green-400 hover:bg-green-500/10"
															}`}
														>
															{acc.active ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
															{acc.active ? "Vô hiệu" : "Kích hoạt"}
														</button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																{acc.active ? "Vô hiệu hoá tài khoản?" : "Kích hoạt tài khoản?"}
															</AlertDialogTitle>
															<AlertDialogDescription>
																Bạn chắc chắn muốn {acc.active ? "vô hiệu hoá" : "kích hoạt"} tài khoản{" "}
																<strong>{acc.email}</strong>?
																{acc.active && " Người dùng sẽ không thể đăng nhập cho đến khi được kích hoạt lại."}
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Huỷ</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleToggleActive(acc)}
																className={acc.active ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
															>
																Xác nhận
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
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

			<div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4">
				<p className="mb-1 text-xs font-semibold text-amber-300">📡 BE endpoints cần cập nhật</p>
				<pre className="whitespace-pre-wrap text-xs text-muted-foreground">{`PATCH /api/accounts/{id}/status  → Toggle kích hoạt/vô hiệu
POST  /api/accounts/staff       → Tạo staff account`}</pre>
			</div>
		</div>
	);
}
