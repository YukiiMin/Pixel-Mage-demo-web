"use client";

import { AnimatePresence } from "framer-motion";
import { useTarotSession } from "@/features/tarot/hooks/use-tarot-session";
import { useTarotSessionStore } from "@/stores/use-tarot-session-store";
import type { SessionPhase } from "@/types/tarot";
import { CardDrawArea } from "./phases/card-draw-area";
import { CardReveal } from "./phases/card-reveal";
import { CompletionPhase } from "./phases/completion-phase";
import { ShufflingPhase } from "./phases/shuffling-phase";
import { AIStreamPanel } from "./session/interpret-panel";

const PHASE_LABELS: Record<SessionPhase, string> = {
	SHUFFLING: "Xào Bài",
	SELECTING: "Chọn Bài",
	REVEALING: "Lật Bài",
	INTERPRETING: "Giải Bài",
	COMPLETE: "Hoàn Thành",
};

export function TarotSessionPage() {
	const requiredCount = useTarotSessionStore((state) => state.requiredCards());
	const { phase, phaseOrder, goTo } = useTarotSession();
	const activePhaseIndex = phaseOrder.indexOf(phase);

	return (
		<div className="container mx-auto max-w-3xl px-6">
			<div className="mb-10 flex items-center justify-center gap-1">
				{phaseOrder.map((phaseName, index) => (
					<div key={phaseName} className="flex items-center gap-1">
						<div
							className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
								index === activePhaseIndex
									? "bg-primary text-primary-foreground glow-gold"
									: index < activePhaseIndex
										? "bg-primary/20 text-primary"
										: "bg-muted text-muted-foreground"
							}`}
						>
							{PHASE_LABELS[phaseName]}
						</div>
						{index < phaseOrder.length - 1 && (
							<div
								className={`h-0.5 w-4 ${index < activePhaseIndex ? "bg-primary/40" : "bg-muted"}`}
							/>
						)}
					</div>
				))}
			</div>

			<AnimatePresence mode="wait">
				{phase === "SHUFFLING" && (
					<ShufflingPhase key="shuffle" onComplete={() => goTo("SELECTING")} />
				)}
				{phase === "SELECTING" && (
					<CardDrawArea
						key="select"
						requiredCount={requiredCount}
						onConfirm={() => goTo("REVEALING")}
					/>
				)}
				{phase === "REVEALING" && (
					<CardReveal key="reveal" onAllRevealed={() => goTo("INTERPRETING")} />
				)}
				{phase === "INTERPRETING" && (
					<AIStreamPanel
						key="interpreting"
						onStreamComplete={() => goTo("COMPLETE")}
					/>
				)}
				{phase === "COMPLETE" && <CompletionPhase key="complete" />}
			</AnimatePresence>
		</div>
	);
}
