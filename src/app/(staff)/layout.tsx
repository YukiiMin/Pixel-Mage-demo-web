import { StaffShell } from "@/features/staff/components/staff-shell";

export default function StaffLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <StaffShell>{children}</StaffShell>;
}
