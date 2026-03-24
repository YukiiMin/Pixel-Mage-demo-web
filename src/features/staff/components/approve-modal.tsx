"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApproveUnlink } from "@/features/staff/hooks/use-approve-unlink";
import type { UnlinkRequest } from "@/types/staff";

interface ApproveModalProps {
	request: UnlinkRequest | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ApproveModal({
	request,
	open,
	onOpenChange,
}: ApproveModalProps) {
	const approveMutation = useApproveUnlink();

	function handleConfirm() {
		if (!request) return;
		approveMutation.mutate(request.id, {
			onSuccess: () => onOpenChange(false),
		});
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent
				className="glass-heavy border border-[hsl(230_20%_22%/0.5)]"
				data-testid="approve-confirm-dialog"
			>
				<AlertDialogHeader>
					<AlertDialogTitle className="text-foreground">
						Xác nhận phê duyệt
					</AlertDialogTitle>
					<AlertDialogDescription className="text-[hsl(220_10%_65%)]">
						Phê duyệt yêu cầu unlink thẻ{" "}
						<span className="text-foreground font-medium">
							{request?.cardName}
						</span>{" "}
						của{" "}
						<span className="text-foreground font-medium">
							{request?.userName}
						</span>
						? Hành động này không thể hoàn tác.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						className="border-[hsl(230_20%_22%)] text-[hsl(220_10%_65%)] hover:bg-[hsl(230_15%_20%)]"
						disabled={approveMutation.isPending}
					>
						Huỷ
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={approveMutation.isPending}
						className="bg-[hsl(150_60%_45%)] hover:bg-[hsl(150_60%_38%)] text-white"
						data-testid="approve-confirm-btn"
					>
						{approveMutation.isPending ? "Đang xử lý..." : "Phê duyệt"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
