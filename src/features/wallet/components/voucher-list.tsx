"use client";

import { CheckCircle, Clock, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useVouchers } from "../hooks/use-vouchers";

interface VoucherListProps {
	userId: number | null;
	className?: string;
}

export function VoucherList({ userId, className }: VoucherListProps) {
	const { data: vouchers, isLoading, isError } = useVouchers(userId);

	if (!userId) return null;

	if (isLoading) {
		return (
			<div
				className={cn(
					"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
					className,
				)}
			>
				{[...Array(3)].map((_, i) => (
					<Skeleton key={i} className="h-28 w-full rounded-xl" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<Card className="bg-destructive/10 border-destructive">
				<CardContent className="p-6">
					<p className="text-sm text-destructive font-medium">
						Không thể tải danh sách voucher
					</p>
				</CardContent>
			</Card>
		);
	}

	if (!vouchers || vouchers.length === 0) {
		return (
			<Card className="glass-card border-none bg-muted/20">
				<CardContent className="p-8 text-center flex flex-col items-center justify-center gap-3">
					<div className="p-4 rounded-full bg-primary/10 text-primary">
						<Ticket className="w-8 h-8 opacity-70" />
					</div>
					<div>
						<p className="text-lg font-heading text-foreground">
							Chưa có voucher nào
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Đổi điểm PM để nhận thêm voucher
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div
			className={cn(
				"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
				className,
			)}
		>
			{vouchers.map((voucher) => {
				const isActive = voucher.status === "ACTIVE";
				return (
					<Card
						key={voucher.id}
						data-testid={`voucher-item-${voucher.code}`}
						className={cn(
							"relative overflow-hidden transition-all duration-300",
							isActive
								? "glass-card hover:border-primary/50 cursor-pointer"
								: "opacity-50 grayscale border-none bg-muted/30",
						)}
					>
						<div className="absolute top-0 right-0 p-4 opacity-10">
							<Ticket className="w-12 h-12" />
						</div>

						<div
							className={cn(
								"absolute left-0 top-0 bottom-0 w-1.5",
								isActive ? "bg-primary" : "bg-muted-foreground",
							)}
						/>

						<CardContent className="p-5 pl-6 relative z-10 flex flex-col h-full justify-between gap-3">
							<div>
								<div className="flex items-center justify-between gap-2 mb-1">
									<p className="font-stats font-bold text-lg text-primary tracking-wide">
										{voucher.code}
									</p>
									{!isActive && (
										<span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
											{voucher.status === "USED" ? "Đã dùng" : "Hết hạn"}
										</span>
									)}
								</div>
								<p className="text-xl font-heading font-semibold">
									{voucher.discountPercentage
										? `Giảm ${voucher.discountPercentage}%`
										: `Giảm ${voucher.discountAmount?.toLocaleString() || 0}đ`}
								</p>
								{voucher.minOrderTotal ? (
									<p className="text-xs text-muted-foreground mt-1">
										Đơn tối thiểu {voucher.minOrderTotal.toLocaleString()}đ
									</p>
								) : null}
							</div>

							<div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
								{isActive ? (
									<>
										<Clock className="w-3.5 h-3.5 text-primary/70" />
										<span>
											HSD:{" "}
											{voucher.validUntil
												? new Date(voucher.validUntil).toLocaleDateString(
														"vi-VN",
													)
												: "Không giới hạn"}
										</span>
									</>
								) : (
									<>
										<CheckCircle className="w-3.5 h-3.5 opacity-50" />
										<span>Không khả dụng</span>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
