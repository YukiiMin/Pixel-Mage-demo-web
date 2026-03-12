"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Save, Share2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import StarBackground from "@/components/ui/star-background";
import { MAJOR_ARCANA } from "@/lib/tarot-data";
import {
	type SessionPhase,
	useTarotSessionStore,
} from "@/stores/useTarotSessionStore";

/* ── helpers ── */
const shuffle = <T,>(arr: T[]): T[] => {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};

/* ── Phase 1: Shuffling ── */
const ShufflingPhase = ({ onDone }: { onDone: () => void; key?: string }) => {
	useEffect(() => {
		const t = setTimeout(onDone, 3000);
		return () => clearTimeout(t);
	}, [onDone]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
		>
			<div className="relative w-40 h-56">
				{[0, 1, 2, 3, 4].map((i) => (
					<motion.div
						key={i}
						className="absolute inset-0 rounded-xl border-2 border-primary/40 bg-gradient-to-br from-card to-card/60"
						style={{ originX: 0.5, originY: 1 }}
						animate={{
							rotate: [0, -15 + i * 8, 15 - i * 6, 0],
							x: [0, -20 + i * 10, 20 - i * 8, 0],
							y: [0, -5, 5, 0],
						}}
						transition={{
							duration: 0.8,
							repeat: Infinity,
							delay: i * 0.1,
							ease: "easeInOut",
						}}
					>
						<div className="w-full h-full rounded-xl flex items-center justify-center">
							<span className="text-3xl">🔮</span>
						</div>
					</motion.div>
				))}
			</div>
			<div className="text-center space-y-2">
				<motion.p
					className="text-xl font-bold text-foreground"
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 2, repeat: Infinity }}
				>
					Đang xào bài...
				</motion.p>
				<p className="text-sm text-muted-foreground">
					Hãy tập trung vào câu hỏi của bạn
				</p>
			</div>
			{/* progress */}
			<div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
				<motion.div
					className="h-full bg-primary rounded-full"
					initial={{ width: 0 }}
					animate={{ width: "100%" }}
					transition={{ duration: 3, ease: "linear" }}
				/>
			</div>
		</motion.div>
	);
};

/* ── Phase 2: Selecting ── */
const SelectingPhase = ({
	required,
	onComplete,
}: {
	required: number;
	onComplete: () => void;
	key?: string;
}) => {
	const { selectedCards, addCard } = useTarotSessionStore();
	const [deck] = useState(() => shuffle(MAJOR_ARCANA).slice(0, 18));
	const [pickedIds, setPickedIds] = useState<Set<number>>(new Set());

	const handlePick = (cardData: (typeof MAJOR_ARCANA)[0]) => {
		if (pickedIds.has(cardData.id) || selectedCards.length >= required) return;
		setPickedIds((s) => new Set(s).add(cardData.id));
		const isReversed = Math.random() < 0.3;
		addCard({
			index: selectedCards.length,
			card: {
				id: cardData.id,
				name: cardData.name,
				image: "",
				isReversed,
				meaning: isReversed
					? cardData.reversedMeaning
					: cardData.uprightMeaning,
			},
		});
	};

	const allPicked = selectedCards.length >= required;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="space-y-8"
		>
			<div className="text-center space-y-1">
				<h2 className="text-2xl font-bold text-foreground">
					Chọn {required} lá bài
				</h2>
				<p className="text-sm text-muted-foreground">
					Hãy để trực giác dẫn lối — bấm vào lá bạn cảm nhận
				</p>
			</div>

			{/* Card fan */}
			<div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
				{deck.map((c, i) => {
					const picked = pickedIds.has(c.id);
					return (
						<motion.button
							key={c.id}
							onClick={() => handlePick(c)}
							disabled={picked || allPicked}
							initial={{ opacity: 0, y: 30 }}
							animate={{
								opacity: picked ? 0.3 : 1,
								y: 0,
								scale: picked ? 0.9 : 1,
							}}
							transition={{ delay: i * 0.04 }}
							whileHover={!picked && !allPicked ? { y: -8, scale: 1.05 } : {}}
							className={`w-16 h-24 md:w-20 md:h-28 rounded-lg border-2 flex items-center justify-center transition-colors ${
								picked
									? "border-primary/20 bg-card/30 cursor-default"
									: "border-primary/40 bg-gradient-to-br from-card to-card/80 cursor-pointer hover:border-primary hover:glow-gold"
							}`}
						>
							<span className="text-2xl">{picked ? "✦" : "✧"}</span>
						</motion.button>
					);
				})}
			</div>

			{/* Slots */}
			<div className="flex justify-center gap-4">
				{Array.from({ length: required }).map((_, i) => {
					const filled = selectedCards[i];
					return (
						<motion.div
							key={i}
							className={`w-20 h-28 md:w-24 md:h-32 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
								filled
									? "border-primary bg-primary/10 glow-gold"
									: "border-muted-foreground/30 bg-card/20"
							}`}
							animate={filled ? { scale: [1, 1.08, 1] } : {}}
							transition={{ duration: 0.3 }}
						>
							{filled ? (
								<motion.div
									initial={{ scale: 0, rotate: -180 }}
									animate={{ scale: 1, rotate: 0 }}
									className="text-center"
								>
									<span className="text-2xl">🂠</span>
									<p className="text-[10px] text-primary font-medium mt-1">
										Lá {i + 1}
									</p>
								</motion.div>
							) : (
								<span className="text-xs text-muted-foreground">
									Slot {i + 1}
								</span>
							)}
						</motion.div>
					);
				})}
			</div>

			{/* Confirm */}
			<div className="text-center">
				<Button
					onClick={onComplete}
					disabled={!allPicked}
					className="gradient-gold-purple-bg text-primary-foreground font-semibold rounded-full px-8 glow-gold hover:scale-105 transition-transform disabled:opacity-40"
				>
					<Sparkles className="w-4 h-4 mr-1" /> Xem Bài
				</Button>
			</div>
		</motion.div>
	);
};

