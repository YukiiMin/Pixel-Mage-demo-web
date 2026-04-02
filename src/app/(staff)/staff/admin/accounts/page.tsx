import { AdminAccountsPage } from "@/features/staff/components/admin-accounts-page";

export const metadata = {
	title: "Account Management — PixelMage Admin",
	description: "Quản lý tài khoản người dùng và nhân viên trong hệ thống PixelMage",
};

export default function AdminAccountsRoute() {
	return <AdminAccountsPage />;
}
