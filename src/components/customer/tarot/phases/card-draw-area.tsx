"use client";

import { Button } from "@/components/ui/button";
import { MAJOR_ARCANA } from "@/lib/tarot-data";
import { useTarotSessionStore } from "@/stores/useTarotSessionStore";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";

function shuffle<T>(items: T[]): T[] {
	const copy = [...items];
	for (let index = copy.length - 1; index > 0; index--) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
	}
	return copy;
}

interface CardDrawAreaProps {
	requiredCount: number;
	onConfirm: () => void;
}

export function CardDrawArea({ requiredCount, onConfirm }: CardDrawAreaProps) {
	const selectedCards = useTarotSessionStore((state) => state.selectedCards);
	const addCard = useTarotSessionStore((state) => state.addCard);
	const [deck] = useState(() => shuffle(MAJOR_ARCANA).slice(0, 18));
	const [pickedIds, setPickedIds] = useState<Set<number>>(new Set());

	const allCardsSelected = selectedCards.length >= requiredCount;

	const handlePickCard = (cardId: number) => {
		if (pickedIds.has(cardId) || allCardsSelected) {
			return;
		}
		const pickedCard = MAJOR_ARCANA.find((card) => card.id === cardId);
		if (!pickedCard) {
			return;
		}
		const isReversed = Math.random() < 0.3;
		setPickedIds((previous) => new Set(previous).add(cardId));
		addCard({
			index: selectedCards.length,
			card: {
				id: pickedCard.id,
				name: pickedCard.name,
				image: "",
				isReversed,
				meaning: isReversed
					? pickedCard.reversedMeaning
					: pickedCard.uprightMeaning,
			},
		});
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="space-y-8"
		>
			<div className="space-y-1 text-center">
				<h2 className="text-2xl font-bold text-foreground">
					Chọn {requiredCount} lá bài
				</h2>
				<p className="text-sm text-muted-foreground">
					Hãy để trực giác dẫn lối — bấm vào lá bạn cảm nhận
				</p>
			</div>

			<div className="mx-auto flex max-w-xl flex-wrap justify-center gap-3">
				{deck.map((card, index) => {
					const isPicked = pickedIds.has(card.id);
					return (
						<motion.button
							key={card.id}
							onClick={() => handlePickCard(card.id)}
							disabled={isPicked || allCardsSelected}
							initial={{ opacity: 0, y: 30 }}
							animate={{
								opacity: isPicked ? 0.3 : 1,
								y: 0,
								scale: isPicked ? 0.9 : 1,
							}}
							transition={{ delay: index * 0.04 }}
							whileHover={!isPicked && !allCardsSelected ? { y: -8, scale: 1.05 } : {}}
							className={`flex h-24 w-16 items-center justify-center rounded-lg border-2 transition-colors md:h-28 md:w-20 ${
								isPicked
									? "cursor-default border-primary/20 bg-card/30"
									: "cursor-pointer border-primary/40 bg-linear-to-br from-card to-card/80 hover:border-primary hover:glow-gold"
							}`}
						>
							<span className="text-2xl">{isPicked ? "✦" : "✧"}</span>
						</motion.button>
					);
				})}
			</div>

			<div className="flex justify-center gap-4">
				{Array.from({ length: requiredCount }).map((_, slotIndex) => {
					const slot = selectedCards[slotIndex];
					return (
						<motion.div
							key={slotIndex}
							className={`flex h-28 w-20 items-center justify-center rounded-xl border-2 border-dashed transition-all md:h-32 md:w-24 ${
								slot
									? "border-primary bg-primary/10 glow-gold"
									: "border-muted-foreground/30 bg-card/20"
							}`}
							animate={slot ? { scale: [1, 1.08, 1] } : {}}
							transition={{ duration: 0.3 }}
						>
							{slot ? (
								<div className="text-center">
									<span className="text-2xl">🂠</span>
									<p className="mt-1 text-[10px] font-medium text-primary">
										Lá {slotIndex + 1}
									</p>
								</div>
							) : (
								<span className="text-xs text-muted-foreground">Slot {slotIndex + 1}</span>
							)}
						</motion.div>
					);
				})}
			</div>

			<div className="text-center">
				<Button
					onClick={onConfirm}
					disabled={!allCardsSelected}
					className="gradient-gold-purple-bg rounded-full px-8 text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
				>
					<Sparkles className="mr-1 h-4 w-4" /> Xem Bài
				</Button>
			</div>
		</motion.div>
	);
}
