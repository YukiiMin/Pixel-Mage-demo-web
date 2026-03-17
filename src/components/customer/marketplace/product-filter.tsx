"use client";

import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ProductSort } from "@/hooks/ui/use-marketplace";
import type { ProductCategory, ProductRarity } from "@/types/commerce";

interface ProductFilterProps {
	searchTerm: string;
	onSearchTermChange: (value: string) => void;
	category: ProductCategory | "all";
	onCategoryChange: (value: ProductCategory | "all") => void;
	rarity: ProductRarity | "all";
	onRarityChange: (value: ProductRarity | "all") => void;
	sortBy: ProductSort;
	onSortByChange: (value: ProductSort) => void;
	limitedOnly: boolean;
	onLimitedOnlyChange: (value: boolean) => void;
}

export function ProductFilter({
	searchTerm,
	onSearchTermChange,
	category,
	onCategoryChange,
	rarity,
	onRarityChange,
	sortBy,
	onSortByChange,
	limitedOnly,
	onLimitedOnlyChange,
}: ProductFilterProps) {
	return (
		<section className="glass-card rounded-2xl border-border/50 p-5 md:p-6">
			<div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
				<Filter className="h-4 w-4 text-primary" /> Bộ lọc Marketplace
			</div>

			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
				<div className="relative lg:col-span-2">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchTerm}
						onChange={(event) => onSearchTermChange(event.target.value)}
						placeholder="Tìm theo tên hoặc mô tả sản phẩm"
						className="pl-9"
					/>
				</div>

				<select
					value={category}
					onChange={(event) =>
						onCategoryChange(event.target.value as ProductCategory | "all")
					}
					className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="all">Tất cả danh mục</option>
					<option value="deck">Deck</option>
					<option value="booster">Booster</option>
					<option value="collectible">Collectible</option>
				</select>

				<select
					value={rarity}
					onChange={(event) =>
						onRarityChange(event.target.value as ProductRarity | "all")
					}
					className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="all">Tất cả độ hiếm</option>
					<option value="common">Common</option>
					<option value="rare">Rare</option>
					<option value="epic">Epic</option>
					<option value="legendary">Legendary</option>
				</select>
			</div>

			<div className="mt-3 grid gap-3 md:grid-cols-2">
				<select
					value={sortBy}
					onChange={(event) =>
						onSortByChange(event.target.value as ProductSort)
					}
					className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="newest">Mới nhất</option>
					<option value="price-asc">Giá tăng dần</option>
					<option value="price-desc">Giá giảm dần</option>
				</select>

				<div className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
					<span className="text-foreground">Chỉ hiển thị bản giới hạn</span>
					<Switch checked={limitedOnly} onCheckedChange={onLimitedOnlyChange} />
				</div>
			</div>
		</section>
	);
}
