"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductManagementTab } from "./product-pack/product-management-tab";
import { PackManagementTab } from "./product-pack/pack-management-tab";

// ═════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT — Main Hub
// ═════════════════════════════════════════════════════════════════════════════
export function AdminProductPackHub() {
	return (
		<div className="space-y-6">
			<div>
				<h1
					className="text-3xl font-bold text-foreground"
					style={{ fontFamily: "Fruktur, var(--font-heading)" }}
				>
					Quản Lý Sản Phẩm & Pack
				</h1>
				<p className="text-muted-foreground mt-1">
					Quản lý toàn bộ sản phẩm kinh doanh — Gacha Pack & Single Card, và quản lý
					kho Pack vật lý
				</p>
			</div>

			<Tabs defaultValue="products" className="space-y-4">
				<TabsList className="glass-card">
					<TabsTrigger value="products">🛒 Sản Phẩm (Product)</TabsTrigger>
					<TabsTrigger value="packs">📦 Pack Management</TabsTrigger>
				</TabsList>

				<TabsContent value="products">
					<ProductManagementTab />
				</TabsContent>

				<TabsContent value="packs">
					<PackManagementTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
