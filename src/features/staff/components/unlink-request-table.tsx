"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ApproveModal } from "@/features/staff/components/approve-modal";
import { RejectModal } from "@/features/staff/components/reject-modal";
import { StatusBadge } from "@/features/staff/components/status-badge";
import { cn } from "@/lib/utils";
import type { UnlinkRequest, UnlinkRequestStatus } from "@/types/staff";

type FilterTab = "ALL" | UnlinkRequestStatus;

const FILTER_TABS: { label: string; value: FilterTab }[] = [
	{ label: "Tất cả", value: "ALL" },
	{ label: "Chờ xử lý", value: "PENDING" },
	{ label: "Đã xác nhận", value: "EMAIL_CONFIRMED" },
	{ label: "Đã duyệt", value: "APPROVED" },
	{ label: "Đã từ chối", value: "REJECTED" },
];

interface UnlinkRequestTableProps {
	requests: UnlinkRequest[];
	isLoading: boolean;
	isError: boolean;
}

export function UnlinkRequestTable({
	requests,
	isLoading,
	isError,
}: UnlinkRequestTableProps) {
	const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
	const [approveTarget, setApproveTarget] = useState<UnlinkRequest | null>(
		null,
	);
	const [rejectTarget, setRejectTarget] = useState<UnlinkRequest | null>(null);

	const filtered =
		activeFilter === "ALL"
			? requests
			: requests.filter((r) => r.status === activeFilter);

	const actionableStatuses: UnlinkRequestStatus[] = [
		"PENDING",
		"EMAIL_CONFIRMED",
	];

	if (isLoading) {
		return (
			<div className="space-y-2" data-testid="table-skeleton">
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
					<Skeleton key={i} className="h-12 w-full rounded-md" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div
				className="text-center py-12 text-[hsl(220_10%_65%)]"
				data-testid="table-error"
			>
				Không thể tải dữ liệu. Hệ thống tạm gián đoạn, thử lại sau.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filter tabs */}
			<div
				className="flex flex-wrap gap-2 border-b border-[hsl(230_20%_22%)] pb-3"
				role="tablist"
				aria-label="Lọc theo trạng thái"
			>
				{FILTER_TABS.map((tab) => (
					<button
						type="button"
						key={tab.value}
						role="tab"
						aria-selected={activeFilter === tab.value}
						data-testid={`filter-tab-${tab.value.toLowerCase()}`}
						onClick={() => setActiveFilter(tab.value)}
						className={cn(
							"px-3 py-1.5 text-sm rounded-md transition-colors duration-150 font-body",
							activeFilter === tab.value
								? "bg-[hsl(230_20%_22%)] text-foreground"
								: "text-[hsl(220_10%_65%)] hover:bg-[hsl(230_15%_18%)]",
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Table */}
			<div className="rounded-lg border border-[hsl(230_20%_22%/0.5)] overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="border-b border-[hsl(230_20%_22%)] hover:bg-transparent">
							<TableHead className="text-[hsl(220_10%_65%)] font-medium w-16">
								ID
							</TableHead>
							<TableHead className="text-[hsl(220_10%_65%)] font-medium">
								Người dùng
							</TableHead>
							<TableHead className="text-[hsl(220_10%_65%)] font-medium">
								Thẻ
							</TableHead>
							<TableHead className="text-[hsl(220_10%_65%)] font-medium">
								Ngày yêu cầu
							</TableHead>
							<TableHead className="text-[hsl(220_10%_65%)] font-medium">
								Trạng thái
							</TableHead>
							<TableHead className="text-[hsl(220_10%_65%)] font-medium text-right">
								Hành động
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center py-12 text-[hsl(220_10%_65%)]"
									data-testid="empty-state"
								>
									Không có yêu cầu nào phù hợp.
								</TableCell>
							</TableRow>
						) : (
							filtered.map((req) => (
								<TableRow
									key={req.id}
									data-testid={`unlink-row-${req.id}`}
									className={cn(
										"border-b border-[hsl(230_20%_22%/0.4)]",
										// Internal tool: hover = 150ms background tint — KHÔNG glow
										"transition-colors duration-150 hover:bg-[hsl(230_30%_16%)]",
									)}
								>
									<TableCell className="text-[hsl(220_10%_65%)] font-stats text-xs">
										#{req.id}
									</TableCell>
									<TableCell>
										<div>
											<p className="text-sm text-foreground font-medium">
												{req.userName ?? <span className="text-muted-foreground italic">Chưa có tên</span>}
											</p>
											<p className="text-xs text-[hsl(220_10%_55%)]">
												{req.userEmail ?? "—"}
											</p>
										</div>
									</TableCell>
									<TableCell className="font-mono text-xs text-foreground/80">
										{req.cardName ?? req.nfcUid ?? "—"}
									</TableCell>
									<TableCell className="text-sm text-[hsl(220_10%_65%)] font-stats">
										{new Date(req.createdAt ?? req.requestedAt ?? Date.now()).toLocaleDateString("vi-VN")}
									</TableCell>
									<TableCell>
										<StatusBadge status={req.status} />
									</TableCell>
									<TableCell className="text-right">
										{actionableStatuses.includes(req.status) ? (
											<div className="flex gap-2 justify-end">
												<Button
													variant="ghost"
													size="sm"
													data-testid={`approve-btn-${req.id}`}
													onClick={() => setApproveTarget(req)}
													className="text-[hsl(150_60%_55%)] hover:text-[hsl(150_60%_65%)] hover:bg-[hsl(150_40%_15%)] h-7 px-2 text-xs"
												>
													✓ Duyệt
												</Button>
												<Button
													variant="ghost"
													size="sm"
													data-testid={`reject-btn-${req.id}`}
													onClick={() => setRejectTarget(req)}
													className="text-[hsl(0_70%_60%)] hover:text-[hsl(0_70%_70%)] hover:bg-[hsl(0_50%_15%)] h-7 px-2 text-xs"
												>
													✗ Từ chối
												</Button>
											</div>
										) : (
											<span className="text-xs text-[hsl(220_10%_45%)]">—</span>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Modals */}
			<ApproveModal
				request={approveTarget}
				open={approveTarget !== null}
				onOpenChange={(open) => {
					if (!open) setApproveTarget(null);
				}}
			/>
			<RejectModal
				request={rejectTarget}
				open={rejectTarget !== null}
				onOpenChange={(open) => {
					if (!open) setRejectTarget(null);
				}}
			/>
		</div>
	);
}
