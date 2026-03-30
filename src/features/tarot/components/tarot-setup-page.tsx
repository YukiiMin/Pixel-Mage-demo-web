"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMyCards } from "@/features/inventory/hooks/use-my-cards";
import { useAccountProfile } from "@/features/profile/hooks/use-account-profile";
import { ActiveSessionBanner } from "@/features/tarot/components/active-session-banner";
import { GuestReadingBanner } from "@/features/tarot/components/guest-reading-banner";
import { ReadingHistory } from "@/features/tarot/components/reading-history";
import { SpreadSelector } from "@/features/tarot/components/spread-selector";
import { getStoredUserId } from "@/lib/api-config";
import { fadeInUp, staggerContainer } from "@/lib/motion-variants";
import { TOPICS } from "@/lib/tarot-data";
import { isSameDay } from "@/lib/utils";
import { useTarotSessionStore } from "@/stores/use-tarot-session-store";
import type { ApiHttpError } from "@/types/api";
import { useCreateSession } from "../hooks/use-create-session";

const STEPS = ["Chọn Chủ Đề", "Câu Hỏi", "Kiểu Trải Bài"];

export function TarotSetupPage() {
	const shouldReduceMotion = useReducedMotion();
	const [step, setStep] = useState(0);
	const router = useRouter();

	const selectedSpreadId = useTarotSessionStore((s) => s.selectedSpreadId);
	const mainQuestion = useTarotSessionStore((s) => s.mainQuestion);
	const setMainQuestion = useTarotSessionStore((s) => s.setMainQuestion);

	// Local state for step 0 since it's not needed in BE request, just a UI wizard step
	const [topic, setTopic] = useState<string | null>(null);

	const [userId, setUserId] = useState<number | null>(null);
	useEffect(() => {
		setUserId(getStoredUserId());
	}, []);

	const { data: inventory } = useMyCards(userId);
	const { data: account } = useAccountProfile(userId);

	const hasCards = (inventory ?? []).length > 0;
	const usedGuestToday =
		account?.guestReadingUsedAt !== null &&
		account?.guestReadingUsedAt !== undefined &&
		isSameDay(new Date(account.guestReadingUsedAt), new Date());

	const canStart = hasCards || (!hasCards && !usedGuestToday);

	const createSession = useCreateSession(userId);
	const [activeSessionBannerData, setActiveSessionBannerData] = useState<
		number | null
	>(null);

	const canContinue =
		step === 0 ? Boolean(topic) : step === 2 ? Boolean(selectedSpreadId) : true;

	const handleStart = async () => {
		if (!selectedSpreadId) return;
		try {
			const session = await createSession.mutateAsync({
				spreadId: selectedSpreadId,
				mainQuestion: mainQuestion.trim(),
				mode: "EXPLORE", // LUÔN LUÔN
			});
			router.push(`/tarot/session/${session.sessionId}`);
		} catch (error) {
			const err = error as ApiHttpError;
			if (err.status === 409) {
				const resData = err.data as { data?: { activeSessionId?: number } };
				const activeSessionId = resData?.data?.activeSessionId;
				setActiveSessionBannerData(activeSessionId || null);
			}
		}
	};

	return (
		<div className="container mx-auto max-w-2xl px-6">
			<div className="mb-10 flex items-center justify-center gap-2">
				{STEPS.map((label, index) => (
					<div key={label} className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => index < step && setStep(index)}
							className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
								index === step
									? "scale-110 bg-primary text-primary-foreground glow-gold"
									: index < step
										? "cursor-pointer bg-primary/30 text-primary"
										: "bg-muted text-muted-foreground"
							}`}
						>
							{index + 1}
						</button>
						{index < STEPS.length - 1 && (
							<div
								className={`h-0.5 w-12 transition-colors duration-300 ${index < step ? "bg-primary/50" : "bg-muted"}`}
							/>
						)}
					</div>
				))}
			</div>

			<AnimatePresence mode="wait">
				{step === 0 && (
					<motion.div
						key="topic"
						variants={shouldReduceMotion ? {} : staggerContainer}
						initial={shouldReduceMotion ? { opacity: 1 } : "hidden"}
						animate="visible"
						exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -60 }}
						className="space-y-6"
					>
						<motion.h2
							variants={shouldReduceMotion ? {} : fadeInUp}
							className="text-center text-3xl font-bold"
						>
							Bạn muốn hỏi về{" "}
							<span className="gradient-gold-purple">điều gì?</span>
						</motion.h2>
						<motion.div
							variants={shouldReduceMotion ? {} : fadeInUp}
							className="grid grid-cols-2 gap-4"
						>
							{TOPICS.map((t) => (
								<button
									type="button"
									key={t.key}
									onClick={() => setTopic(t.key)}
									className={`glass-card group rounded-2xl p-6 text-center transition-all duration-300 ${!shouldReduceMotion && "hover:scale-105"} ${
										topic === t.key
											? "ring-2 ring-primary glow-gold"
											: "hover:border-primary/30"
									}`}
								>
									<span className="mb-3 block text-4xl transition-transform group-hover:scale-110">
										{t.emoji}
									</span>
									<span className="font-semibold text-foreground">
										{t.label}
									</span>
								</button>
							))}
						</motion.div>
					</motion.div>
				)}

				{step === 1 && (
					<motion.div
						key="question"
						variants={shouldReduceMotion ? {} : staggerContainer}
						initial={shouldReduceMotion ? { opacity: 1 } : "hidden"}
						animate="visible"
						exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -60 }}
						className="space-y-6"
					>
						<motion.h2
							variants={shouldReduceMotion ? {} : fadeInUp}
							className="text-center text-3xl font-bold"
						>
							Bạn muốn hỏi <span className="gradient-gold-purple">câu gì?</span>
						</motion.h2>
						<motion.p
							variants={shouldReduceMotion ? {} : fadeInUp}
							className="text-center text-sm text-muted-foreground"
						>
							Tùy chọn — bạn có thể bỏ qua nếu muốn đọc bài tổng quát
						</motion.p>
						<motion.div variants={shouldReduceMotion ? {} : fadeInUp}>
							<Textarea
								value={mainQuestion}
								onChange={(event) => setMainQuestion(event.target.value)}
								placeholder="Ví dụ: Mối quan hệ hiện tại của tôi sẽ đi về đâu?"
								className="min-h-30 resize-none rounded-xl border-border/50 bg-card/60 text-foreground placeholder:text-muted-foreground/60"
								maxLength={500}
							/>
							<p className="mt-1 text-right text-xs text-muted-foreground">
								{mainQuestion.length}/500
							</p>
						</motion.div>
					</motion.div>
				)}

				{step === 2 && <SpreadSelector />}
			</AnimatePresence>

			{step === 2 && activeSessionBannerData !== null && (
				<ActiveSessionBanner sessionId={activeSessionBannerData} />
			)}

			{step === 2 && !canStart && activeSessionBannerData === null && (
				<GuestReadingBanner />
			)}

			<div className="mt-10 flex justify-between">
				<Button
					type="button"
					variant="ghost"
					onClick={() => setStep((current) => current - 1)}
					className={step === 0 ? "invisible" : ""}
				>
					<ArrowLeft className="mr-1 h-4 w-4" /> Quay Lại
				</Button>
				{step < 2 ? (
					<Button
						onClick={() => setStep((current) => current + 1)}
						disabled={!canContinue}
						className="gradient-gold-purple-bg rounded-full px-6 font-semibold text-primary-foreground glow-gold transition-transform hover:scale-105"
					>
						Tiếp Theo <ArrowRight className="ml-1 h-4 w-4" />
					</Button>
				) : (
					<Button
						onClick={handleStart}
						disabled={
							!canStart ||
							activeSessionBannerData !== null ||
							createSession.isPending ||
							!selectedSpreadId
						}
						className="gradient-gold-purple-bg rounded-full px-8 font-semibold text-primary-foreground glow-gold transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Sparkles className="mr-1 h-4 w-4" />{" "}
						{createSession.isPending ? "Đang Bắt Đầu..." : "Bắt Đầu Đọc Bài"}
					</Button>
				)}
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.8 }}
				className="glass-card mt-12 flex items-start gap-3 rounded-xl p-4"
			>
				<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
				<div>
					<p className="text-sm font-semibold text-foreground">Lưu ý</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Tarot là công cụ suy ngẫm, không phải lời tiên tri. Kết quả chỉ mang
						tính tham khảo, hãy luôn dùng phán đoán của riêng bạn cho các quyết
						định quan trọng.
					</p>
				</div>
			</motion.div>

			<div id="reading-history">
				<ReadingHistory />
			</div>
		</div>
	);
}
