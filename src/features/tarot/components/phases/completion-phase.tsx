"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Copy, RefreshCw, Share2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSessionDetail } from "@/features/tarot/hooks/use-tarot-session";
import { useTarotSessionStore } from "@/features/tarot/stores/use-tarot-session-store";

interface CompletionPhaseProps {
	sessionId: number;
}

export function CompletionPhase({ sessionId }: CompletionPhaseProps) {
	const router = useRouter();
	const [shareStatus, setShareStatus] = useState<"idle" | "success">("idle");
	const [isGathering, setIsGathering] = useState(false);
	const reset = useTarotSessionStore((s) => s.reset);

	const { data: sessionData, isLoading } = useSessionDetail(sessionId);

	if (isLoading) {
		return (
			<div className="flex justify-center p-12">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!sessionData) return null;

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setShareStatus("success");
			toast.success("Đã sao chép link chia sẻ!");
			setTimeout(() => setShareStatus("idle"), 2000);
		} catch {
			toast.error("Không thể sao chép link");
		}
	};

	const handleReadAgain = async () => {
		// Trigger gather animation first
		setIsGathering(true);
		await new Promise((r) => setTimeout(r, 900));
		reset();
		router.push("/tarot");
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="w-full max-w-4xl px-4 py-8"
			data-testid="completion-phase"
		>
			{/* Header */}
			<motion.div
				initial={{ scale: 0.9 }}
				animate={{ scale: 1 }}
				className="glass-card mb-8 rounded-2xl p-6 text-center"
			>
				<div className="mb-4 flex justify-center">
					<div className="relative">
						<div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
						<div className="relative rounded-full bg-primary/10 p-4">
							<CheckCircle2 className="h-10 w-10 text-primary" />
						</div>
					</div>
				</div>
				<h2 className="mb-1 font-(--font-heading) text-2xl text-foreground">
					Phiên Đọc Hoàn Tất
				</h2>
				{sessionData.mainQuestion && (
					<p className="text-sm text-muted-foreground italic mt-1">
						"{sessionData.mainQuestion}"
					</p>
				)}
			</motion.div>

			{/* Cards summary with gather animation */}
			<AnimatePresence>
				{!isGathering ? (
					<motion.div
						key="cards-grid"
						exit={{ opacity: 0 }}
						className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
					>
						{sessionData.readingCards?.map((card, index) => (
							<motion.div
								key={card.positionIndex}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.08 }}
								className="group flex flex-col items-center gap-2"
							>
								<motion.div
									layoutId={`card-container-${card.positionIndex}`}
									className={`relative aspect-[2/3] w-24 overflow-hidden rounded-lg border border-white/10 shadow-xl transition-transform duration-500 group-hover:scale-105 ${
										card.isReversed ? "rotate-180" : ""
									}`}
								>
									{card.cardTemplate.imageUrl ? (
										<img
											src={card.cardTemplate.imageUrl}
											alt={card.cardTemplate.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="h-full w-full bg-primary/10 flex items-center justify-center">
											<span className="text-xs text-muted-foreground text-center px-1">
												{card.cardTemplate.name}
											</span>
										</div>
									)}
								</div>
								<div className="text-center">
									<p className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
										{card.positionName}
									</p>
									<p className="mt-0.5 text-xs font-medium text-foreground">
										{card.cardTemplate.name}{" "}
										{card.isReversed && (
											<span className="text-destructive">(Ngược)</span>
										)}
									</p>
								</div>
							</motion.div>
						))}
					</motion.div>
				) : (
					/* Gather animation */
					<motion.div
						key="cards-gathering"
						className="mb-8 flex justify-center"
						initial={{ opacity: 1 }}
						animate={{ opacity: 0 }}
						transition={{ duration: 0.8 }}
					>
						<div className="relative h-32 w-24">
							{sessionData.readingCards?.map((_, i) => (
								<motion.div
									key={i}
									className="absolute inset-0 rounded-lg bg-primary/20 border border-primary/30"
									animate={{
										x: 0,
										y: 0,
										rotate: 0,
										scale: 1 - i * 0.03,
									}}
									initial={{
										x: (i % 3 - 1) * 120,
										y: Math.floor(i / 3) * -40,
										rotate: (i % 3 - 1) * 15,
									}}
									transition={{
										duration: 0.7,
										delay: i * 0.05,
										ease: [0.23, 1, 0.32, 1],
									}}
								/>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* AI Interpretation */}
			{sessionData.aiInterpretation && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="mb-8 glass-card rounded-xl border border-white/10 bg-white/5 p-6"
				>
					<p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
						<Sparkles className="h-3.5 w-3.5" />
						Lời khuyên từ Vũ Trụ
					</p>
					<div
						className="whitespace-pre-wrap font-(--font-body) text-sm leading-relaxed"
						style={{ color: "hsl(270 40% 80%)" }}
					>
						{sessionData.aiInterpretation}
					</div>
				</motion.div>
			)}

			{/* Action buttons */}
			<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button
					onClick={handleShare}
					variant="outline"
					className="w-full border-primary/50 text-primary hover:bg-primary/10 sm:w-auto"
					data-testid="share-button"
				>
					{shareStatus === "success" ? (
						<>
							<Copy className="mr-2 h-4 w-4" /> Đã Sao Chép
						</>
					) : (
						<>
							<Share2 className="mr-2 h-4 w-4" /> Chia Sẻ Kết Quả
						</>
					)}
				</Button>

				<Button
					onClick={handleReadAgain}
					disabled={isGathering}
					className="w-full gradient-gold-purple-bg rounded-full px-8 font-semibold text-primary-foreground glow-gold sm:w-auto disabled:opacity-70"
					data-testid="read-again-button"
				>
					<RefreshCw className={`mr-2 h-4 w-4 ${isGathering ? "animate-spin" : ""}`} />
					{isGathering ? "Đang gom bài..." : "Bói Lại 🔮"}
				</Button>
			</div>
		</motion.div>
	);
}
