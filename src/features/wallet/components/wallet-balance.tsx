"use client";

import { Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStoredUserId } from "@/lib/api-config";
import { cn } from "@/lib/utils";
import { useWalletBalance } from "../hooks/use-wallet";

interface WalletBalanceProps {
	className?: string;
}

export function WalletBalance({ className }: WalletBalanceProps) {
	const userId = getStoredUserId();
	const { data, isLoading, isError } = useWalletBalance(userId);

	if (!userId) return null;

	if (isLoading) {
		return <Skeleton className="h-24 w-full md:w-[300px] rounded-xl" />;
	}

	if (isError) {
		return (
			<Card className={cn("bg-destructive/10 border-destructive", className)}>
				<CardContent className="p-6">
					<p className="text-sm text-destructive font-medium">
						Không thể tải thông tin số dư
					</p>
				</CardContent>
			</Card>
		);
	}

	const balance = data?.pmPoint ?? 0;

	return (
		<Card
			className={cn(
				"glass-card border-none relative overflow-hidden",
				className,
			)}
		>
			<div className="absolute top-0 right-0 p-4 opacity-10">
				<Coins className="w-16 h-16" />
			</div>
			<CardContent className="p-6">
				<div className="flex flex-col gap-1 relative z-10">
					<p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
						Số dư ví
					</p>
					<div className="flex items-center gap-2">
						<span
							className="font-stats text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-amber-600 truncate"
							data-testid="wallet-balance-amount"
						>
							{balance.toLocaleString()}
						</span>
						<span className="text-yellow-500 font-stats font-bold text-xl">
							PM
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
