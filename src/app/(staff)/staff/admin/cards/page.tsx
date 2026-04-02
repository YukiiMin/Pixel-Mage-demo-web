import { AdminCardsPage } from "@/features/staff/components/admin-cards-page";

export const metadata = {
	title: "Card Manager — PixelMage Admin",
	description: "Quản lý card template, thiết kế và nội dung thẻ bài trong hệ thống PixelMage",
};

export default function AdminCardsRoute() {
	return <AdminCardsPage />;
}
