"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion-variants";
import { SPREADS } from "@/lib/tarot-data";
import { useTarotSessionStore } from "@/stores/use-tarot-session-store";

export function SpreadSelector() {
	const setup = useTarotSessionStore((state) => state.setup);
	const setSpreadType = useTarotSessionStore((state) => state.setSpreadType);
	const setDeckMode = useTarotSessionStore((state) => state.setDeckMode);

	return (
		<motion.div
			key="spread"
			initial="hidden"
			animate="visible"
			exit={{ opacity: 0, x: -60 }}
			className="space-y-6"
		>
			<motion.h2 variants={fadeInUp} className="text-center text-3xl font-bold">
				Chọn <span className="gradient-gold-purple">kiểu trải bài</span>
			</motion.h2>

			<motion.div variants={fadeInUp} className="space-y-3">
				{SPREADS.map((spread) => (
					<button
						type="button"
						key={spread.key}
						onClick={() => setSpreadType(spread.key)}
						className={`w-full rounded-xl p-5 text-left transition-all duration-300 hover:scale-[1.02] glass-card ${
							setup.spreadType === spread.key
								? "ring-2 ring-primary glow-gold"
								: "hover:border-primary/30"
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<span className="text-lg font-bold text-foreground">
									{spread.label}
								</span>
								<p className="mt-0.5 text-sm text-muted-foreground">
									{spread.description}
								</p>
							</div>
							<span className="text-2xl font-bold text-primary">
								{spread.count}
							</span>
						</div>
					</button>
				))}
			</motion.div>
		</motion.div>
	);
}
