"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	BookOpen,
	Eye,
	EyeOff,
	FolderOpen,
	Image,
	Layers,
	Loader2,
	Plus,
	Users,
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
	type AdminCollection,
	type CreateAdminCollectionDto,
	useAdminCollections,
	useCreateAdminCollection,
	useToggleCollectionVisibility,
} from "../hooks/use-admin-collections";

// ──────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────
const collectionSchema = z.object({
	name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
	description: z.string().optional(),
	coverImageUrl: z
		.string()
		.url("URL không hợp lệ")
		.optional()
		.or(z.literal("")),
	cardTemplateIds: z.string().transform((val) =>
		val
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean)
			.map(Number)
			.filter((n) => !Number.isNaN(n)),
	),
});

type CollectionFormValues = {
	name: string;
	description?: string;
	coverImageUrl?: string;
	cardTemplateIds: string;
};

// ──────────────────────────────────────────────────
// Form Modal
// ──────────────────────────────────────────────────
function CollectionFormModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const createMut = useCreateAdminCollection();

	const form = useForm<CollectionFormValues>({
		defaultValues: {
			name: "",
			description: "",
			coverImageUrl: "",
			cardTemplateIds: "",
		},
	});

	const onSubmit = async (values: CollectionFormValues) => {
		const cardTemplateIds = values.cardTemplateIds
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean)
			.map(Number)
			.filter((n) => !Number.isNaN(n));

		const dto: CreateAdminCollectionDto = {
			name: values.name,
			description: values.description || undefined,
			coverImageUrl: values.coverImageUrl || undefined,
			cardTemplateIds,
		};
		await createMut.mutateAsync(dto);
		onClose();
		form.reset();
	};

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
						<FolderOpen className="h-5 w-5 text-primary" />
						Tạo Admin Collection
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
										Tên Collection
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Bộ Sưu Tập Huyền Thoại" />
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
											placeholder="Bộ sưu tập gồm các thẻ huyền thoại..."
											rows={2}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="coverImageUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
										Cover Image URL
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="https://..." />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="cardTemplateIds"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
										CardTemplate IDs (phân cách bằng dấu phẩy)
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="1, 2, 5, 12, 37"
											className="font-stats"
										/>
									</FormControl>
									<p className="text-xs text-muted-foreground">
										Nhập ID các CardTemplate cần gộp vào collection này.
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={onClose}
								disabled={createMut.isPending}
							>
								Huỷ
							</Button>
							<Button
								type="submit"
								disabled={createMut.isPending}
								className="gap-2"
							>
								{createMut.isPending && (
									<Loader2 className="h-4 w-4 animate-spin" />
								)}
								Tạo Collection
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
export function AdminCollectionsPage() {
	const { data: collections = [], isLoading } = useAdminCollections();
	const toggleMut = useToggleCollectionVisibility();

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<div className="space-y-6">
			{/* ── Header ── */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-heading font-semibold gradient-gold-purple">
						Admin Collections
					</h2>
					<p className="text-sm text-muted-foreground mt-0.5">
						{collections.length} collection • Bộ sưu tập hệ thống áp dụng cho
						người dùng
					</p>
				</div>
				<button
					type="button"
					onClick={() => setModalOpen(true)}
					className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
				>
					<Plus className="h-4 w-4" />
					Tạo Collection
				</button>
			</div>

			{/* ── Stats Strip ── */}
			<div className="grid grid-cols-3 gap-3">
				{[
					{
						label: "Tổng Collection",
						value: collections.length,
						icon: FolderOpen,
						color: "text-primary",
					},
					{
						label: "Hiển thị",
						value: collections.filter((c) => c.isVisible).length,
						icon: Eye,
						color: "text-green-400",
					},
					{
						label: "Tổng thẻ được quản lý",
						value: collections.reduce(
							(sum, c) => sum + (c.cardTemplateIds?.length ?? 0),
							0,
						),
						icon: Layers,
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

			{/* ── Collections Table ── */}
			{isLoading ? (
				<div className="flex items-center justify-center py-20">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
				</div>
			) : collections.length === 0 ? (
				<div className="glass-card flex flex-col items-center justify-center rounded-2xl border border-border/50 py-20 text-muted-foreground">
					<BookOpen className="mb-4 h-10 w-10 opacity-30" />
					<p className="text-sm font-medium">
						Chưa có Admin Collection nào. Hãy tạo collection đầu tiên!
					</p>
				</div>
			) : (
				<div className="glass-card overflow-hidden rounded-2xl border border-border/50">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="border-b border-border/40 bg-card/60 text-xs text-muted-foreground">
								<tr>
									<th className="px-4 py-3 font-semibold text-left">Ảnh</th>
									<th className="px-4 py-3 font-semibold text-left">
										Tên Collection & Mô Tả
									</th>
									<th className="px-4 py-3 font-semibold text-left">
										Trạng Thái
									</th>
									<th className="px-4 py-3 font-semibold text-left">
										Thống Kê
									</th>
									<th className="px-4 py-3 font-semibold text-right">
										Thao Tác
									</th>
								</tr>
							</thead>
							<tbody>
								{collections.map((c, idx) => (
									<tr
										key={c.id ?? `collection-${idx}`}
										className="border-b border-border/20 transition-colors hover:bg-card/40 last:border-0 group"
									>
										<td className="px-4 py-3 w-28">
											<div className="relative h-14 w-20 rounded-md border border-border/40 overflow-hidden bg-secondary/10 flex items-center justify-center">
												{c.coverImageUrl ? (
													<img
														src={c.coverImageUrl}
														alt={c.name}
														className="h-full w-full object-cover"
													/>
												) : (
													<Image className="h-5 w-5 opacity-30 text-primary" />
												)}
											</div>
										</td>
										<td className="px-4 py-3">
											<p className="font-bold text-foreground tracking-normal">
												{c.name}
											</p>
											{c.description && (
												<p
													className="text-xs text-muted-foreground mt-0.5 line-clamp-2 max-w-sm"
													title={c.description}
												>
													{c.description}
												</p>
											)}
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
													c.isVisible
														? "border-green-500/25 bg-green-500/10 text-green-400"
														: "border-border/30 bg-muted/40 text-muted-foreground"
												}`}
											>
												{c.isVisible ? "Công Khai" : "Ẩn"}
											</span>
										</td>
										<td className="px-4 py-3 text-xs text-muted-foreground">
											<div className="flex flex-col gap-1">
												<span className="flex items-center gap-1.5">
													<Layers className="h-3.5 w-3.5" />
													<span className="font-stats font-medium">
														{c.cardTemplateIds?.length ?? 0}
													</span>{" "}
													thẻ bài
												</span>
												<span className="flex items-center gap-1.5">
													<Users className="h-3.5 w-3.5" />
													<span className="font-stats font-medium">
														{c.appliedToUserCount ?? 0}
													</span>{" "}
													người dùng
												</span>
											</div>
										</td>
										<td className="px-4 py-3 text-right">
											<button
												type="button"
												disabled={toggleMut.isPending}
												onClick={() =>
													toggleMut.mutate({
														id: c.id,
														isVisible: !c.isVisible,
													})
												}
												className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
													c.isVisible
														? "border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground"
														: "border-green-500/30 text-green-400 hover:bg-green-500/10"
												}`}
											>
												{c.isVisible ? (
													<EyeOff className="h-3.5 w-3.5" />
												) : (
													<Eye className="h-3.5 w-3.5" />
												)}
												{c.isVisible ? "Ẩn Khỏi Game" : "Bật Công Khai"}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* ── Modal ── */}
			<CollectionFormModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
			/>
		</div>
	);
}
