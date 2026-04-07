"use client";

import { motion } from "framer-motion";
import { Package, Search, Sparkles, Star, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useShop } from "@/features/marketplace/hooks/use-shop";
import { ShopProductCard } from "@/features/marketplace/components/shop-product-card";
import { ProductDetailModal } from "@/features/marketplace/components/product-detail-modal";
import type { ProductResponse } from "@/types/commerce";

export function ShopPage() {
	const {
		products,
		isLoading,
		isError,
		searchTerm,
		setSearchTerm,
		sortBy,
		setSortBy,
		filterLimited,
		setFilterLimited,
		stats,
	} = useShop();

	const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);

	return (
		<div className="min-h-screen pb-20">
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-linear-to-b from-purple-950/50 via-background to-background" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

				<div className="container relative mx-auto max-w-6xl px-4 py-12 md:py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2, duration: 0.4 }}
							className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
						>
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="text-sm font-medium text-primary">PixelMage Card Shop</span>
						</motion.div>

						<h1
							className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
							style={{ fontFamily: "Fruktur, var(--font-heading)" }}
						>
							Mỗi Pack là một<span className="text-primary"> bí ẩn</span>
						</h1>
						<p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
							Khám phá các gói thẻ bài Tarot vật lý được RNG ngẫu nhiên.
							Mở hộp để nhận các lá bài có thể gắn NFC!
						</p>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.4 }}
							className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2"
						>
							<Package className="h-4 w-4 text-amber-500" />
							<span className="text-sm font-medium text-amber-500">
								🃏 {stats.totalStock} packs còn lại
							</span>
						</motion.div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.5 }}
						className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
					>
						<div className="glass-card rounded-xl border border-border/50 p-4 text-center">
							<div className="mb-1 flex items-center justify-center gap-2 text-muted-foreground">
								<TrendingUp className="h-4 w-4" />
								<span className="text-xs">Sản phẩm</span>
							</div>
							<p className="font-stats text-2xl font-bold text-foreground">{stats.totalProducts}</p>
						</div>
						<div className="glass-card rounded-xl border border-border/50 p-4 text-center">
							<div className="mb-1 flex items-center justify-center gap-2 text-muted-foreground">
								<Package className="h-4 w-4" />
								<span className="text-xs">Tồn kho</span>
							</div>
							<p className="font-stats text-2xl font-bold text-foreground">{stats.totalStock}</p>
						</div>
						<div className="glass-card rounded-xl border border-border/50 p-4 text-center">
							<div className="mb-1 flex items-center justify-center gap-2 text-muted-foreground">
								<Star className="h-4 w-4" />
								<span className="text-xs">Limited</span>
							</div>
							<p className="font-stats text-2xl font-bold text-foreground">{stats.limitedCount}</p>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Filters & Search */}
			<section className="container mx-auto max-w-6xl px-4 py-6">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.4 }}
					className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Tìm kiếm pack..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-background/50"
						/>
					</div>
					<div className="flex items-center gap-3">
						<Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
							<SelectTrigger className="w-40 bg-background/50">
								<SelectValue placeholder="Sắp xếp" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="newest">Mới nhất</SelectItem>
								<SelectItem value="price-asc">Giá tăng dần</SelectItem>
								<SelectItem value="price-desc">Giá giảm dần</SelectItem>
								<SelectItem value="stock">Còn hàng</SelectItem>
							</SelectContent>
						</Select>
						<button
							onClick={() => setFilterLimited(!filterLimited)}
							className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
								filterLimited
									? "border-amber-500/50 bg-amber-500/10 text-amber-500"
									: "border-border bg-background/50 text-muted-foreground hover:text-foreground"
							}`}
						>
							<Star className="h-4 w-4" />
							Limited
						</button>
					</div>
				</motion.div>
			</section>

			{/* Product Grid */}
			<section className="container mx-auto max-w-6xl px-4 py-6">
				{isLoading ? (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="glass-card rounded-2xl border border-border/50 p-5">
								<Skeleton className="mb-4 h-40 w-full rounded-xl" />
								<Skeleton className="mb-2 h-6 w-3/4" />
								<Skeleton className="mb-4 h-4 w-full" />
								<div className="flex items-center justify-between">
									<Skeleton className="h-6 w-24" />
									<Skeleton className="h-10 w-28" />
								</div>
							</div>
						))}
					</div>
				) : isError ? (
					<div className="py-20 text-center">
						<p className="text-muted-foreground">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
					</div>
				) : products.length === 0 ? (
					<div className="py-20 text-center">
						<Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-lg font-medium text-foreground">Không tìm thấy sản phẩm</p>
						<p className="text-sm text-muted-foreground">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
					</div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
					>
						{products.map((product, index) => (
							<ShopProductCard
								key={product.productId}
								product={product}
								onSelect={() => setSelectedProduct(product)}
								index={index}
							/>
						))}
					</motion.div>
				)}
			</section>

			{/* Product Detail Modal */}
			<ProductDetailModal
				product={selectedProduct}
				open={!!selectedProduct}
				onClose={() => setSelectedProduct(null)}
			/>
		</div>
	);
}
