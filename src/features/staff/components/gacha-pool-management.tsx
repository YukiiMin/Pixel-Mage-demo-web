"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Edit2,
	Image as ImageIcon,
	LoaderCircle,
	Package,
	PlusCircle,
	Save,
	Search,
	Trash2,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAdminUpload } from "@/features/staff/hooks/use-admin-upload";
import { apiRequest } from "@/lib/api-config";
import type {
	ProductRequestDTO,
	ProductResponse,
} from "@/features/staff/types/catalog";

function ProductModal({
	product,
	mode = "edit",
	onClose,
}: {
	product?: ProductResponse;
	mode?: "create" | "edit";
	onClose: () => void;
}) {
	const { uploadImage, isUploading } = useAdminUpload();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<ProductRequestDTO>({
		name: product?.name || "",
		description: product?.description || "",
		price: product?.price || 0,
		imageUrl: product?.imageUrl || "",
	});

	const updateProductMutation = useMutation({
		mutationFn: (data: ProductRequestDTO) =>
			apiRequest(`/api/products/${product?.productId}`, {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			toast.success("Cập nhật sản phẩm thành công!");
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			onClose();
		},
		onError: (err: any) => {
			toast.error(`Lỗi: ${err.message}`);
		},
	});

	const createProductMutation = useMutation({
		mutationFn: (data: ProductRequestDTO) =>
			apiRequest(`/api/products`, {
				method: "POST",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			toast.success("Tạo sản phẩm thành công!");
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			onClose();
		},
		onError: (err: any) => {
			toast.error(`Lỗi: ${err.message}`);
		},
	});

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = await uploadImage(file, "products");
		if (url) {
			setFormData((prev) => ({ ...prev, imageUrl: url }));
		}
	};

	const handleSubmit = () => {
		if (!formData.name) {
			toast.error("Vui lòng nhập tên sản phẩm");
			return;
		}
		if (mode === "create") {
			createProductMutation.mutate(formData);
		} else {
			updateProductMutation.mutate(formData);
		}
	};

	const isLoading =
		updateProductMutation.isPending || createProductMutation.isPending;

	return (
		<DialogContent className="max-w-2xl p-0 border-border/50 glass-card bg-background/95 backdrop-blur-xl">
			<DialogHeader className="p-6 pb-4 border-b border-border/40">
				<DialogTitle className="text-2xl font-bold gradient-gold-purple">
					{mode === "create"
						? "Tạo Product / Gacha Pack Mới"
						: `Chỉnh sửa: ${product?.name}`}
				</DialogTitle>
				<DialogDescription>
					Quản lý thông tin chung của Product (Gacha Pack).
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="max-h-[70vh] p-6">
				<div className="space-y-6 pb-6">
					{/* Pack Image Upload */}
					<div className="flex flex-col md:flex-row gap-6 items-start">
						<div className="w-full md:w-1/3 flex flex-col gap-3">
							<h3 className="text-sm font-bold flex items-center gap-2">
								<ImageIcon className="h-4 w-4 text-primary" />
								Ảnh Bìa
							</h3>
							<div className="relative aspect-3/4 w-full rounded-xl border-2 border-dashed border-border/50 bg-secondary/20 flex flex-col items-center justify-center overflow-hidden group">
								{formData.imageUrl ? (
									<img
										src={formData.imageUrl}
										alt="Cover"
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="text-muted-foreground flex flex-col items-center">
										<ImageIcon className="h-8 w-8 mb-2 opacity-50" />
										<span className="text-sm text-center">Chưa có ảnh</span>
									</div>
								)}

								<div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
									<label className="cursor-pointer flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors">
										{isUploading ? (
											<LoaderCircle className="h-6 w-6 animate-spin" />
										) : (
											<Upload className="h-6 w-6" />
										)}
										<span className="text-sm font-medium">
											{isUploading ? "Đang tải..." : "Tải ảnh lên"}
										</span>
										<input
											type="file"
											className="hidden"
											accept="image/*"
											onChange={handleImageChange}
											disabled={isUploading}
										/>
									</label>
								</div>
							</div>
						</div>

						{/* Form Info */}
						<div className="flex-1 w-full space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-semibold">
									Tên Product / Pack
								</label>
								<input
									type="text"
									value={formData.name || ""}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="Ví dụ: Starter Tarot Pack"
									className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-none focus:border-primary transition-colors"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-semibold">Giá (VND)</label>
								<input
									type="number"
									value={formData.price || 0}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											price: Number(e.target.value),
										}))
									}
									className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-none focus:border-primary transition-colors font-mono"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-semibold">Mô tả chi tiết</label>
								<textarea
									rows={4}
									value={formData.description || ""}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder="Mô tả về pack này..."
									className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-none focus:border-primary transition-colors resize-none"
								/>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-6 border-t border-border/40">
						<button
							disabled={isLoading}
							onClick={onClose}
							className="px-5 py-2 rounded-lg font-medium border border-border hover:bg-secondary transition-colors focus:outline-none"
						>
							Hủy bỏ
						</button>
						<button
							disabled={isLoading}
							onClick={handleSubmit}
							className="px-5 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 transition-colors focus:outline-none"
						>
							{isLoading ? (
								<LoaderCircle className="h-4 w-4 animate-spin" />
							) : (
								<Save className="h-4 w-4" />
							)}
							{mode === "create" ? "Tạo Mới" : "Lưu Thay Đổi"}
						</button>
					</div>
				</div>
			</ScrollArea>
		</DialogContent>
	);
}

