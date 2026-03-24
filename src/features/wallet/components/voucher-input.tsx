"use client";

import { CheckCircle2, Loader2, Ticket, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api";
import { useValidateVoucher } from "../hooks/use-vouchers";

interface VoucherInputProps {
	orderTotal: number;
	onSuccess?: (discountAmount: number, code: string) => void;
	onRemove?: () => void;
	className?: string;
}

export function VoucherInput({
	orderTotal,
	onSuccess,
	onRemove,
	className,
}: VoucherInputProps) {
	const [code, setCode] = useState("");
	const [appliedVoucher, setAppliedVoucher] = useState<{
		code: string;
		discountAmount: number;
	} | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const validateMutation = useValidateVoucher();

	const handleApply = (e: React.FormEvent) => {
		e.preventDefault();
		if (!code.trim()) return;

		setErrorMsg(null);
		validateMutation.mutate(
			{ code: code.trim(), orderTotal },
			{
				onSuccess: (data) => {
					setAppliedVoucher({
						code: code.trim(),
						discountAmount: data.discountAmount,
					});
					onSuccess?.(data.discountAmount, code.trim());
				},
				onError: (error) => {
					const message = getApiErrorMessage(error, "Mã giảm giá không hợp lệ");
					setErrorMsg(message);
					setAppliedVoucher(null);
					onRemove?.();
				},
			},
		);
	};

	const handleRemove = () => {
		setCode("");
		setAppliedVoucher(null);
		setErrorMsg(null);
		onRemove?.();
	};

	if (appliedVoucher) {
		return (
			<div
				className={cn(
					"flex items-center justify-between p-3 rounded-xl glass-panel border-primary/30 bg-primary/5",
					className,
				)}
			>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-full bg-primary/20 text-primary">
						<CheckCircle2 className="w-5 h-5" />
					</div>
					<div>
						<p className="font-stats font-bold tracking-wide text-primary">
							{appliedVoucher.code}
						</p>
						<p className="text-xs text-muted-foreground whitespace-nowrap">
							Giảm {appliedVoucher.discountAmount.toLocaleString()}đ
						</p>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleRemove}
					className="text-muted-foreground hover:text-destructive shrink-0"
				>
					<XCircle className="w-5 h-5" />
				</Button>
			</div>
		);
	}

	return (
		<div className={cn("space-y-2", className)}>
			<form onSubmit={handleApply} className="flex gap-2">
				<div className="relative flex-1">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Ticket className="w-4 h-4 text-muted-foreground" />
					</div>
					<Input
						value={code}
						onChange={(e) => setCode(e.target.value.toUpperCase())}
						placeholder="Nhập mã voucher"
						className="pl-9 font-stats tracking-wider uppercase bg-background/50 border-input/50"
						disabled={validateMutation.isPending}
						data-testid="voucher-input-field"
					/>
				</div>
				<Button
					type="submit"
					disabled={!code.trim() || validateMutation.isPending}
					className="bg-primary/90 hover:bg-primary shrink-0"
				>
					{validateMutation.isPending ? (
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					) : null}
					Áp Dụng
				</Button>
			</form>
			{errorMsg ? (
				<p
					className="text-xs text-destructive flex items-center gap-1 font-medium"
					data-testid="voucher-error-msg"
				>
					<XCircle className="w-3.5 h-3.5" />
					{errorMsg}
				</p>
			) : null}
		</div>
	);
}
