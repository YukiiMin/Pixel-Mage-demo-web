"use client";

import { Coins, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api";
import { useExchangePoints } from "../hooks/use-wallet";

interface ExchangeButtonProps {
	userId: number | null;
	className?: string;
	disabled?: boolean;
}

export function ExchangeButton({
	userId,
	className,
	disabled,
}: ExchangeButtonProps) {
	const [open, setOpen] = useState(false);
	const exchangeMutation = useExchangePoints(userId ?? 0);

	if (!userId) return null;

	const handleExchange = () => {
		exchangeMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Đổi điểm thành công!");
				setOpen(false);
			},
			onError: (error) => {
				const message = getApiErrorMessage(error, "Đổi điểm thất bại");
				toast.error(message);
				setOpen(false);
			},
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button
					variant="default"
					className={cn(
						"bg-primary/90 hover:bg-primary font-medium",
						className,
					)}
					disabled={disabled || exchangeMutation.isPending}
				>
					{exchangeMutation.isPending ? (
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					) : (
						<Coins className="w-4 h-4 mr-2" />
					)}
					Đổi Điểm Thành Voucher
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="glass-panel border-primary/20">
				<AlertDialogHeader>
					<AlertDialogTitle className="font-heading text-2xl">
						Xác Nhận Đổi Điểm
					</AlertDialogTitle>
					<AlertDialogDescription className="font-body text-muted-foreground text-sm space-y-2">
						Bạn có chắc chắn muốn dùng điểm PM để đổi thành Voucher giảm giá
						không? Hành động này không thể hoàn tác.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="mt-6">
					<AlertDialogCancel disabled={exchangeMutation.isPending}>
						Hủy Bỏ
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault(); // prevent closing immediately
							handleExchange();
						}}
						disabled={exchangeMutation.isPending}
						className="bg-primary/90 hover:bg-primary"
					>
						{exchangeMutation.isPending && (
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						)}
						Đổi Ngay
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
