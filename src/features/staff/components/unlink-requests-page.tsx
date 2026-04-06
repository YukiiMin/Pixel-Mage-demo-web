"use client";

import { UnlinkRequestTable } from "@/features/staff/components/unlink-request-table";
import { useUnlinkRequests } from "@/features/staff/hooks/use-unlink-requests";

export function UnlinkRequestsPageClient() {
	const { data: requests = [], isLoading, isError } = useUnlinkRequests();
	const PENDING_COUNT = requests.filter((r) => r.status === "PENDING").length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-heading font-semibold gradient-gold-purple">
					Quản lý Yêu Cầu Unlink
				</h2>
				<p className="text-sm text-muted-foreground mt-0.5">
					{requests.length} yêu cầu • {PENDING_COUNT} đang chờ xử lý
				</p>
			</div>

			{/* Table */}
			<div className="glass-card rounded-xl overflow-hidden p-0">
				<UnlinkRequestTable
					requests={requests}
					isLoading={isLoading}
					isError={isError}
				/>
			</div>
		</div>
	);
}
