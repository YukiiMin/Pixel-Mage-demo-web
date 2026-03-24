"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface ShufflingPhaseProps {
	onComplete: () => void;
}

export function ShufflingPhase({ onComplete }: ShufflingPhaseProps) {
	useEffect(() => {
		const timeoutId = setTimeout(onComplete, 3000);
		return () => clearTimeout(timeoutId);
	}, [onComplete]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="flex min-h-[60vh] flex-col items-center justify-center gap-8"
		>
			<div className="relative h-56 w-40">
				{[0, 1, 2, 3, 4].map((index) => (
					<motion.div
						key={index}
						className="absolute inset-0 rounded-xl border-2 border-primary/40 bg-linear-to-br from-card to-card/60"
						style={{ originX: 0.5, originY: 1 }}
						animate={{
							rotate: [0, -15 + index * 8, 15 - index * 6, 0],
							x: [0, -20 + index * 10, 20 - index * 8, 0],
							y: [0, -5, 5, 0],
						}}
						transition={{
							duration: 0.8,
							repeat: Number.POSITIVE_INFINITY,
							delay: index * 0.1,
							ease: "easeInOut",
						}}
					>
						<div className="flex h-full w-full items-center justify-center rounded-xl">
							<span className="text-3xl">🔮</span>
						</div>
					</motion.div>
				))}
			</div>
			<div className="space-y-2 text-center">
				<motion.p
					className="text-xl font-bold text-foreground"
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
				>
					Đang xào bài...
				</motion.p>
				<p className="text-sm text-muted-foreground">
					Hãy tập trung vào câu hỏi của bạn
				</p>
			</div>
			<div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
				<motion.div
					className="h-full rounded-full bg-primary"
					initial={{ width: 0 }}
					animate={{ width: "100%" }}
					transition={{ duration: 3, ease: "linear" }}
				/>
			</div>
		</motion.div>
	);
}
