"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Copy, Share2, Sparkles } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSessionDetail } from "@/features/tarot/hooks/use-tarot-session";


interface CompletionPhaseProps {
	sessionId: number;
}

export function CompletionPhase({ sessionId }: CompletionPhaseProps) {
	const router = useRouter();
	const [shareStatus, setShareStatus] = useState<"idle" | "success">("idle");

	const { data: sessionData, isLoading } = useSessionDetail(sessionId);

	if (isLoading) {
		return (
			<div className="flex justify-center p-12">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!sessionData) {
		return null;
	}

	const handleShare = async () => {
		try {
			// Using the standard share URL format, or we can just copy current URL
			await navigator.clipboard.writeText(window.location.href);
			setShareStatus("success");
			toast.success("Đã sao chép link chia sẻ!");
			setTimeout(() => setShareStatus("idle"), 2000);
		} catch (err) {
			toast.error("Không thể sao chép link");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="w-full max-w-4xl px-4 py-8 text-center"
			data-testid="completion-phase"
		>
			<motion.div
				initial={{ scale: 0.9 }}
				animate={{ scale: 1 }}
				className="glass-card mb-12 rounded-2xl p-8"
			>
				<div className="mb-6 flex justify-center">
					<div className="relative">
						<div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
						<div className="relative rounded-full bg-primary/10 p-4">
							<CheckCircle2 className="h-10 w-10 text-primary" />
						</div>
					</div>
				</div>

				<h2 className="mb-2 font-(--font-heading) text-2xl  text-foreground">
					Phiên Đọc Hoàn Tất
				</h2>

				<div className="mb-12 mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
					{sessionData.readingCards?.map((card) => (
						<div
							key={card.positionIndex}
							className="group relative flex flex-col items-center gap-3"
						>
							<div
								className={`relative aspect-2/3 w-32 overflow-hidden rounded-lg border border-white/10 shadow-xl transition-transform duration-500 group-hover:scale-105 ${card.isReversed ? "rotate-180" : ""}`}
							>
								<img
									src={card.cardTemplate.imageUrl}
									alt={card.cardTemplate.name}
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="text-center">
								<p className="text-xs font-bold uppercase tracking-wider text-primary/60">
									{card.positionName}
								</p>
								<p className="mt-1 font-medium text-foreground">
									{card.cardTemplate.name} {card.isReversed && "(Ngược)"}
								</p>
							</div>
						</div>
					))}
				</div>

				<div className="mb-8 text-left glass-card p-6 rounded-xl border border-white/10 bg-white/5">
					<p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary/60">
						Lời khuyên từ Vũ Trụ
					</p>
					<pre 
						className="whitespace-pre-wrap font-(--font-body) text-sm leading-relaxed"
						style={{ color: "hsl(270 40% 80%)" }}
					>
						{sessionData.aiInterpretation}
					</pre>
				</div>

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
						onClick={() => router.push("/tarot")}
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground sm:w-auto"
						data-testid="read-again-button"
					>
						<Sparkles className="mr-2 h-4 w-4" /> Đọc Lại Bài Mới
					</Button>
				</div>
			</motion.div>
		</motion.div>
	);
}
