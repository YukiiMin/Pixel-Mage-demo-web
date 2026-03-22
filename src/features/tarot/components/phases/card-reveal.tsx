"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { MAJOR_ARCANA } from "@/lib/tarot-data";
import { useTarotSessionStore } from "@/stores/use-tarot-session-store";

interface CardRevealProps {
	onAllRevealed: () => void;
}

export function CardReveal({ onAllRevealed }: CardRevealProps) {
	const selectedCards = useTarotSessionStore((state) => state.selectedCards);
	const revealedCount = useTarotSessionStore((state) => state.revealedCount);
	const setRevealedCount = useTarotSessionStore(
		(state) => state.setRevealedCount,
	);

	useEffect(() => {
		if (revealedCount >= selectedCards.length) {
			const timeoutId = setTimeout(onAllRevealed, 600);
			return () => clearTimeout(timeoutId);
		}
		const timeoutId = setTimeout(() => {
			setRevealedCount(revealedCount + 1);
		}, 800);
		return () => clearTimeout(timeoutId);
	}, [onAllRevealed, revealedCount, selectedCards.length, setRevealedCount]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="space-y-8"
		>
			<h2 className="text-center text-2xl font-bold text-foreground">
				Lật Bài...
			</h2>
			<div className="flex flex-wrap justify-center gap-6">
				{selectedCards.map((slot, index) => {
					const isRevealed = index < revealedCount;
					const cardMeta = MAJOR_ARCANA.find(
						(card) => card.id === slot.card.id,
					);
					return (
						<div
							key={slot.card.id}
							className="relative"
							style={{ perspective: 800 }}
						>
							<motion.div
								className="relative h-40 w-28 md:h-52 md:w-36"
								style={{ transformStyle: "preserve-3d" }}
								animate={{ rotateY: isRevealed ? 180 : 0 }}
								transition={{ duration: 0.6, ease: "easeInOut" }}
							>
								<div
									className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-primary/40 bg-linear-to-br from-card to-card/80"
									style={{ backfaceVisibility: "hidden" }}
								>
									<span className="text-4xl">🂠</span>
								</div>
								<div
									className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 ${
										isRevealed
											? "border-primary bg-card glow-gold"
											: "border-primary/40 bg-card"
									}`}
									style={{
										backfaceVisibility: "hidden",
										transform: "rotateY(180deg)",
									}}
								>
									<span className="text-3xl">🔮</span>
									<p className="text-center text-xs font-bold leading-tight text-foreground">
										{cardMeta?.nameVi}
									</p>
									<p className="text-center text-[10px] text-muted-foreground">
										{cardMeta?.name}
									</p>
									{slot.card.isReversed && (
										<motion.span
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive"
										>
											REVERSED
										</motion.span>
									)}
								</div>
							</motion.div>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
}
