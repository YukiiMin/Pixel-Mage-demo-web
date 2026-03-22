"use client";

import { motion } from "framer-motion";
import { RotateCcw, Save, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useTarotReadingHistory } from "@/features/tarot/hooks/use-tarot-reading-history";
import { MAJOR_ARCANA } from "@/lib/tarot-data";
import { useTarotSessionStore } from "@/stores/use-tarot-session-store";

export function CompletionPhase() {
	const router = useRouter();
	const [isSaving, setIsSaving] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const setup = useTarotSessionStore((state) => state.setup);
	const selectedCards = useTarotSessionStore((state) => state.selectedCards);
	const interpretation = useTarotSessionStore((state) => state.interpretation);
	const reset = useTarotSessionStore((state) => state.reset);
	const { addReading } = useTarotReadingHistory();

	const buildShareText = () => {
		const cardSummary = selectedCards
			.map((slot, index) => {
				const card = MAJOR_ARCANA.find((item) => item.id === slot.card.id);
				if (!card) return `Lá ${index + 1}`;
				return `${index + 1}. ${card.nameVi}${slot.card.isReversed ? " (Ngược)" : ""}`;
			})
			.join("\n");

		return [
			"🔮 Kết Quả Tarot PixelMage",
			setup.topic ? `Chủ đề: ${setup.topic}` : "Chủ đề: Tổng quát",
			`Spread: ${setup.spreadType}`,
			"",
			"Các lá bài:",
			cardSummary,
			"",
			interpretation,
		].join("\n");
	};

	const handleSaveReading = () => {
		if (isSaving) {
			return;
		}
		if (!interpretation.trim()) {
			toast.error("Chưa có nội dung để lưu");
			return;
		}

		setIsSaving(true);
		try {
			addReading({
				topic: setup.topic,
				question: setup.question,
				spreadType: setup.spreadType,
				deckMode: setup.deckMode,
				cards: selectedCards.map((slot) => {
					const card = MAJOR_ARCANA.find((item) => item.id === slot.card.id);
					return {
						cardId: slot.card.id,
						name: card?.name ?? slot.card.name,
						nameVi: card?.nameVi ?? slot.card.name,
						isReversed: slot.card.isReversed,
					};
				}),
				interpretation,
			});
			toast.success("Đã lưu phiên đọc vào lịch sử");
		} catch {
			toast.error("Không thể lưu phiên đọc, vui lòng thử lại");
		} finally {
			setIsSaving(false);
		}
	};

	const handleShareReading = async () => {
		if (isSharing) {
			return;
		}

		setIsSharing(true);
		try {
			const shareText = buildShareText();
			if (navigator.share) {
				await navigator.share({
					title: "Kết Quả Tarot PixelMage",
					text: shareText,
				});
				toast.success("Đã mở hộp thoại chia sẻ");
				return;
			}

			await navigator.clipboard.writeText(shareText);
			toast.success("Đã sao chép kết quả để chia sẻ");
		} catch {
			toast.error("Không thể chia sẻ kết quả lúc này");
		} finally {
			setIsSharing(false);
		}
	};

	const handleReadAgain = () => {
		reset();
		router.push("/tarot");
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="space-y-8"
		>
			<div className="flex flex-wrap justify-center gap-4">
				{selectedCards.map((slot, index) => {
					const card = MAJOR_ARCANA.find((item) => item.id === slot.card.id);
					return (
						<motion.div
							key={slot.card.id}
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: index * 0.15 }}
							className="glass-card w-28 rounded-xl p-4 text-center glow-gold"
						>
							<span className="mb-1 block text-2xl">🔮</span>
							<p className="text-xs font-bold text-foreground">
								{card?.nameVi}
							</p>
							{slot.card.isReversed && (
								<span className="text-[9px] font-bold text-destructive">
									REVERSED
								</span>
							)}
						</motion.div>
					);
				})}
			</div>

			<div className="glass-card mx-auto max-w-2xl rounded-2xl p-6 md:p-8">
				<pre className="whitespace-pre-wrap font-(--font-body) text-sm leading-relaxed text-foreground/90">
					{interpretation}
				</pre>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="flex flex-wrap justify-center gap-4"
			>
				<Button
					onClick={handleSaveReading}
					disabled={isSaving}
					className="gradient-gold-purple-bg rounded-full px-6 text-primary-foreground glow-gold transition-transform hover:scale-105"
				>
					<Save className="mr-1 h-4 w-4" /> Lưu
				</Button>
				<Button
					variant="outline"
					onClick={handleShareReading}
					disabled={isSharing}
					className="rounded-full border-primary/40 px-6 text-primary hover:bg-primary/10"
				>
					<Share2 className="mr-1 h-4 w-4" /> Chia Sẻ
				</Button>
				<Button
					variant="ghost"
					onClick={handleReadAgain}
					className="rounded-full px-6 text-muted-foreground hover:text-foreground"
				>
					<RotateCcw className="mr-1 h-4 w-4" /> Đọc Lại
				</Button>
			</motion.div>
		</motion.div>
	);
}
