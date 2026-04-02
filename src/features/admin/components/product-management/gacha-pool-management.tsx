"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { CardTemplateSummaryResponse, ProductResponse } from "@/types/commerce";

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
						<div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
							<button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">
								<Edit2 className="h-4 w-4" /> Edit Pool
							</button>
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
