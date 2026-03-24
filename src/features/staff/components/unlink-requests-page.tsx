"use client";

import { UnlinkRequestTable } from "@/features/staff/components/unlink-request-table";
import { useUnlinkRequests } from "@/features/staff/hooks/use-unlink-requests";

export function UnlinkRequestsPageClient() {
	const { data: requests = [], isLoading, isError } = useUnlinkRequests();

	return (
		<div className="min-h-screen bg-[hsl(235_52%_10%)] px-4 py-8 md:px-8">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Header */}
				<div>
					<h1
						className="text-2xl font-semibold text-foreground"
						style={{ fontFamily: "var(--font-body)" }}
					>
						Quản lý Yêu Cầu Unlink
					</h1>
					<p className="mt-1 text-sm text-[hsl(220_10%_65%)]">
						Duyệt hoặc từ chối các yêu cầu tháo liên kết NFC card.
					</p>
				</div>

				{/* Table */}
				<div className="glass-card p-6 rounded-xl">
					<UnlinkRequestTable
						requests={requests}
						isLoading={isLoading}
						isError={isError}
					/>
				</div>
			</div>
		</div>
	);
}
