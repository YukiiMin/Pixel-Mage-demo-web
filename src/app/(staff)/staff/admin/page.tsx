import { AdminDashboard } from "@/features/staff/components/admin-dashboard";

export const metadata = {
	title: "Admin Dashboard — PixelMage",
	description: "Bảng điều khiển quản trị hệ thống PixelMage",
};

export default function AdminPage() {
	return <AdminDashboard />;
}
