"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
	useSessionDetail,
	useTarotSession,
} from "@/features/tarot/hooks/use-tarot-session";
import type { SessionPhase } from "@/stores/use-tarot-session-store";
import { useTarotSessionStore } from "@/stores/use-tarot-session-store";
import { CardDrawArea } from "./phases/card-draw-area";
import { CardReveal } from "./phases/card-reveal";
import { CompletionPhase } from "./phases/completion-phase";
import { ShufflingPhase } from "./phases/shuffling-phase";
import { ExpiredSession } from "./session/expired-session";
import { InterpretPanel } from "./session/interpret-panel";

const PHASE_LABELS: Record<SessionPhase, string> = {
	SETUP: "Bắt Đầu",
	SHUFFLING: "Xào Bài",
	DRAWING: "Chọn Bài",
	REVEAL: "Lật Bài",
	INTERPRET: "Giải Bài",
	COMPLETE: "Hoàn Thành",
};

export function TarotSessionPage({ sessionId }: { sessionId: number }) {
	const { phase, phaseOrder, goTo } = useTarotSession();
	const activePhaseIndex = phaseOrder.indexOf(phase);
	const setActiveSession = useTarotSessionStore(
		(state) => state.setActiveSession,
	);

	const { data: sessionData, isLoading } = useSessionDetail(sessionId);

	console.log("TarotSessionPage render:", {
		sessionId,
		isLoading,
		status: sessionData?.status,
		phase,
	});

	useEffect(() => {
		if (sessionData) {
			console.log("TarotSessionPage sessionData received:", sessionData.status);
			setActiveSession(
				sessionData.sessionId,
				sessionData.spreadId,
				sessionData.mode,
				sessionData.mainQuestion,
			);

			// Resume logic
			if (sessionData.status === "COMPLETED") {
				console.log("Transitioning to COMPLETE");
				goTo("COMPLETE");
			} else if (sessionData.status === "INTERPRETING") {
				console.log("Transitioning to INTERPRET");
				goTo("INTERPRET");
			} else if (sessionData.status === "EXPIRED") {
				// Expired handled by a separate render path below
			} else {
				// PENDING
				if (phase === "COMPLETE" || phase === "SETUP") {
					console.log("Transitioning to SHUFFLING");
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

	return (
		<div className="container mx-auto max-w-3xl px-6">
			<div className="mb-10 flex flex-wrap items-center justify-center gap-1">
				{phaseOrder.map((phaseName, index) => (
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
						{index < phaseOrder.length - 1 && (
							<div
								className={`h-0.5 w-4 ${index < activePhaseIndex ? "bg-primary/40" : "bg-muted"}`}
							/>
						)}
					</div>
				))}
			</div>

			<AnimatePresence mode="wait">
				{phase === "SHUFFLING" && sessionData && (
					<ShufflingPhase key="shuffle" onComplete={() => goTo("DRAWING")} />
				)}
				{phase === "DRAWING" && sessionData && (
					<CardDrawArea
						key="draw"
						sessionId={sessionId}
						onConfirm={() => goTo("REVEAL")}
					/>
				)}
				{phase === "REVEAL" && sessionData && (
					<CardReveal key="reveal" onAllRevealed={() => goTo("INTERPRET")} />
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
