"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search, Edit2, Trash2, Image as ImageIcon, Upload, Save, X, LoaderCircle } from "lucide-react";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { CardTemplateSummaryResponse, ProductResponse } from "@/types/commerce";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminUpload } from "../../hooks/use-admin-upload";

function EditPoolModal({ product }: { product: ProductResponse }) {
	const { uploadImage, isUploading } = useAdminUpload();
	const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
	const [open, setOpen] = useState(false);

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = await uploadImage(file, "products");
		if (url) {
			setImageUrl(url);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors focus:outline-none">
					<Edit2 className="h-4 w-4" /> Edit Pool
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[85vh] p-0 border-border/50 glass-card bg-background/95 backdrop-blur-xl">
				<DialogHeader className="p-6 pb-4 border-b border-border/40">
					<DialogTitle className="text-2xl font-bold gradient-gold-purple">
						Cấu hình Gacha Pool: {product.name}
					</DialogTitle>
					<DialogDescription>
						Thêm/bớt thẻ, thay đổi ảnh Pack và thiết lập xác suất ra thẻ (Droprate).
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(85vh-100px)] p-6">
					<div className="space-y-8 pb-6">
						
						{/* Pack Image Upload */}
						<div className="flex flex-col md:flex-row gap-6 items-start">
							<div className="w-full md:w-1/3 flex flex-col gap-3">
								<h3 className="text-sm font-bold flex items-center gap-2">
									<ImageIcon className="h-4 w-4 text-primary" />
									Ảnh Pack (Cover)
								</h3>
								<div className="relative aspect-3/4 w-full rounded-xl border-2 border-dashed border-border/50 bg-secondary/20 flex flex-col items-center justify-center overflow-hidden group">
									{imageUrl ? (
										<img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
									) : (
										<div className="text-muted-foreground flex flex-col items-center">
											<ImageIcon className="h-8 w-8 mb-2 opacity-50" />
											<span className="text-sm">Chưa có ảnh</span>
										</div>
									)}
									
									<div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
										<label className="cursor-pointer flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors">
											{isUploading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
											<span className="text-sm font-medium">{isUploading ? "Đang tải..." : "Đổi ảnh"}</span>
											<input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
										</label>
									</div>
								</div>
							</div>

							{/* Config Tỉ Lệ */}
							<div className="flex-1 w-full space-y-4">
								<h3 className="text-lg font-bold flex items-center gap-2">
									Cấu hình Drop Rate Cơ Bản
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{[
										{ label: "COMMON", rate: "70%", color: "text-foreground" },
										{ label: "RARE", rate: "25%", color: "text-blue-500" },
										{ label: "LEGENDARY", rate: "5%", color: "text-yellow-500" },
									].map((r) => (
										<div key={r.label} className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col gap-2">
											<span className={`font-semibold text-sm ${r.color}`}>{r.label}</span>
											<input
												type="text"
												defaultValue={r.rate}
												className="bg-background border border-border rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-primary transition-colors w-full"
											/>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Danh sách thẻ đang có (Mock) */}
						<div className="pt-6 border-t border-border/40">
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
								<h3 className="text-lg font-bold flex items-center gap-2">
									Thẻ có trong Pool ({product.poolPreview?.length || 0}/78)
								</h3>
								<select className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
									<option>Framework: Rider-Waite-Smith</option>
									<option>Framework: Thoth</option>
								</select>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
								{product.poolPreview?.map((card) => (
									<div key={card.cardTemplateId} className="relative group rounded-lg border border-border bg-background p-2 transition-all hover:border-primary/50 cursor-pointer">
										<div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center gap-2 rounded-lg backdrop-blur-sm">
											<button className="p-2 bg-destructive/90 text-white rounded-full hover:bg-destructive shadow-lg transition-transform hover:scale-110">
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
										<img
											src={card.imagePath || "https://placehold.co/150x210?text=Card"}
											alt={card.name}
											className="w-full aspect-2/3 object-cover rounded-md mb-2"
										/>
										<p className="text-xs font-medium truncate">{card.name}</p>
										<span className="text-[10px] text-muted-foreground">{card.rarity}</span>
									</div>
								))}
								
								{/* Placeholder để add card */}
								<div className="rounded-lg border-2 border-dashed border-border/60 bg-secondary/10 p-2 flex flex-col items-center justify-center min-h-45 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
									<PlusCircle className="h-8 w-8 mb-2" />
									<span className="text-xs font-medium">Thêm thẻ mới</span>
								</div>
							</div>
						</div>
						
						{/* Nút lưu */}
						<div className="flex justify-end gap-3 pt-6 border-t border-border/40">
							<button onClick={() => setOpen(false)} className="px-5 py-2 rounded-lg font-medium border border-border hover:bg-secondary transition-colors focus:outline-none">
								Hủy bỏ
							</button>
							<button onClick={() => setOpen(false)} className="px-5 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 transition-colors focus:outline-none">
								<Save className="h-4 w-4" /> Lưu cấu hình
							</button>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}


/**
 * Gacha Pool & Product Management Interface
 * Màn hình quản lý Product và Pool Gacha cho Admin/Staff
 */
export function GachaPoolManagement() {
	const { data: products, isLoading } = useQuery({
		queryKey: ["admin", "products"],
		queryFn: () => apiRequest<ProductResponse[]>("/api/products").then((r) => r.data),
	});

	if (isLoading) {
		return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách Product...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Product & Gacha Pool Management</h2>
					<p className="text-sm text-muted-foreground">
						Quản lý Marketplace Products và Gacha Pool (Demo preview)
					</p>
				</div>
				<button className="btn-primary flex items-center gap-2">
					<PlusCircle className="h-4 w-4" /> Tạo Product Mới
				</button>
			</div>

			<div className="grid gap-6">
				{products?.map((product) => (
					<div key={product.productId} className="glass-card rounded-xl border border-border/50 p-6 flex flex-col md:flex-row gap-6">
						
						{/* Product Info */}
						<div className="flex-1 space-y-4">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-xl font-bold">{product.name}</h3>
									<p className="text-sm text-muted-foreground">{product.description}</p>
								</div>
								<div className="text-right">
									<div className="text-xl font-stats font-bold text-primary">
										{new Intl.NumberFormat("vi-VN").format(product.price)} đ
									</div>
									<div className="text-sm rounded-full bg-secondary/50 px-2 py-1 mt-1 inline-block">
										Kho: {product.stockCount}
									</div>
								</div>
							</div>
							
							<div className="pt-4 border-t border-border/30">
								<h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
									<ImageIcon className="h-4 w-4 text-muted-foreground" />
									Gacha Pool Preview (Drops Config)
								</h4>
								
								{product.poolPreview && product.poolPreview.length > 0 ? (
									<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
										{product.poolPreview.map(card => (
											<div key={card.cardTemplateId} className="relative group rounded-lg border border-border bg-background p-2 transition-all hover:border-primary">
												<img 
													src={card.imagePath || "https://placehold.co/150x210?text=Card"}
													alt={card.name}
													className="w-full aspect-2/3 object-cover rounded-md mb-2"
												/>
												<p className="text-xs font-medium truncate">{card.name}</p>
												<span className="text-[10px] text-muted-foreground">{card.rarity}</span>
											</div>
										))}
									</div>
								) : (
									<div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-4 italic text-center">
										Chưa có pool preview config cho product này.
									</div>
								)}
							</div>
						</div>

						{/* Actions */}
						<div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6 w-full md:w-40">
							<EditPoolModal product={product} />

							<button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/20 transition-colors">
								<Trash2 className="h-4 w-4" /> Delete
							</button>
						</div>

					</div>
				))}
			</div>
		</div>
	);
}
