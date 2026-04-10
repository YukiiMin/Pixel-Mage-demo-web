import { redirect } from "next/navigation";

export const metadata = {
	title: "Staff Portal — PixelMage",
	description: "Cổng thông tin nhân viên PixelMage",
};

export default function StaffPage() {
	// Redirect to products page as default staff landing
	redirect("/staff/products");
}
