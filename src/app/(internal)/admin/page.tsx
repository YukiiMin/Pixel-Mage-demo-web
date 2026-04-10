import { redirect } from "next/navigation";

export const metadata = {
	title: "Admin Dashboard — PixelMage",
	description: "Bảng điều khiển quản trị hệ thống PixelMage",
};

export default function AdminPage() {
	// Redirect to products page as default staff landing
	redirect("/admin/dashboard");
}