/**
 * Gacha Pool & Product Management Interface
 * Quản lý Product (Gacha Packs) - Phase 1: Tạo Product để có thể bán trên Marketplace
 */
export function GachaPoolManagement() {
	const queryClient = useQueryClient();
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editModalProduct, setEditModalProduct] =
		useState<ProductResponse | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(
		null,
	);

	const { data: products, isLoading } = useQuery({
		queryKey: ["admin", "products"],
		queryFn: () =>
			apiRequest<ProductResponse[]>("/api/products").then((r) => r.data || []),
	});

	const deleteMutation = useMutation({
		mutationFn: (productId: number) =>
			apiRequest(`/api/products/${productId}`, { method: "DELETE" }),
		onSuccess: () => {
			toast.success("Xóa sản phẩm thành công");
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			setDeleteTarget(null);
		},
		onError: (err: any) => {
			toast.error(`Lỗi xóa: ${err.message}`);
		},
	});

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						Quản Lý Sản Phẩm (Products / Packs)
					</h2>
					<p className="text-sm text-muted-foreground mt-0.5">
						{products?.length || 0} sản phẩm đang được niêm yết
					</p>
				</div>
				<button
					onClick={() => setCreateModalOpen(true)}
					className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
				>
					<PlusCircle className="h-4 w-4" />
					Tạo Product Mới
				</button>
			</div>

			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				{createModalOpen && (
					<ProductModal
						mode="create"
						onClose={() => setCreateModalOpen(false)}
					/>
				)}
			</Dialog>

			{isLoading ? (
				<div className="flex justify-center p-12 glass-card rounded-xl">
					<LoaderCircle className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<div className="glass-card rounded-xl overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="border-border hover:bg-transparent">
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Sản phẩm
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
									Thông tin
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">
									Giá bán
								</TableHead>
								<TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">
									Thao tác
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{products?.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center py-12 text-muted-foreground"
									>
										<Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
										<h3 className="text-base font-bold mb-1 text-foreground">
											Chưa có sản phẩm nào
										</h3>
										<p className="text-sm mb-4">
											Tạo product đầu tiên để bắt đầu bán trên hệ thống.
										</p>
										<button
											onClick={() => setCreateModalOpen(true)}
											className="inline-flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
										>
											<PlusCircle className="h-4 w-4" /> Tạo Product
										</button>
									</TableCell>
								</TableRow>
							) : (
								products?.map((product) => (
									<TableRow
										key={product.productId}
										className="border-border transition-colors duration-150 hover:bg-white/3"
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 shrink-0 rounded border border-border/50 bg-secondary overflow-hidden">
													{product.imageUrl ? (
														<img
															src={product.imageUrl}
															alt={product.name}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center opacity-30">
															<ImageIcon className="w-4 h-4" />
														</div>
													)}
												</div>
												<div>
													<p className="font-semibold text-foreground text-sm">
														{product.name}
													</p>
													<p className="text-xs text-muted-foreground">
														ID: {product.productId}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<p className="text-xs text-muted-foreground line-clamp-2 max-w-sm">
												{product.description || "Chưa có mô tả."}
											</p>
										</TableCell>
										<TableCell className="text-right">
											<span className="font-stats font-semibold text-primary">
												{new Intl.NumberFormat("vi-VN").format(product.price)} đ
											</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center justify-end gap-2">
												<Dialog
													open={
														editModalProduct?.productId === product.productId
													}
													onOpenChange={(isOpen) =>
														!isOpen && setEditModalProduct(null)
													}
												>
													<button
														onClick={() => setEditModalProduct(product)}
														title="Chỉnh sửa"
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
													>
														<Edit2 className="h-4 w-4" />
													</button>
													{editModalProduct?.productId ===
														product.productId && (
														<ProductModal
															product={product}
															mode="edit"
															onClose={() => setEditModalProduct(null)}
														/>
													)}
												</Dialog>
												<button
													onClick={() => setDeleteTarget(product)}
													title="Xoá"
													className="inline-flex items-center justify-center rounded-lg border border-destructive/20 p-1.5 text-destructive transition-colors hover:bg-destructive/10"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			)}

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={() => setDeleteTarget(null)}
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
							Xác nhận xoá sản phẩm
						</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn sắp xoá sản phẩm{" "}
							<span className="font-semibold text-foreground">
								{deleteTarget?.name}
							</span>
							. Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Huỷ</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deleteTarget) {
									deleteMutation.mutate(deleteTarget.productId);
								}
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending ? (
								<LoaderCircle className="h-4 w-4 animate-spin" />
							) : (
								"Xoá sản phẩm"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
