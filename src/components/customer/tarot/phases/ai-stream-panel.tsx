"use client";

import { MAJOR_ARCANA } from "@/lib/tarot-data";
import { useTarotSessionStore } from "@/stores/useTarotSessionStore";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

interface AIStreamPanelProps {
	onStreamComplete: () => void;
}

export function AIStreamPanel({ onStreamComplete }: AIStreamPanelProps) {
	const selectedCards = useTarotSessionStore((state) => state.selectedCards);
	const interpretation = useTarotSessionStore((state) => state.interpretation);
	const setInterpretation = useTarotSessionStore((state) => state.setInterpretation);
	const didRunRef = useRef(false);

	useEffect(() => {
		if (didRunRef.current) {
			return;
		}
		didRunRef.current = true;

		const lines: string[] = ["✦ Diễn Giải Của Vũ Trụ\n"];
		selectedCards.forEach((slot, index) => {
			const card = MAJOR_ARCANA.find((item) => item.id === slot.card.id);
			if (!card) {
				return;
			}
			const position =
				selectedCards.length === 3
					? ["Quá Khứ", "Hiện Tại", "Tương Lai"][index]
					: `Lá ${index + 1}`;
			lines.push(
				`\n🃏 ${position}: ${card.nameVi} (${card.name})${slot.card.isReversed ? " — Ngược" : ""}\n${slot.card.meaning}\n`,
			);
		});
		lines.push(
			"\n🔮 Tổng Hợp\nCác lá bài cho thấy một hành trình chuyển đổi đáng kể. Hãy tin tưởng vào trực giác và đón nhận thay đổi tích cực.\n",
		);
		lines.push(
			"\n💡 Lời Khuyên\nĐừng sợ bước ra khỏi vùng an toàn. Vũ trụ đang mở ra những khả năng mới cho bạn.",
		);

		const fullText = lines.join("");
		let cursor = 0;
		const intervalId = setInterval(() => {
			cursor += 2;
			if (cursor >= fullText.length) {
				setInterpretation(fullText);
				clearInterval(intervalId);
				setTimeout(onStreamComplete, 500);
				return;
			}
			setInterpretation(fullText.slice(0, cursor));
		}, 20);

		return () => clearInterval(intervalId);
	}, [onStreamComplete, selectedCards, setInterpretation]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			className="space-y-6"
		>
			<h2 className="text-center text-2xl font-bold text-foreground">
				<Sparkles className="mr-2 inline h-5 w-5 text-primary" />
				Divine Interpretation
			</h2>
			<div className="glass-card mx-auto min-h-50 max-w-2xl rounded-2xl p-6 md:p-8">
				<pre className="whitespace-pre-wrap font-(--font-body) text-sm leading-relaxed text-foreground/90">
					{interpretation}
					<motion.span
						animate={{ opacity: [1, 0] }}
						transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
						className="text-primary"
					>
						▊
					</motion.span>
				</pre>
			</div>
		</motion.div>
	);
}
