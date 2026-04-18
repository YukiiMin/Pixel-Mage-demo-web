"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTarotSessionStore } from "@/features/tarot/stores/use-tarot-session-store";

interface CardRevealProps {
	onAllRevealed: () => void;
}

export function CardReveal({ onAllRevealed }: CardRevealProps) {
	const readingCards = useTarotSessionStore((state) => state.readingCards);

	// Tự động reveal xong sau khi hiển thị xong bài
	useEffect(() => {
		const totalAnimationTime = readingCards.length * 300 + 1500;
		const timer = setTimeout(onAllRevealed, totalAnimationTime);
		return () => clearTimeout(timer);
	}, [readingCards.length, onAllRevealed]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="space-y-12 pb-20"
			data-testid="card-reveal"
		>
			<h2 className="text-center font-(--font-heading) text-2xl text-foreground">
				Thông Điệp Của Bạn
			</h2>

			<div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-8">
				{readingCards.map((card, index) => (
					<motion.div
						key={card.readingCardId}
						data-testid={`card-${card.readingCardId}`}
						initial={{ opacity: 0, scale: 0.8, y: 50 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{
							duration: 0.8,
							delay: index * 0.3, // staggered reveal
							ease: [0.23, 1, 0.32, 1], // easeOutQuint
						}}
						className="animate-fog-in flex w-full max-w-70 flex-col gap-4 md:w-1/3"
					>
						<div className="relative mx-auto aspect-2/3 w-full max-w-50 perspective-1000">
							<div
								className={cn(
									"tarot-card-face absolute inset-0 rounded-xl overflow-hidden glass-card",
									card.isReversed && "rotate-180",
								)}
							>
								{/* Card Image */}
								{card.cardTemplate.imageUrl ? (
									// Using standard img tag with tailwind for smooth rendering
									<img
										src={card.cardTemplate.imageUrl}
										alt={card.cardTemplate.name}
										className="h-full w-full object-cover"
										style={{
											...(card.isReversed
												? { filter: "sepia(0.3) saturate(1.2)" }
												: {}),
										}}
									/>
								) : (
									<div
										className="h-full w-full"
										style={{
											backgroundImage: `url('/images/deck/card-back.jpg')`,
											backgroundSize: "cover",
											backgroundPosition: "center",
										}}
									/>
								)}
								{/* Fallback Text layer (if image fails or is absent) */}
								{!card.cardTemplate.imageUrl && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-center font-bold text-white backdrop-blur-xs">
										{card.cardTemplate.name}
									</div>
								)}
							</div>
						</div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: index * 0.3 + 0.5 }}
							className="space-y-2 text-center"
						>
							<div className="flex items-center justify-center gap-2">
								<h3 className="font-(--font-heading) text-xl  text-primary">
									{card.cardTemplate.name}
								</h3>
								{card.isReversed && (
									<span className="rounded bg-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive">
										REVERSED
									</span>
								)}
							</div>
							<p className="font-medium text-foreground">{card.positionName}</p>
						</motion.div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}
