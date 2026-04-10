import { UnlinkRequestsPageClient } from "@/features/staff";

export const metadata = {
	title: "Yêu Cầu Unlink | PixelMage Staff",
	description: "Quản lý yêu cầu tháo liên kết NFC card của người dùng.",
};

export default function StaffUnlinkRequestsPage() {
	return <UnlinkRequestsPageClient />;
}
