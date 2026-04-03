"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Search, Edit2, Trash2, Image as ImageIcon, Upload, Save, LoaderCircle, Package } from "lucide-react";
import { apiRequest } from "@/lib/api-config";
import type { ProductResponse, ProductRequestDTO } from "@/types/admin-catalog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminUpload } from "@/features/admin/hooks/use-admin-upload";
import { toast } from "sonner";

function ProductModal({ product, mode = "edit", onClose }: { product?: ProductResponse, mode?: "create" | "edit", onClose: () => void }) {
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
		}
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
		}
	});

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = await uploadImage(file, "products");
		if (url) {
			setFormData(prev => ({ ...prev, imageUrl: url }));
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

	const isLoading = updateProductMutation.isPending || createProductMutation.isPending;

	return (
		<DialogContent className="max-w-2xl p-0 border-border/50 glass-card bg-background/95 backdrop-blur-xl">
			<DialogHeader className="p-6 pb-4 border-b border-border/40">
				<DialogTitle className="text-2xl font-bold gradient-gold-purple">
					{mode === "create" ? "Tạo Product / Gacha Pack Mới" : `Chỉnh sửa: ${product?.name}`}
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
									<img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover" />
								) : (
									<div className="text-muted-foreground flex flex-col items-center">
										<ImageIcon className="h-8 w-8 mb-2 opacity-50" />
										<span className="text-sm text-center">Chưa có ảnh</span>
									</div>
								)}
								
								<div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
									<label className="cursor-pointer flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors">
										{isUploading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
										<span className="text-sm font-medium">{isUploading ? "Đang tải..." : "Tải ảnh lên"}</span>
										<input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
									</label>
								</div>
							</div>
						</div>

						{/* Form Info */}
						<div className="flex-1 w-full space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-semibold">Tên Product / Pack</label>
								<input
									type="text"
									value={formData.name || ""}
									onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
									placeholder="Ví dụ: Starter Tarot Pack"
									className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-none focus:border-primary transition-colors"
								/>
							</div>
							
							<div className="space-y-2">
								<label className="text-sm font-semibold">Giá (VND)</label>
								<input
									type="number"
									value={formData.price || 0}
									onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
									className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-none focus:border-primary transition-colors font-mono"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-semibold">Mô tả chi tiết</label>
								<textarea
									rows={4}
									value={formData.description || ""}
									onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
									placeholder="Mô tả về pack này..."
									className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-none focus:border-primary transition-colors resize-none"
								/>
							</div>
						</div>
					</div>
					
					{/* Actions */}
					<div className="flex justify-end gap-3 pt-6 border-t border-border/40">
						<button disabled={isLoading} onClick={onClose} className="px-5 py-2 rounded-lg font-medium border border-border hover:bg-secondary transition-colors focus:outline-none">
							Hủy bỏ
						</button>
						<button disabled={isLoading} onClick={handleSubmit} className="px-5 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 transition-colors focus:outline-none">
							{isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
	const [editModalProduct, setEditModalProduct] = useState<ProductResponse | null>(null);

	const { data: products, isLoading } = useQuery({
		queryKey: ["admin", "products"],
		queryFn: () => apiRequest<ProductResponse[]>("/api/products").then((r) => r.data || []),
	});

	const deleteMutation = useMutation({
		mutationFn: (productId: number) => 
			apiRequest(`/api/products/${productId}`, { method: "DELETE" }),
		onSuccess: () => {
			toast.success("Xóa sản phẩm thành công");
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
		},
		onError: (err: any) => {
			toast.error(`Lỗi xóa: ${err.message}`);
		}
	});

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Quản Lý Sản Phẩm (Products / Packs)</h2>
					<p className="text-sm text-muted-foreground">
						Quản lý danh sách các gói thẻ (Pack) bán trên Marketplace.
					</p>
				</div>
				<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
					<DialogTrigger asChild>
						<button className="btn-primary flex items-center gap-2 shrink-0">
							<PlusCircle className="h-4 w-4" /> Tạo Product Mới
						</button>
					</DialogTrigger>
					{createModalOpen && <ProductModal mode="create" onClose={() => setCreateModalOpen(false)} />}
				</Dialog>
			</div>

			{isLoading ? (
				<div className="flex justify-center p-12">
					<LoaderCircle className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : products?.length === 0 ? (
				<div className="text-center p-12 border border-dashed rounded-xl bg-secondary/10">
					<Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
					<h3 className="text-xl font-bold mb-2">Chưa có sản phẩm nào</h3>
					<p className="text-muted-foreground mb-4">Tạo product đầu tiên để bắt đầu bán trên hệ thống.</p>
					<button onClick={() => setCreateModalOpen(true)} className="btn-primary inline-flex items-center gap-2">
						<PlusCircle className="h-4 w-4" /> Tạo Product
					</button>
				</div>
			) : (
				<div className="grid gap-6">
					{products?.map((product) => (
						<div key={product.productId} className="glass-card rounded-xl border border-border/50 p-6 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-colors">
							
							{/* Product Image */}
							<div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-border/50 bg-secondary">
								{product.imageUrl ? (
									<img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full flex items-center justify-center opacity-30">
										<ImageIcon className="w-8 h-8" />
									</div>
								)}
							</div>

							{/* Product Info */}
							<div className="flex-1 space-y-2">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-xl font-bold">{product.name}</h3>
										<p className="text-sm text-muted-foreground max-w-2xl">{product.description || "Chưa có mô tả."}</p>
									</div>
									<div className="text-right shrink-0">
										<div className="text-xl font-stats font-bold text-primary">
											{new Intl.NumberFormat("vi-VN").format(product.price)} đ
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											ID: {product.productId}
										</div>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6 w-full md:w-32">
								<Dialog open={editModalProduct?.productId === product.productId} onOpenChange={(isOpen) => !isOpen && setEditModalProduct(null)}>
									<DialogTrigger asChild>
										<button onClick={() => setEditModalProduct(product)} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors focus:outline-none">
											<Edit2 className="h-4 w-4" /> Sửa
										</button>
									</DialogTrigger>
									{editModalProduct?.productId === product.productId && (
										<ProductModal product={product} mode="edit" onClose={() => setEditModalProduct(null)} />
									)}
								</Dialog>

								<button 
									onClick={() => {
										if (confirm("Bạn có chắc muốn xóa product này không? Không thể hoàn tác.")) {
											deleteMutation.mutate(product.productId);
										}
									}}
									className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/20 transition-colors"
								>
									<Trash2 className="h-4 w-4" /> Xóa
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
