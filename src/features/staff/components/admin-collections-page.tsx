"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

// ──────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────
const collectionSchema = z.object({
	name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
	description: z.string().optional(),
	coverImageUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
	cardTemplateIds: z.string().transform((val) =>
		val
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean)
			.map(Number)
			.filter((n) => !Number.isNaN(n))
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
										<Textarea {...field} placeholder="Bộ sưu tập gồm các thẻ huyền thoại..." rows={2} />
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
										<Input {...field} placeholder="1, 2, 5, 12, 37" className="font-stats" />
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
							<Button type="submit" disabled={createMut.isPending} className="gap-2">
								{createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
						{collections.length} collection • Bộ sưu tập hệ thống áp dụng cho người dùng
					</p>
				</div>
				<Button onClick={() => setModalOpen(true)} className="gap-2">
					<Plus className="h-4 w-4" />
					Tạo Collection
				</Button>
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
						value: collections.reduce((sum, c) => sum + (c.cardTemplateIds?.length ?? 0), 0),
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
							<p className="text-xs text-muted-foreground mt-0.5 truncate">{stat.label}</p>
						</div>
					</div>
				))}
			</div>

			{/* ── Collections Grid ── */}
			{isLoading ? (
				<div className="flex items-center justify-center h-48">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
				</div>
			) : collections.length === 0 ? (
				<div className="glass-card rounded-xl flex flex-col items-center justify-center h-48 text-muted-foreground">
					<BookOpen className="h-8 w-8 mb-2 opacity-30" />
					<p>Chưa có Admin Collection nào. Hãy tạo collection đầu tiên!</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{collections.map((c) => (
						<div
							key={c.id}
							className="glass-card rounded-xl overflow-hidden group transition-all duration-200 hover:bg-white/4"
						>
							{/* Cover image or placeholder */}
							<div className="relative h-28 bg-linear-to-br from-primary/10 to-secondary/10 overflow-hidden">
								{c.coverImageUrl ? (
									<img
										src={c.coverImageUrl}
										alt={c.name}
										className="w-full h-full object-cover opacity-70"
									/>
								) : (
									<div className="flex items-center justify-center h-full">
										<Image className="h-10 w-10 opacity-20 text-primary" />
									</div>
								)}
								<div className="absolute inset-0 bg-linear-to-t from-card/80 to-transparent" />
								<div className="absolute bottom-2 left-3">
									<Badge
										variant="outline"
										className={
											c.isVisible
												? "bg-green-500/10 text-green-400 border-green-500/20"
												: "text-muted-foreground"
										}
									>
										{c.isVisible ? (
											<Eye className="h-3 w-3 mr-1" />
										) : (
											<EyeOff className="h-3 w-3 mr-1" />
										)}
										{c.isVisible ? "Công khai" : "Ẩn"}
									</Badge>
								</div>
							</div>

							<div className="p-4 space-y-3">
								<div>
									<h3 className="font-heading font-semibold text-foreground truncate">{c.name}</h3>
									{c.description && (
										<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
											{c.description}
										</p>
									)}
								</div>

								<div className="flex items-center gap-4 text-xs text-muted-foreground">
									<span className="flex items-center gap-1">
										<Layers className="h-3.5 w-3.5" />
										<span className="font-stats">{c.cardTemplateIds?.length ?? 0}</span> thẻ
									</span>
									<span className="flex items-center gap-1">
										<Users className="h-3.5 w-3.5" />
										<span className="font-stats">{c.appliedToUserCount ?? 0}</span> users
									</span>
								</div>

								<div className="flex items-center justify-end pt-1">
									<Button
										variant="outline"
										size="sm"
										className="gap-1.5 text-xs border-border hover:border-primary/50"
										onClick={() =>
											toggleMut.mutate({ id: c.id, isVisible: !c.isVisible })
										}
										disabled={toggleMut.isPending}
									>
										{c.isVisible ? (
											<>
												<EyeOff className="h-3.5 w-3.5" />
												Ẩn
											</>
										) : (
											<>
												<Eye className="h-3.5 w-3.5" />
												Công khai
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* ── Modal ── */}
			<CollectionFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
		</div>
	);
}
