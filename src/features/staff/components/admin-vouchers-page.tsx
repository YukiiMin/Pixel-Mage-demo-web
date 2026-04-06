"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	CalendarDays,
	Loader2,
	Pencil,
	Percent,
	Plus,
	Tag,
	Ticket,
	ToggleLeft,
	ToggleRight,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import {
	type CreateVoucherDto,
	useAdminVouchers,
	useCreateVoucher,
	useDeleteVoucher,
	useToggleVoucher,
	useUpdateVoucher,
	type Voucher,
} from "../hooks/use-vouchers";

// ──────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────
const voucherSchema = z.object({
	code: z.string().min(3, "Mã voucher tối thiểu 3 ký tự").toUpperCase(),
	description: z.string().optional(),
	discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
	discountValue: z.coerce.number().positive("Giá trị phải lớn hơn 0"),
	minOrderValue: z.coerce.number().nonnegative().optional(),
	maxDiscount: z.coerce.number().nonnegative().optional(),
	usageLimit: z.coerce.number().int().positive().optional(),
	startDate: z.string().optional(),
	expiryDate: z.string().optional(),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────
function formatDiscount(v: Voucher) {
	if (v.discountType === "PERCENTAGE") return `${v.discountValue}%`;
	return `${v.discountValue.toLocaleString("vi-VN")} ₫`;
}

function formatDate(iso?: string) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function isExpired(expiryDate?: string) {
	if (!expiryDate) return false;
	return new Date(expiryDate) < new Date();
}

// ──────────────────────────────────────────────────
// Voucher Form Modal
// ──────────────────────────────────────────────────
function VoucherFormModal({
	open,
	onClose,
	editTarget,
}: {
	open: boolean;
	onClose: () => void;
	editTarget?: Voucher;
}) {
	const createMut = useCreateVoucher();
	const updateMut = useUpdateVoucher();
	const isEdit = !!editTarget;

	const form = useForm<VoucherFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(voucherSchema) as any,
		defaultValues: {
			code: editTarget?.code ?? "",
			description: editTarget?.description ?? "",
			discountType: editTarget?.discountType ?? "PERCENTAGE",
			discountValue: editTarget?.discountValue ?? 10,
			minOrderValue: editTarget?.minOrderValue,
			maxDiscount: editTarget?.maxDiscount,
			usageLimit: editTarget?.usageLimit,
			startDate: editTarget?.startDate?.slice(0, 10) ?? "",
			expiryDate: editTarget?.expiryDate?.slice(0, 10) ?? "",
		},
	});

	const onSubmit = async (values: VoucherFormValues) => {
		const dto: CreateVoucherDto = {
			...values,
			code: values.code.toUpperCase(),
		};

		if (isEdit && editTarget) {
			await updateMut.mutateAsync({ id: editTarget.id, dto });
		} else {
			await createMut.mutateAsync(dto);
		}
		onClose();
		form.reset();
	};

	const isPending = createMut.isPending || updateMut.isPending;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent
				className="max-w-lg border-border"
				style={{
					background: "hsl(230 40% 12% / 0.95)",
					backdropFilter: "blur(24px)",
					WebkitBackdropFilter: "blur(24px)",
				}}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg font-heading">
						<Ticket className="h-5 w-5 text-primary" />
						{isEdit ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Mã Voucher
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="SUMMER25"
												className="font-stats uppercase tracking-widest"
												onChange={(e) =>
													field.onChange(e.target.value.toUpperCase())
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="discountType"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Loại giảm giá
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="PERCENTAGE">
													Phần trăm (%)
												</SelectItem>
												<SelectItem value="FIXED_AMOUNT">
													Số tiền cố định (₫)
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="discountValue"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Giá trị
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												placeholder="10"
												className="font-stats"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="minOrderValue"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Đơn tối thiểu
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												placeholder="50000"
												className="font-stats"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="usageLimit"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Giới hạn dùng
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												placeholder="100"
												className="font-stats"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
										Mô tả
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Giảm 25% mùa hè..."
											rows={2}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Bắt đầu
										</FormLabel>
										<FormControl>
											<Input {...field} type="date" className="font-stats" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="expiryDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Hết hạn
										</FormLabel>
										<FormControl>
											<Input {...field} type="date" className="font-stats" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={onClose}
								disabled={isPending}
							>
								Huỷ
							</Button>
							<Button type="submit" disabled={isPending} className="gap-2">
								{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
								{isEdit ? "Lưu thay đổi" : "Tạo Voucher"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// ──────────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────────
export function AdminVouchersPage() {
	const { data: vouchers = [], isLoading, error } = useAdminVouchers();
	const deleteMut = useDeleteVoucher();
	const toggleMut = useToggleVoucher();

	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Voucher | undefined>();
	const [deleteTarget, setDeleteTarget] = useState<Voucher | undefined>();

	const openCreate = () => {
		setEditTarget(undefined);
		setModalOpen(true);
	};

	const openEdit = (v: Voucher) => {
		setEditTarget(v);
		setModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!deleteTarget) return;
		await deleteMut.mutateAsync(deleteTarget.id);
		setDeleteTarget(undefined);
	};

	return (
		<div className="space-y-6">
			{/* ── Header ── */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-heading font-semibold gradient-gold-purple">
						Quản lý Voucher
					</h2>
					<p className="text-sm text-muted-foreground mt-0.5">
						{vouchers.length} voucher •{" "}
						{vouchers.filter((v) => v.isActive).length} đang hoạt động
					</p>
				</div>
				<button
					type="button"
					onClick={openCreate}
					className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
				>
					<Plus className="h-4 w-4" />
					Tạo Voucher
				</button>
			</div>

			{/* ── Stats Strip ── */}
			<div className="grid grid-cols-4 gap-3">
				{[
					{
						label: "Tổng Voucher",
						value: vouchers.length,
						icon: Ticket,
						color: "text-primary",
					},
					{
						label: "Đang hoạt động",
						value: vouchers.filter(
							(v) => v.isActive && !isExpired(v.expiryDate),
						).length,
						icon: ToggleRight,
						color: "text-green-400",
					},
					{
						label: "Đã hết hạn",
						value: vouchers.filter((v) => isExpired(v.expiryDate)).length,
						icon: CalendarDays,
						color: "text-destructive",
					},
					{
						label: "Đã tắt",
						value: vouchers.filter((v) => !v.isActive).length,
						icon: ToggleLeft,
						color: "text-muted-foreground",
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

			{/* ── Table ── */}
			<div className="glass-card rounded-xl overflow-hidden">
				{isLoading ? (
					<div className="flex items-center justify-center h-48">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : error ? (
					<div className="flex items-center justify-center h-48 text-destructive text-sm">
						Không thể tải danh sách voucher. Hãy kiểm tra kết nối BE.
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow className="border-border hover:bg-transparent">
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Mã Voucher
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Giảm giá
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Đã dùng / Giới hạn
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Thời hạn
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Trạng thái
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">
									Thao tác
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{vouchers.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-12 text-muted-foreground"
									>
										<Ticket className="h-8 w-8 mx-auto mb-2 opacity-30" />
										<p>Chưa có voucher nào. Hãy tạo voucher đầu tiên!</p>
									</TableCell>
								</TableRow>
							) : (
								vouchers.map((v) => {
									const expired = isExpired(v.expiryDate);
									const statusLabel = !v.isActive
										? "Đã tắt"
										: expired
											? "Hết hạn"
											: "Hoạt động";
									const statusClass = !v.isActive
										? "text-muted-foreground"
										: expired
											? "bg-destructive/10 text-destructive border-destructive/20"
											: "bg-green-500/10 text-green-400 border-green-500/20";

									return (
										<TableRow
											key={v.id}
											className="border-border transition-colors duration-150 hover:bg-white/3"
										>
											<TableCell>
												<div className="flex items-center gap-2">
													<Tag className="h-3.5 w-3.5 text-primary shrink-0" />
													<span className="font-stats font-semibold text-foreground tracking-wider">
														{v.code}
													</span>
												</div>
												{v.description && (
													<p className="text-xs text-muted-foreground mt-0.5 truncate max-w-45">
														{v.description}
													</p>
												)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1.5">
													{v.discountType === "PERCENTAGE" ? (
														<Percent className="h-3.5 w-3.5 text-primary" />
													) : null}
													<span className="font-stats font-semibold text-primary">
														{formatDiscount(v)}
													</span>
												</div>
												{v.minOrderValue ? (
													<p className="text-xs text-muted-foreground">
														Đơn tối thiểu{" "}
														{v.minOrderValue.toLocaleString("vi-VN")}₫
													</p>
												) : null}
											</TableCell>
											<TableCell>
												<span className="font-stats text-foreground">
													{v.usedCount}
												</span>
												<span className="text-muted-foreground"> / </span>
												<span className="font-stats text-muted-foreground">
													{v.usageLimit ?? "∞"}
												</span>
											</TableCell>
											<TableCell className="text-sm">
												<div className="flex items-center gap-1.5">
													<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
													<span
														className={
															expired
																? "text-destructive"
																: "text-muted-foreground"
														}
													>
														{formatDate(v.expiryDate)}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={`text-xs font-medium ${statusClass}`}
												>
													{statusLabel}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={() => toggleMut.mutate(v.id)}
														disabled={toggleMut.isPending}
														title={v.isActive ? "Tắt voucher" : "Bật voucher"}
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
													>
														{v.isActive ? (
															<ToggleRight className="h-4 w-4 text-green-400" />
														) : (
															<ToggleLeft className="h-4 w-4" />
														)}
													</button>
													<button
														onClick={() => openEdit(v)}
														title="Chỉnh sửa"
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
													>
														<Pencil className="h-4 w-4" />
													</button>
													<button
														onClick={() => setDeleteTarget(v)}
														title="Xoá"
														className="inline-flex items-center justify-center rounded-lg border border-destructive/20 p-1.5 text-destructive transition-colors hover:bg-destructive/10"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				)}
			</div>

			{/* ── Modals ── */}
			<VoucherFormModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				editTarget={editTarget}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={() => setDeleteTarget(undefined)}
			>
				<AlertDialogContent
					style={{
						background: "hsl(230 40% 12% / 0.95)",
						backdropFilter: "blur(24px)",
						WebkitBackdropFilter: "blur(24px)",
					}}
					className="border-border"
				>
					<AlertDialogHeader>
						<AlertDialogTitle className="font-heading">
							Xác nhận xoá Voucher
						</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn sắp xoá voucher{" "}
							<span className="font-stats font-semibold text-foreground">
								{deleteTarget?.code}
							</span>
							. Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Huỷ</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMut.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Xoá Voucher"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
