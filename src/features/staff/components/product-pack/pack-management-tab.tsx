"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackListSection } from "./pack-list-section";
import { PackCategorySection } from "./pack-category-section";

export function PackManagementTab() {
	return (
		<Tabs defaultValue="pack-list" className="space-y-4">
			<TabsList className="glass-card">
				<TabsTrigger value="pack-list">📦 Danh sách Pack</TabsTrigger>
				<TabsTrigger value="pack-category">⚙️ Pack Categories</TabsTrigger>
			</TabsList>
			<TabsContent value="pack-list">
				<PackListSection />
			</TabsContent>
			<TabsContent value="pack-category">
				<PackCategorySection />
			</TabsContent>
		</Tabs>
	);
}
