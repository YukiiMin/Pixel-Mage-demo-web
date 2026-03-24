"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRejectUnlink } from "@/features/staff/hooks/use-reject-unlink";
import type { UnlinkRequest } from "@/types/staff";

interface RejectModalProps {
	request: UnlinkRequest | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function RejectModal({ request, open, onOpenChange }: RejectModalProps) {
	const [staffNote, setStaffNote] = useState("");
	const rejectMutation = useRejectUnlink();

	const isSubmitDisabled = staffNote.trim() === "" || rejectMutation.isPending;

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			setStaffNote("");
		}
		onOpenChange(nextOpen);
	}

	function handleSubmit() {
		if (!request || isSubmitDisabled) return;
		rejectMutation.mutate(
			{ id: request.id, staffNote: staffNote.trim() },
			{
				onSuccess: () => {
					setStaffNote("");
					onOpenChange(false);
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="glass-heavy border border-[hsl(230_20%_22%/0.5)] sm:max-w-md"
				data-testid="reject-modal"
			>
				<DialogHeader>
					<DialogTitle className="text-foreground">Từ chối yêu cầu</DialogTitle>
					<DialogDescription className="text-[hsl(220_10%_65%)]">
						Từ chối yêu cầu unlink thẻ{" "}
						<span className="text-foreground font-medium">
							{request?.cardName}
						</span>{" "}
						của{" "}
						<span className="text-foreground font-medium">
							{request?.userName}
						</span>
						. Vui lòng ghi rõ lý do.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2 py-2">
					<Label
						htmlFor="staff-note"
						className="text-sm text-[hsl(220_10%_65%)]"
					>
						Ghi chú nhân viên <span className="text-[hsl(0_70%_60%)]">*</span>
					</Label>
					<Textarea
						id="staff-note"
						data-testid="staff-note-input"
						placeholder="Nhập lý do từ chối..."
						value={staffNote}
						onChange={(e) => setStaffNote(e.target.value)}
						rows={4}
						className="resize-none bg-[hsl(230_40%_12%/0.6)] border-[hsl(230_20%_22%)] text-foreground placeholder:text-[hsl(220_10%_40%)] focus-visible:ring-[hsl(270_38%_50%)]"
					/>
					{staffNote.trim() === "" && (
						<p className="text-xs text-[hsl(0_70%_60%)]">
							Ghi chú là bắt buộc.
						</p>
					)}
				</div>

				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={rejectMutation.isPending}
						className="border-[hsl(230_20%_22%)] text-[hsl(220_10%_65%)] hover:bg-[hsl(230_15%_20%)]"
					>
						Huỷ
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitDisabled}
						data-testid="reject-submit-btn"
						className="bg-[hsl(0_70%_50%)] hover:bg-[hsl(0_70%_42%)] text-white disabled:opacity-50"
					>
						{rejectMutation.isPending ? "Đang xử lý..." : "Từ chối"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
