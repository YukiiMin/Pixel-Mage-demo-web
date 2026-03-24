"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { getStoredUserId } from "@/lib/api-config";
import { ExchangeButton } from "./exchange-button";
import { VoucherInput } from "./voucher-input";
import { VoucherList } from "./voucher-list";
import { WalletBalance } from "./wallet-balance";

export function WalletPageClient() {
	const [userId, setUserId] = useState<number | null>(null);
	const prefersReduced = useReducedMotion();

	useEffect(() => {
		setUserId(getStoredUserId());
	}, []);

	if (!userId) return null;

	return (
		<div className="container py-8 max-w-4xl mx-auto space-y-8">
			<motion.div
				initial={prefersReduced ? false : { opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={prefersReduced ? { duration: 0 } : { duration: 0.5 }}
				className="space-y-2"
			>
				<h1 className="text-3xl font-heading text-primary">Ví Của Bạn</h1>
				<p className="text-muted-foreground text-sm font-body">
					Quản lý số dư PM, đổi điểm và sử dụng voucher giảm giá.
				</p>
			</motion.div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<motion.div
					initial={prefersReduced ? false : { opacity: 0, x: -12 }}
					animate={{ opacity: 1, x: 0 }}
					transition={
						prefersReduced ? { duration: 0 } : { duration: 0.5, delay: 0.1 }
					}
				>
					<WalletBalance />
				</motion.div>

				<motion.div
					initial={prefersReduced ? false : { opacity: 0, x: 12 }}
					animate={{ opacity: 1, x: 0 }}
					transition={
						prefersReduced ? { duration: 0 } : { duration: 0.5, delay: 0.1 }
					}
					className="flex items-center justify-start md:justify-end"
				>
					<ExchangeButton userId={userId} />
				</motion.div>
			</div>

			<motion.div
				initial={prefersReduced ? false : { opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={
					prefersReduced ? { duration: 0 } : { duration: 0.5, delay: 0.2 }
				}
				className="space-y-4"
			>
				<h2 className="text-xl font-heading text-foreground">
					Test Validation
				</h2>
				<VoucherInput orderTotal={100000} />
			</motion.div>

			<motion.div
				initial={prefersReduced ? false : { opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={
					prefersReduced ? { duration: 0 } : { duration: 0.5, delay: 0.3 }
				}
				className="space-y-4"
			>
				<h2 className="text-xl font-heading text-foreground">
					Vouchers Của Bạn
				</h2>
				<VoucherList userId={userId} />
			</motion.div>
		</div>
	);
}
