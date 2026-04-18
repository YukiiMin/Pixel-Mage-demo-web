import { AdminProductPackHub } from "@/features/staff";

export const metadata = {
	title: "Sản Phẩm & Pack | PixelMage Admin",
	description: "Quản lý sản phẩm (Gacha Pack & Single Card) và kho Pack vật lý",
};

export default function ProductPackManagementPage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<AdminProductPackHub />
		</main>
	);
}