/* ── Phase 3: Revealing ── */
const RevealingPhase = ({ onDone }: { onDone: () => void; key?: string }) => {
	const { selectedCards, revealedCount, setRevealedCount } =
		useTarotSessionStore();

	useEffect(() => {
		if (revealedCount >= selectedCards.length) {
			const t = setTimeout(onDone, 600);
			return () => clearTimeout(t);
		}
		const t = setTimeout(() => setRevealedCount(revealedCount + 1), 800);
		return () => clearTimeout(t);
	}, [revealedCount, selectedCards.length, onDone, setRevealedCount]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="space-y-8"
		>
			<h2 className="text-2xl font-bold text-center text-foreground">
				Lật Bài...
			</h2>
			<div className="flex justify-center gap-6 flex-wrap">
				{selectedCards.map((slot, i) => {
					const revealed = i < revealedCount;
					const cardInfo = MAJOR_ARCANA.find((c) => c.id === slot.card.id);
					return (
						<div key={i} className="relative" style={{ perspective: 800 }}>
							<motion.div
								className="w-28 h-40 md:w-36 md:h-52 relative"
								style={{ transformStyle: "preserve-3d" }}
								animate={{ rotateY: revealed ? 180 : 0 }}
								transition={{ duration: 0.6, ease: "easeInOut" }}
							>
								{/* Back */}
								<div
									className="absolute inset-0 rounded-xl border-2 border-primary/40 bg-gradient-to-br from-card to-card/80 flex items-center justify-center"
									style={{ backfaceVisibility: "hidden" }}
								>
									<span className="text-4xl">🂠</span>
								</div>
								{/* Front */}
								<div
									className={`absolute inset-0 rounded-xl border-2 flex flex-col items-center justify-center gap-2 p-3 ${
										revealed
											? "glow-gold border-primary bg-card"
											: "border-primary/40 bg-card"
									}`}
									style={{
										backfaceVisibility: "hidden",
										transform: "rotateY(180deg)",
									}}
								>
									<span className="text-3xl">🔮</span>
									<p className="text-xs font-bold text-foreground text-center leading-tight">
										{cardInfo?.nameVi}
									</p>
									<p className="text-[10px] text-muted-foreground text-center">
										{cardInfo?.name}
									</p>
									{slot.card.isReversed && (
										<motion.span
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"
										>
											REVERSED
										</motion.span>
									)}
								</div>
							</motion.div>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
};

/* ── Phase 4: Interpreting ── */
const InterpretingPhase = ({
	onDone,
}: {
	onDone: () => void;
	key?: string;
}) => {
	const { selectedCards, interpretation, setInterpretation } =
		useTarotSessionStore();
	const doneRef = useRef(false);

	useEffect(() => {
		if (doneRef.current) return;
		doneRef.current = true;

		const lines: string[] = ["✨ Thông Điệp Từ Vũ Trụ\n"];
		selectedCards.forEach((slot, i) => {
			const card = MAJOR_ARCANA.find((c) => c.id === slot.card.id);
			if (!card) return;
			const pos =
				selectedCards.length === 3
					? ["Quá Khứ", "Hiện Tại", "Tương Lai"][i]
					: `Lá ${i + 1}`;
			lines.push(
				`\n🃏 ${pos}: ${card.nameVi} (${card.name})${slot.card.isReversed ? " — Ngược" : ""}\n${slot.card.meaning}\n`,
			);
		});
		lines.push(
			"\n🔮 Tổng Hợp\nCác lá bài cho thấy một hành trình chuyển đổi đáng kể. Hãy tin tưởng vào trực giác của bạn và sẵn sàng đón nhận những thay đổi mới.\n",
		);
		lines.push(
			"\n💡 Lời Khuyên\nĐừng sợ bước ra khỏi vùng an toàn. Vũ trụ đang ủng hộ bạn trên con đường phía trước.",
		);

		const full = lines.join("");
		let idx = 0;
		const timer = setInterval(() => {
			idx += 2;
			if (idx >= full.length) {
				setInterpretation(full);
				clearInterval(timer);
				setTimeout(onDone, 500);
				return;
			}
			setInterpretation(full.slice(0, idx));
		}, 20);

		return () => clearInterval(timer);
	}, [selectedCards, setInterpretation, onDone]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			className="space-y-6"
		>
			<h2 className="text-2xl font-bold text-center text-foreground">
				<Sparkles className="inline w-5 h-5 text-primary mr-2" />
				Divine Interpretation
			</h2>
			<div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto min-h-[200px]">
				<pre className="whitespace-pre-wrap text-sm text-foreground/90 font-[var(--font-body)] leading-relaxed">
					{interpretation}
					<motion.span
						animate={{ opacity: [1, 0] }}
						transition={{ duration: 0.5, repeat: Infinity }}
						className="text-primary"
					>
						▊
					</motion.span>
				</pre>
			</div>
		</motion.div>
	);
};

/* ── Phase 5: Complete ── */
const CompletePhase = ({ key }: { key?: string }) => {
	const router = useRouter();
	const { interpretation, selectedCards, reset } = useTarotSessionStore();

	const handleRedo = () => {
		reset();
		router.push("/tarot");
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="space-y-8"
		>
			{/* Card summary */}
			<div className="flex justify-center gap-4 flex-wrap">
				{selectedCards.map((slot, i) => {
					const card = MAJOR_ARCANA.find((c) => c.id === slot.card.id);
					return (
						<motion.div
							key={i}
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: i * 0.15 }}
							className="glass-card rounded-xl p-4 w-28 text-center glow-gold"
						>
							<span className="text-2xl block mb-1">🔮</span>
							<p className="text-xs font-bold text-foreground">
								{card?.nameVi}
							</p>
							{slot.card.isReversed && (
								<span className="text-[9px] text-destructive font-bold">
									REVERSED
								</span>
							)}
						</motion.div>
					);
				})}
			</div>

			{/* Interpretation */}
			<div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
				<pre className="whitespace-pre-wrap text-sm text-foreground/90 font-[var(--font-body)] leading-relaxed">
					{interpretation}
				</pre>
			</div>

			{/* CTAs */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="flex justify-center gap-4 flex-wrap"
			>
				<Button className="gradient-gold-purple-bg text-primary-foreground rounded-full px-6 glow-gold hover:scale-105 transition-transform">
					<Save className="w-4 h-4 mr-1" /> Lưu
				</Button>
				<Button
					variant="outline"
					className="rounded-full px-6 border-primary/40 text-primary hover:bg-primary/10"
				>
					<Share2 className="w-4 h-4 mr-1" /> Chia Sẻ
				</Button>
				<Button
					variant="ghost"
					onClick={handleRedo}
					className="rounded-full px-6 text-muted-foreground hover:text-foreground"
				>
					<RotateCcw className="w-4 h-4 mr-1" /> Đọc Lại
				</Button>
			</motion.div>
		</motion.div>
	);
};

/* ── Main Session Page ── */
export default function TarotSessionPage() {
	const { phase, setPhase } = useTarotSessionStore();

	const goTo = useCallback((p: SessionPhase) => () => setPhase(p), [setPhase]);

	const phaseLabels: Record<SessionPhase, string> = {
		SHUFFLING: "Xào Bài",
		SELECTING: "Chọn Bài",
		REVEALING: "Lật Bài",
		INTERPRETING: "Giải Bài",
		COMPLETE: "Hoàn Thành",
	};

	const phases: SessionPhase[] = [
		"SHUFFLING",
		"SELECTING",
		"REVEALING",
		"INTERPRETING",
		"COMPLETE",
	];
	const idx = phases.indexOf(phase);
	const required = useTarotSessionStore((s) => s.requiredCards());

	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pt-28 pb-20">
				<div className="container mx-auto px-6 max-w-3xl">
					{/* Phase bar */}
					<div className="flex items-center justify-center gap-1 mb-10">
						{phases.map((p, i) => (
							<div key={p} className="flex items-center gap-1">
								<div
									className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
										i === idx
											? "bg-primary text-primary-foreground glow-gold"
											: i < idx
												? "bg-primary/20 text-primary"
												: "bg-muted text-muted-foreground"
									}`}
								>
									{phaseLabels[p]}
								</div>
								{i < phases.length - 1 && (
									<div
										className={`w-4 h-0.5 ${i < idx ? "bg-primary/40" : "bg-muted"}`}
									/>
								)}
							</div>
						))}
					</div>

					<AnimatePresence mode="wait">
						{phase === "SHUFFLING" && (
							<ShufflingPhase key="shuffle" onDone={goTo("SELECTING")} />
						)}
						{phase === "SELECTING" && (
							<SelectingPhase
								key="select"
								required={required}
								onComplete={goTo("REVEALING")}
							/>
						)}
						{phase === "REVEALING" && (
							<RevealingPhase key="reveal" onDone={goTo("INTERPRETING")} />
						)}
						{phase === "INTERPRETING" && (
							<InterpretingPhase key="interp" onDone={goTo("COMPLETE")} />
						)}
						{phase === "COMPLETE" && <CompletePhase key="complete" />}
					</AnimatePresence>
				</div>
			</main>
		</div>
	);
}
