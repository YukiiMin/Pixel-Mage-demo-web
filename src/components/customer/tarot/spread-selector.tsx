"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion-variants";
import { SPREADS } from "@/lib/tarot-data";
import { useTarotSessionStore } from "@/stores/useTarotSessionStore";
import { Switch } from "@/components/ui/switch";

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
			<motion.h2
				variants={fadeInUp}
				className="text-center text-3xl font-bold"
			>
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

			<motion.div variants={fadeInUp} className="glass-card rounded-xl p-5">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-semibold text-foreground">Chế độ bộ bài</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							{setup.deckMode === "EXPLORE"
								? "Rút từ 78 lá Major & Minor Arcana"
								: "Rút từ các lá bạn đang sở hữu (NFC linked)"}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<span
							className={`text-xs font-medium ${setup.deckMode === "EXPLORE" ? "text-primary" : "text-muted-foreground"}`}
						>
							EXPLORE
						</span>
						<Switch
							checked={setup.deckMode === "YOUR_DECK"}
							onCheckedChange={(checked) =>
								setDeckMode(checked ? "YOUR_DECK" : "EXPLORE")
							}
						/>
						<span
							className={`text-xs font-medium ${setup.deckMode === "YOUR_DECK" ? "text-primary" : "text-muted-foreground"}`}
						>
							YOUR DECK
						</span>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}
