import { UnlinkRequestsPageClient } from "@/features/staff/components/unlink-requests-page";

export const metadata = {
	title: "Yêu Cầu Unlink | PixelMage Staff",
	description: "Quản lý yêu cầu tháo liên kết NFC card của người dùng.",
};

export default function StaffUnlinkRequestsPage() {
	return <UnlinkRequestsPageClient />;
}
