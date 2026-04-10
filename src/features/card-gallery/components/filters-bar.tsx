"use client";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CardGalleryFilters, Rarity } from "@/features/card-gallery/types";
import { Filter, Search } from "lucide-react";

interface FiltersBarProps {
	filters: CardGalleryFilters;
	onFiltersChange: (filters: CardGalleryFilters) => void;
}

export function FiltersBar({ filters, onFiltersChange }: FiltersBarProps) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Tìm kiếm lá bài..."
					value={filters.search || ""}
					onChange={(e) =>
						onFiltersChange({ ...filters, search: e.target.value })
					}
					className="pl-10 glass-card border-border/40"
				/>
			</div>

			<div className="flex gap-2">
				<Select
					value={filters.rarity || "ALL"}
					onValueChange={(value: any) =>
						onFiltersChange({
							...filters,
							rarity: value === "ALL" ? undefined : value,
						})
					}
				>
					<SelectTrigger className="w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tất cả</SelectItem>
						<SelectItem value="COMMON">Common</SelectItem>
						<SelectItem value="RARE">Rare</SelectItem>
						<SelectItem value="LEGENDARY">Legendary</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={filters.sortBy || "name"}
					onValueChange={(value: any) =>
						onFiltersChange({ ...filters, sortBy: value })
					}
				>
					<SelectTrigger className="w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="name">Tên</SelectItem>
						<SelectItem value="rarity">Độ hiếm</SelectItem>
						<SelectItem value="dropRate">Tỷ lệ</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
