import { GachaPoolManagement } from "@/features/staff";

export const metadata = {
	title: "Product Management | PixelMage",
	description: "Manage Gacha Pools and Marketplace Products",
};

export default function ProductManagementPage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<GachaPoolManagement />
		</main>
	);
}
