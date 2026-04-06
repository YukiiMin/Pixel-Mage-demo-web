"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Award,
	Gift,
	Loader2,
	Pencil,
	Plus,
	Star,
	ToggleLeft,
	ToggleRight,
	Trash2,
	Trophy,
	Zap,
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
	type Achievement,
	type CreateAchievementDto,
	useAdminAchievements,
	useCreateAchievement,
	useDeleteAchievement,
	useToggleAchievement,
	useUpdateAchievement,
} from "../hooks/use-achievements";

// ──────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────
const achievementSchema = z.object({
	name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
	description: z.string().min(5, "Mô tả tối thiểu 5 ký tự"),
	iconUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
	condition: z.string().min(1, "Chọn điều kiện"),
	conditionValue: z.preprocess(
		(v) => (v === "" || v === undefined ? undefined : Number(v)),
		z.number().nonnegative().optional(),
	),
	rewardType: z.enum(["PACK", "POINT", "NONE"]),
	rewardValue: z.preprocess(
		(v) => (v === "" || v === undefined ? undefined : Number(v)),
		z.number().nonnegative().optional(),
	),
	rewardPackId: z.preprocess(
		(v) => (v === "" || v === undefined ? undefined : Number(v)),
		z.number().int().positive().optional(),
	),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

const CONDITION_OPTIONS = [
	{ value: "TOTAL_ORDERS", label: "Số đơn hàng" },
	{ value: "TOTAL_SPENT", label: "Tổng chi tiêu (₫)" },
	{ value: "CARDS_OWNED", label: "Số thẻ sở hữu" },
	{ value: "LEGENDARY_OWNED", label: "Số thẻ Legendary" },
	{ value: "COLLECTIONS_COMPLETED", label: "Bộ sưu tập hoàn thành" },
	{ value: "DAILY_LOGIN_STREAK", label: "Chuỗi đăng nhập (ngày)" },
];

// ──────────────────────────────────────────────────
// Reward type badge
// ──────────────────────────────────────────────────
function RewardBadge({
	type,
	value,
}: {
	type: Achievement["rewardType"];
	value?: number;
}) {
	if (type === "NONE")
		return <span className="text-muted-foreground text-sm">—</span>;
	return (
		<div className="flex items-center gap-1.5">
			{type === "POINT" ? (
				<>
					<Zap className="h-3.5 w-3.5 text-primary" />
					<span className="font-stats text-primary font-semibold">
						{value} pts
					</span>
				</>
			) : (
				<>
					<Gift className="h-3.5 w-3.5 text-secondary" />
					<span className="font-stats text-secondary font-semibold">
						1 Pack
					</span>
				</>
			)}
		</div>
	);
}

// ──────────────────────────────────────────────────
// Form Modal
// ──────────────────────────────────────────────────
function AchievementFormModal({
	open,
	onClose,
	editTarget,
}: {
	open: boolean;
	onClose: () => void;
	editTarget?: Achievement;
}) {
	const createMut = useCreateAchievement();
	const updateMut = useUpdateAchievement();
	const isEdit = !!editTarget;

	const form = useForm<AchievementFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(achievementSchema) as any,
		defaultValues: {
			name: editTarget?.name ?? "",
			description: editTarget?.description ?? "",
			iconUrl: editTarget?.iconUrl ?? "",
			condition: editTarget?.condition ?? "",
			conditionValue: editTarget?.conditionValue,
			rewardType: editTarget?.rewardType ?? "NONE",
			rewardValue: editTarget?.rewardValue,
			rewardPackId: editTarget?.rewardPackId,
		},
	});

	const rewardType = form.watch("rewardType");

	const onSubmit = async (values: AchievementFormValues) => {
		const dto: CreateAchievementDto = {
			...values,
			iconUrl: values.iconUrl || undefined,
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
						<Trophy className="h-5 w-5 text-primary" />
						{isEdit ? "Chỉnh sửa Achievement" : "Tạo Achievement mới"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
										Tên Achievement
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Kẻ Sưu Tầm Huyền Thoại" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
											placeholder="Sở hữu 5 thẻ Legendary đầu tiên..."
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
								name="condition"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Điều kiện
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Chọn điều kiện..." />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{CONDITION_OPTIONS.map((opt) => (
													<SelectItem key={opt.value} value={opt.value}>
														{opt.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="conditionValue"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
											Giá trị điều kiện
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												placeholder="5"
												className="font-stats"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Reward section */}
						<div className="rounded-lg border border-border/50 p-3 space-y-3">
							<p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
								Phần thưởng
							</p>
							<FormField
								control={form.control}
								name="rewardType"
								render={({ field }) => (
									<FormItem>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="NONE">Không có thưởng</SelectItem>
												<SelectItem value="POINT">PM Points</SelectItem>
												<SelectItem value="PACK">Pack thẻ</SelectItem>
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							{rewardType === "POINT" && (
								<FormField
									control={form.control}
									name="rewardValue"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs text-muted-foreground">
												Số Points thưởng
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="500"
													className="font-stats"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
							{rewardType === "PACK" && (
								<FormField
									control={form.control}
									name="rewardPackId"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs text-muted-foreground">
												Pack ID
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="1"
													className="font-stats"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
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
								{isEdit ? "Lưu thay đổi" : "Tạo Achievement"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// ──────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────
export function AdminAchievementsPage() {
	const { data: achievements = [], isLoading } = useAdminAchievements();
	const deleteMut = useDeleteAchievement();
	const toggleMut = useToggleAchievement();

	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Achievement | undefined>();
	const [deleteTarget, setDeleteTarget] = useState<Achievement | undefined>();

	const openCreate = () => {
		setEditTarget(undefined);
		setModalOpen(true);
	};

	const openEdit = (a: Achievement) => {
		setEditTarget(a);
		setModalOpen(true);
	};

	return (
		<div className="space-y-6">
			{/* ── Header ── */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-heading font-semibold gradient-gold-purple">
						Quản lý Achievement
					</h2>
					<p className="text-sm text-muted-foreground mt-0.5">
						{achievements.length} achievement •{" "}
						{achievements.filter((a) => a.isActive).length} đang hoạt động
					</p>
				</div>
				<button
					type="button"
					onClick={openCreate}
					className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
				>
					<Plus className="h-4 w-4" />
					Tạo Achievement
				</button>
			</div>

			{/* ── Stats Strip ── */}
			<div className="grid grid-cols-4 gap-3">
				{[
					{
						label: "Tổng",
						value: achievements.length,
						icon: Trophy,
						color: "text-primary",
					},
					{
						label: "Đang hoạt động",
						value: achievements.filter((a) => a.isActive).length,
						icon: Star,
						color: "text-green-400",
					},
					{
						label: "Thưởng Points",
						value: achievements.filter((a) => a.rewardType === "POINT").length,
						icon: Zap,
						color: "text-primary",
					},
					{
						label: "Thưởng Pack",
						value: achievements.filter((a) => a.rewardType === "PACK").length,
						icon: Gift,
						color: "text-secondary",
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
				) : (
					<Table>
						<TableHeader>
							<TableRow className="border-border hover:bg-transparent">
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Achievement
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Điều kiện
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Phần thưởng
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
							{achievements.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-12 text-muted-foreground"
									>
										<Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
										<p>
											Chưa có achievement nào. Hãy tạo achievement đầu tiên!
										</p>
									</TableCell>
								</TableRow>
							) : (
								achievements.map((a) => {
									const conditionLabel =
										CONDITION_OPTIONS.find((o) => o.value === a.condition)
											?.label ?? a.condition;

									return (
										<TableRow
											key={a.id}
											className="border-border transition-colors duration-150 hover:bg-white/3"
										>
											<TableCell>
												<div className="flex items-center gap-2.5">
													<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
														<Trophy className="h-4 w-4 text-primary" />
													</div>
													<div className="min-w-0">
														<p className="font-medium text-foreground text-sm truncate">
															{a.name}
														</p>
														<p className="text-xs text-muted-foreground truncate max-w-50">
															{a.description}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{conditionLabel}
												</span>
												{a.conditionValue !== undefined && (
													<span className="font-stats text-primary ml-1">
														≥ {a.conditionValue}
													</span>
												)}
											</TableCell>
											<TableCell>
												<RewardBadge
													type={a.rewardType}
													value={a.rewardValue}
												/>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={
														a.isActive
															? "bg-green-500/10 text-green-400 border-green-500/20"
															: "text-muted-foreground"
													}
												>
													{a.isActive ? "Hoạt động" : "Tắt"}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={() => toggleMut.mutate(a.id)}
														disabled={toggleMut.isPending}
														title={a.isActive ? "Tắt" : "Bật"}
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
													>
														{a.isActive ? (
															<ToggleRight className="h-4 w-4 text-green-400" />
														) : (
															<ToggleLeft className="h-4 w-4" />
														)}
													</button>
													<button
														onClick={() => openEdit(a)}
														title="Chỉnh sửa"
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
													>
														<Pencil className="h-4 w-4" />
													</button>
													<button
														onClick={() => setDeleteTarget(a)}
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
			<AchievementFormModal
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
							Xác nhận xoá Achievement
						</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn sắp xoá achievement{" "}
							<span className="font-semibold text-foreground">
								{deleteTarget?.name}
							</span>
							. Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Huỷ</AlertDialogCancel>
						<AlertDialogAction
							onClick={async () => {
								if (!deleteTarget) return;
								await deleteMut.mutateAsync(deleteTarget.id);
								setDeleteTarget(undefined);
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMut.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Xoá Achievement"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
