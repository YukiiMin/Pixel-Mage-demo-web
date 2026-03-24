"use client";

import { cn } from "@/lib/utils";
import type { UnlinkRequestStatus } from "@/types/staff";

interface StatusBadgeProps {
	status: UnlinkRequestStatus;
}

const statusConfig: Record<
	UnlinkRequestStatus,
	{ label: string; className: string }
> = {
	PENDING: {
		label: "Chờ xử lý",
		className: "text-[hsl(220_10%_65%)] bg-[hsl(230_15%_20%)]",
	},
	EMAIL_CONFIRMED: {
		label: "Đã xác nhận",
		className: "text-[hsl(220_40%_75%)] bg-[hsl(220_40%_20%)]",
	},
	APPROVED: {
		label: "Đã duyệt",
		className: "text-[hsl(150_60%_55%)] bg-[hsl(150_40%_15%)]",
	},
	REJECTED: {
		label: "Đã từ chối",
		className: "text-[hsl(0_70%_60%)] bg-[hsl(0_50%_15%)]",
	},
};

export function StatusBadge({ status }: StatusBadgeProps) {
	const config = statusConfig[status];
	return (
		<span
			data-testid={`status-badge-${status.toLowerCase()}`}
			className={cn(
				"inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium",
				"font-stats",
				config.className,
			)}
		>
			{config.label}
		</span>
	);
}
