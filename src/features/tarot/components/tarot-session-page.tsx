"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
	useSessionDetail,
	useTarotSession,
} from "@/features/tarot/hooks/use-tarot-session";
import { useSpreads } from "@/features/tarot/hooks/use-spreads";
import type { SessionPhase } from "@/features/tarot/stores/use-tarot-session-store";
import { useTarotSessionStore } from "@/features/tarot/stores/use-tarot-session-store";
import { CardDrawArea } from "./phases/card-draw-area";
import { CompletionPhase } from "./phases/completion-phase";
import { ShufflingPhase } from "./phases/shuffling-phase";
import { ExpiredSession } from "./session/expired-session";
import { InterpretPanel } from "./session/interpret-panel";

const PHASE_LABELS: Record<SessionPhase, string> = {
	SETUP: "Bắt Đầu",
	SHUFFLING: "Xào Bài",
	DRAWING: "Bốc & Lật Bài",
	REVEAL: "Lật Bài",
	INTERPRET: "Giải Bài",
	COMPLETE: "Hoàn Thành",
};

// Phases shown in progress bar (skip SETUP & REVEAL since they merged into DRAWING)
const VISIBLE_PHASES: SessionPhase[] = ["SHUFFLING", "DRAWING", "INTERPRET", "COMPLETE"];

export function TarotSessionPage({ sessionId }: { sessionId: number }) {
	const { phase, goTo } = useTarotSession();
	const setActiveSession = useTarotSessionStore((state) => state.setActiveSession);

	const { data: sessionData, isLoading } = useSessionDetail(sessionId);
	const { data: spreads } = useSpreads();

	// Resolve how many cards to draw from the spread
	const spreadInfo = spreads?.find((s) => s.spreadId === sessionData?.spreadId);
	const cardsToDraw = spreadInfo?.positionCount ?? spreadInfo?.minCardsRequired ?? 3;

	useEffect(() => {
		if (sessionData) {
			setActiveSession(
				sessionData.sessionId,
				sessionData.spreadId,
				sessionData.mode,
				sessionData.mainQuestion,
			);

			// Resume logic
			if (sessionData.status === "COMPLETED") {
				goTo("COMPLETE");
			} else if (sessionData.status === "INTERPRETING") {
				goTo("INTERPRET");
			} else if (sessionData.status === "EXPIRED") {
				// handled below
			} else {
				// PENDING
				if (phase === "COMPLETE" || phase === "SETUP") {
					goTo("SHUFFLING");
				}
			}
		}
	}, [sessionData, setActiveSession, goTo, phase]);

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-4xl px-6 py-12">
				<div className="h-10 w-48 mx-auto bg-muted/20 animate-pulse rounded mb-8" />
				<div className="mx-auto h-100 max-w-2xl bg-muted/10 animate-pulse rounded-2xl" />
			</div>
		);
	}

	if (sessionData?.status === "EXPIRED") {
		return (
			<div className="container mx-auto max-w-3xl px-6 pt-12">
				<ExpiredSession />
			</div>
		);
	}

	const activePhaseIndex = VISIBLE_PHASES.indexOf(
		phase === "REVEAL" ? "DRAWING" : phase,
	);

	return (
		<div className="container mx-auto max-w-4xl px-6">
			{/* Progress bar — only show VISIBLE_PHASES */}
			<div className="mb-10 flex flex-wrap items-center justify-center gap-1">
				{VISIBLE_PHASES.map((phaseName, index) => (
					<div key={phaseName} className="flex items-center gap-1 mb-2">
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
						{index < VISIBLE_PHASES.length - 1 && (
							<div
								className={`h-0.5 w-6 ${index < activePhaseIndex ? "bg-primary/40" : "bg-muted"}`}
							/>
						)}
					</div>
				))}
			</div>

			<AnimatePresence mode="wait">
				{phase === "SHUFFLING" && sessionData && (
					<ShufflingPhase key="shuffle" onComplete={() => goTo("DRAWING")} />
				)}
				{(phase === "DRAWING" || phase === "REVEAL") && sessionData && (
					<CardDrawArea
						key="draw"
						sessionId={sessionId}
						cardsToDraw={cardsToDraw}
						onConfirm={() => goTo("INTERPRET")}
					/>
				)}
				{phase === "INTERPRET" && sessionData && (
					<InterpretPanel
						key="interpreting"
						sessionId={sessionId}
						status={sessionData.status}
						onComplete={() => goTo("COMPLETE")}
					/>
				)}
				{phase === "COMPLETE" && sessionData && (
					<CompletionPhase key="complete" sessionId={sessionId} />
				)}
			</AnimatePresence>
		</div>
	);
}
