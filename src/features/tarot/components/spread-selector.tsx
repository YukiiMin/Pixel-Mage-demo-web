"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "@/lib/motion-variants";
import { useTarotSessionStore } from "@/features/tarot/stores/use-tarot-session-store";
import { useSpreads } from "../hooks/use-spreads";

function SpreadSkeleton() {
	return (
		<div className="space-y-6">
			<div className="h-10 w-2/3 mx-auto bg-muted/20 rounded-md animate-pulse" />
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-24 w-full bg-muted/20 rounded-xl animate-pulse"
					/>
				))}
			</div>
		</div>
	);
}

export function SpreadSelector() {
	const shouldReduceMotion = useReducedMotion();
	const { data: spreads, isLoading } = useSpreads();
	const selectedSpreadId = useTarotSessionStore((s) => s.selectedSpreadId);
	const setSelectedSpread = useTarotSessionStore((s) => s.setSelectedSpread);

	if (isLoading) return <SpreadSkeleton />;

	return (
		<motion.div
			key="spread"
			initial={shouldReduceMotion ? { opacity: 1 } : "hidden"}
			animate="visible"
			exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -60 }}
			className="space-y-6"
		>
			<motion.h2
				variants={shouldReduceMotion ? {} : fadeInUp}
				className="text-center text-3xl font-bold"
			>
				Chọn <span className="gradient-gold-purple">kiểu trải bài</span>
			</motion.h2>

			<motion.div
				variants={shouldReduceMotion ? {} : fadeInUp}
				className="space-y-3"
			>
				{spreads?.map((spread) => (
					<button
						type="button"
						key={spread.spreadId}
						onClick={() => setSelectedSpread(spread.spreadId)}
						className={`w-full rounded-xl p-5 text-left transition-all duration-300 ${!shouldReduceMotion && "hover:scale-[1.02]"} glass-card ${
							selectedSpreadId === spread.spreadId
								? "ring-2 ring-primary glow-gold"
								: "hover:border-primary/30"
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<span className="text-lg font-bold text-foreground">
									{spread.name}
								</span>
								<p className="mt-0.5 text-sm text-muted-foreground">
									{spread.description}
								</p>
							</div>
							<span className="text-2xl font-bold text-primary px-3 py-1 rounded-full bg-primary/10">
								{spread.minCardsRequired} lá
							</span>
						</div>
					</button>
				))}
			</motion.div>
		</motion.div>
	);
}
