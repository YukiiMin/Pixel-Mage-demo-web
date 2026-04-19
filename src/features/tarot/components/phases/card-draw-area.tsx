"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, Sparkles, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { useTarotSessionStore } from "@/features/tarot/stores/use-tarot-session-store";
import type { ReadingCard } from "@/features/tarot/types";
import { useCardTemplates } from "@/features/tarot/hooks/use-card-templates";
import type { CardTemplateItem } from "@/features/tarot/hooks/use-card-templates";
import { useSfx } from "@/features/audio/hooks/use-sfx";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface CardDrawAreaProps {
	sessionId: number;
	cardsToDraw: number;
	onConfirm: () => void;
}

interface DrawnSlot {
	templateId: number;
	name: string;
	imageUrl: string | null;
	isFlipped: boolean;
	isReversed?: boolean;
	readingCardId?: number;
	positionName?: string;
}

interface FlyingCardData {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	id: number;
}

interface BurstData {
	x: number;
	y: number;
	id: number;
}

interface ArcaneRuneData {
	x: number;
	y: number;
	rune: string;
	delay: number;
	id: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const CARD_BACK = "/images/deck/card-back.jpg";
const ARCANE_RUNES = ["ᚠ", "ᚱ", "ᚦ", "ᚨ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "✦", "✧", "⋆", "☽", "✴"];

function shuffleArray<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// ─────────────────────────────────────────────────────────────────────────────
// ArcaneRune — floats up from deck when card is drawn
// ─────────────────────────────────────────────────────────────────────────────
function ArcaneRune({ x, y, rune, delay }: ArcaneRuneData) {
	return (
		<motion.span
			className="pointer-events-none fixed select-none font-bold text-primary"
			style={{ left: x, top: y, zIndex: 9990, textShadow: "0 0 10px hsl(45 65% 55%), 0 0 20px hsl(270 60% 70%)", fontSize: "14px" }}
			initial={{ opacity: 0, y: 0, scale: 0.5, rotate: -10 }}
			animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.5, 1.3, 1.1, 0.4], rotate: 15 }}
			transition={{ duration: 1.5, delay, ease: "easeOut" }}
		>
			{rune}
		</motion.span>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// LandingBurst — particle explosion when card lands in slot
// ─────────────────────────────────────────────────────────────────────────────
function LandingBurst({ x, y }: { x: number; y: number }) {
	const particles = useMemo(
		() =>
			Array.from({ length: 16 }).map((_, i) => {
				const angle = (i / 16) * Math.PI * 2;
				const dist = 35 + Math.random() * 45;
				return {
					dx: Math.cos(angle) * dist,
					dy: Math.sin(angle) * dist,
					delay: Math.random() * 0.1,
					color:
						i % 3 === 0
							? "hsl(45,90%,65%)"
							: i % 3 === 1
								? "hsl(270,70%,75%)"
								: "hsl(200,80%,75%)",
					size: 4 + Math.random() * 6,
				};
			}),
		[],
	);

	return (
		<>
			{/* Center flash */}
			<motion.div
				className="pointer-events-none fixed rounded-full"
				style={{
					left: x - 40,
					top: y - 40,
					width: 80,
					height: 80,
					zIndex: 9994,
					background: "radial-gradient(circle, hsl(45 90% 65% / 0.9), hsl(270 65% 70% / 0.5), transparent)",
				}}
				initial={{ opacity: 1, scale: 0 }}
				animate={{ opacity: 0, scale: 2.5 }}
				transition={{ duration: 0.5 }}
			/>
			{/* Particles */}
			{particles.map((p, i) => (
				<motion.div
					key={i}
					className="pointer-events-none fixed rounded-full"
					style={{
						left: x - p.size / 2,
						top: y - p.size / 2,
						width: p.size,
						height: p.size,
						background: p.color,
						zIndex: 9993,
						boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
					}}
					initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
					animate={{ opacity: 0, scale: 0.2, x: p.dx, y: p.dy }}
					transition={{ duration: 0.85, delay: p.delay, ease: "easeOut" }}
				/>
			))}
		</>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ArcaneSummonCircle — mystic ring that appears at deck when card is drawn
// ─────────────────────────────────────────────────────────────────────────────
function ArcaneSummonCircle({ x, y }: { x: number; y: number }) {
	return (
		<motion.div
			className="pointer-events-none fixed"
			style={{ left: x - 90, top: y - 90, zIndex: 9988 }}
			initial={{ opacity: 0, scale: 0.2, rotate: -30 }}
			animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1.1, 1.0, 1.3], rotate: 180 }}
			transition={{ duration: 0.9, ease: "easeOut" }}
		>
			<svg width="180" height="180" viewBox="0 0 180 180">
				<circle cx="90" cy="90" r="80" fill="none" stroke="hsl(270,65%,70%)" strokeWidth="1" strokeDasharray="10 8" opacity="0.8" />
				<circle cx="90" cy="90" r="62" fill="none" stroke="hsl(45,80%,60%)" strokeWidth="0.8" strokeDasharray="5 10" opacity="0.65" />
				<circle cx="90" cy="90" r="44" fill="none" stroke="hsl(270,65%,70%)" strokeWidth="0.5" opacity="0.45" />
				{/* Pentagram points */}
				{Array.from({ length: 5 }).map((_, i) => {
					const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
					const px = 90 + Math.cos(a) * 60;
					const py = 90 + Math.sin(a) * 60;
					return (
						<motion.circle
							key={i}
							cx={px}
							cy={py}
							r="3.5"
							fill="hsl(45,90%,70%)"
							opacity="0.9"
							animate={{ scale: [1, 1.5, 1] }}
							transition={{ duration: 0.5, delay: i * 0.08 }}
						/>
					);
				})}
			</svg>
		</motion.div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// CardZoomPopup
// ─────────────────────────────────────────────────────────────────────────────
function CardZoomPopup({ card, onClose }: { card: DrawnSlot; onClose: () => void }) {
	const imageUrl = card.imageUrl ?? CARD_BACK;
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.4, rotateY: -50, y: 40 }}
				animate={{ scale: 1, rotateY: 0, y: 0 }}
				exit={{ scale: 0.3, opacity: 0 }}
				transition={{ type: "spring", stiffness: 280, damping: 20 }}
				className="relative max-h-[88vh] max-w-[300px] cursor-default"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="glass-card absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white hover:text-destructive transition-colors"
				>
					<X className="h-4 w-4" />
				</button>
				{/* Arcane glow */}
				<div
					className="absolute inset-0 rounded-2xl blur-xl"
					style={{ background: "radial-gradient(ellipse, hsl(45 70% 50% / 0.45), hsl(270 60% 55% / 0.35), transparent)" }}
				/>
				<div
					className="relative overflow-hidden rounded-2xl shadow-2xl border border-primary/40"
					style={{ transform: card.isReversed ? "rotate(180deg)" : undefined }}
				>
					<img src={imageUrl} alt={card.name} className="h-full w-full object-cover" />
				</div>
				<div className="mt-4 text-center space-y-1">
					<p
						className="font-bold text-primary text-lg"
						style={{ textShadow: "0 0 16px hsl(45 65% 55%)" }}
					>
						{card.name}
					</p>
					{card.isReversed && (
						<span className="inline-block rounded bg-destructive/20 px-3 py-0.5 text-xs font-bold text-destructive">
							NGƯỢC
						</span>
					)}
					{card.positionName && (
						<p className="text-sm text-muted-foreground">Vị trí: {card.positionName}</p>
					)}
				</div>
			</motion.div>
		</motion.div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// CardSlot — empty placeholder or drawn card with 3D flip
// ─────────────────────────────────────────────────────────────────────────────
function CardSlot({
	slot,
	index,
	onFlip,
	onZoom,
	isAllCommitted,
	slotRef,
}: {
	slot: DrawnSlot | null;
	index: number;
	onFlip: (index: number) => void;
	onZoom: (slot: DrawnSlot) => void;
	isAllCommitted: boolean;
	slotRef?: (el: HTMLDivElement | null) => void;
}) {
	if (!slot) {
		return (
			<div className="flex flex-col items-center gap-2">
				<div
					ref={slotRef}
					className="relative h-[150px] w-[96px] rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden"
				>
					{/* Animated arcane placeholder */}
					<motion.div
						className="absolute inset-0"
						style={{ background: "radial-gradient(circle, hsl(270 60% 50% / 0.04), transparent)" }}
						animate={{ opacity: [0.5, 1, 0.5] }}
						transition={{ duration: 3 + index * 0.3, repeat: Number.POSITIVE_INFINITY }}
					/>
					<motion.span
						className="text-2xl select-none"
						style={{ textShadow: "0 0 8px hsl(45 65% 55% / 0.4)" }}
						animate={{ opacity: [0.15, 0.45, 0.15], scale: [0.9, 1.1, 0.9] }}
						transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: index * 0.25 }}
					>
						✦
					</motion.span>
					{/* Corner runes */}
					<span className="absolute top-1 left-1.5 text-[9px] text-primary/25 font-bold select-none">ᚠ</span>
					<span className="absolute top-1 right-1.5 text-[9px] text-primary/25 font-bold select-none">ᚱ</span>
					<span className="absolute bottom-1 left-1.5 text-[9px] text-primary/25 font-bold select-none">ᚦ</span>
					<span className="absolute bottom-1 right-1.5 text-[9px] text-primary/25 font-bold select-none">ᚨ</span>
				</div>
				<span className="text-xs text-muted-foreground">Lá {index + 1}</span>
			</div>
		);
	}

	const imageUrl = slot.imageUrl ?? CARD_BACK;

	return (
		<div className="flex flex-col items-center gap-2">
			<motion.div
				layoutId={`card-container-${index + 1}`}
				ref={slotRef as any}
				className="relative h-[150px] w-[96px] cursor-pointer group"
				style={{ perspective: "1000px" }}
				onClick={() => {
					if (!slot.isFlipped && isAllCommitted) {
						onFlip(index);
					} else if (slot.isFlipped) {
						onZoom(slot);
					}
				}}
			>
				{/* Hover arcane glow */}
				<motion.div
					className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
					style={{ background: "radial-gradient(ellipse, hsl(45 70% 55% / 0.3), hsl(270 60% 70% / 0.2), transparent)" }}
				/>

				{/* 3D flip container */}
				<motion.div
					className="relative h-full w-full"
					style={{ transformStyle: "preserve-3d" }}
					animate={{ rotateY: slot.isFlipped ? 180 : 0 }}
					transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
				>
					{/* Back face */}
					<div
						className="absolute inset-0 rounded-xl overflow-hidden border border-primary/30 shadow-xl"
						style={{
							backfaceVisibility: "hidden",
							backgroundImage: `url('${CARD_BACK}')`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					>
						{!slot.isFlipped && isAllCommitted && (
							<motion.div
								className="absolute inset-0 flex items-center justify-center"
								style={{ background: "radial-gradient(circle, hsl(45 65% 55% / 0.25), transparent)" }}
								animate={{ opacity: [0, 0.9, 0] }}
								transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
							>
								<motion.span
									className="text-xl"
									animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
									transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
								>
									✦
								</motion.span>
							</motion.div>
						)}
					</div>

					{/* Front face */}
					<div
						className="absolute inset-0 rounded-xl overflow-hidden border border-primary/50 shadow-2xl"
						style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
					>
						{/* Flare burst behind the image but inside the container */}
						<motion.div
							className="absolute -inset-10 z-0 pointer-events-none"
							style={{ background: "radial-gradient(circle, hsl(45 65% 55%), transparent 70%)" }}
							initial={{ opacity: 1, scale: 0.5 }}
							animate={{ opacity: 0, scale: 1.8 }}
							transition={{ duration: 0.9, ease: "easeOut" }}
						/>

						<img
							src={imageUrl}
							alt={slot.name}
							className="relative z-10 h-full w-full object-cover"
							style={{ transform: slot.isReversed ? "rotate(180deg)" : undefined }}
						/>

						{/* Shimmer sweep */}
						<motion.div
							className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
							style={{
								background:
									"linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)",
							}}
							initial={{ x: "-150%" }}
							animate={{ x: "150%" }}
							transition={{ duration: 1.2, ease: "easeInOut", delay: 0.15 }}
						/>
					</div>
				</motion.div>
			</motion.div>

			{/* Label */}
			<div className="text-center space-y-0.5 max-w-[108px]">
				{slot.isFlipped ? (
					<>
						<p className="text-xs font-bold text-primary truncate">{slot.name}</p>
						{slot.isReversed && (
							<span className="text-[9px] rounded bg-destructive/20 px-1.5 py-0.5 text-destructive font-bold">
								NGƯỢC
							</span>
						)}
						{slot.positionName && (
							<p className="text-[10px] text-muted-foreground truncate">{slot.positionName}</p>
						)}
					</>
				) : (
					<>
						<span className="text-xs text-muted-foreground">Lá {index + 1}</span>
						{isAllCommitted && (
							<motion.p
								className="text-[10px] text-primary/70"
								animate={{ opacity: [0.4, 1, 0.4] }}
								transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
							>
								Nhấn để lật
							</motion.p>
						)}
					</>
				)}
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main: CardDrawArea
// ─────────────────────────────────────────────────────────────────────────────
export function CardDrawArea({ sessionId, cardsToDraw, onConfirm }: CardDrawAreaProps) {
	const setReadingCards = useTarotSessionStore((s) => s.setReadingCards);
	const sfx = useSfx();

	const { data: templates, isLoading: isLoadingTemplates } = useCardTemplates(1);
	const shuffledDeck = useMemo<CardTemplateItem[]>(() => {
		if (!templates || templates.length === 0) return [];
		return shuffleArray(templates);
	}, [templates]);

	// ── Core state ─────────────────────────────────────────────────────────────
	const [drawnSlots, setDrawnSlots] = useState<(DrawnSlot | null)[]>(
		() => Array(cardsToDraw).fill(null),
	);
	const [deckIndex, setDeckIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isCommitting, setIsCommitting] = useState(false);
	const [commitError, setCommitError] = useState<string | null>(null);
	const [isAllCommitted, setIsAllCommitted] = useState(false);
	const [zoomedCard, setZoomedCard] = useState<DrawnSlot | null>(null);

	// ── Visual effects state ────────────────────────────────────────────────────
	const [flyingCard, setFlyingCard] = useState<FlyingCardData | null>(null);
	const [landingBursts, setLandingBursts] = useState<BurstData[]>([]);
	const [arcaneRunes, setArcaneRunes] = useState<ArcaneRuneData[]>([]);
	const [summonCircle, setSummonCircle] = useState<{ x: number; y: number; id: number } | null>(null);

	// ── Refs for position calculations ─────────────────────────────────────────
	const deckRef = useRef<HTMLButtonElement>(null);
	const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

	const drawnCount = drawnSlots.filter(Boolean).length;
	const allDrawn = drawnCount === cardsToDraw;
	const allFlipped = drawnSlots.every((s) => s?.isFlipped);

	// ── DRAW action ─────────────────────────────────────────────────────────────
	const handleDraw = useCallback(() => {
		if (isAnimating || allDrawn || deckIndex >= shuffledDeck.length) return;

		const nextSlotIndex = drawnSlots.findIndex((s) => s === null);
		if (nextSlotIndex === -1) return;

		const templateItem = shuffledDeck[deckIndex];
		setIsAnimating(true);
		sfx.playCardDraw();

		// Calculate flying card trajectory
		const deckEl = deckRef.current;
		const slotEl = slotRefs.current[nextSlotIndex];
		const effectId = Date.now();

		if (deckEl && slotEl) {
			const deckRect = deckEl.getBoundingClientRect();
			const slotRect = slotEl.getBoundingClientRect();

			const fromX = deckRect.left + deckRect.width / 2;
			const fromY = deckRect.top + deckRect.height / 2;
			const toX = slotRect.left + slotRect.width / 2;
			const toY = slotRect.top + slotRect.height / 2;

			// Summon circle at deck
			setSummonCircle({ x: fromX, y: fromY, id: effectId });
			setTimeout(() => setSummonCircle(null), 1000);

			// Floating arcane runes
			const newRunes: ArcaneRuneData[] = Array.from({ length: 5 }).map((_, ri) => ({
				x: fromX - 35 + Math.random() * 70,
				y: fromY - 30 + Math.random() * 30,
				rune: ARCANE_RUNES[Math.floor(Math.random() * ARCANE_RUNES.length)],
				delay: ri * 0.12,
				id: effectId * 10 + ri,
			}));
			setArcaneRunes((prev) => [...prev, ...newRunes]);
			setTimeout(() => {
				setArcaneRunes((prev) => prev.filter((r) => !newRunes.find((nr) => nr.id === r.id)));
			}, 2000);

			// Flying card
			setFlyingCard({ fromX, fromY, toX, toY, id: effectId });

			// Landing burst after card arrives
			setTimeout(() => {
				const burstId = Date.now();
				setLandingBursts((prev) => [...prev, { x: toX, y: toY, id: burstId }]);
				setTimeout(() => {
					setLandingBursts((prev) => prev.filter((b) => b.id !== burstId));
				}, 1300);
			}, 820);
		}

		// Place card in slot after travel duration
		setTimeout(() => {
			setDrawnSlots((prev) => {
				const next = [...prev];
				next[nextSlotIndex] = {
					templateId: templateItem.cardTemplateId,
					name: templateItem.name,
					imageUrl: templateItem.imagePath ?? templateItem.designPath ?? null,
					isFlipped: false,
				};
				return next;
			});
			setDeckIndex((d) => d + 1);
			setIsAnimating(false);
			setFlyingCard(null);
		}, 850);
	}, [isAnimating, allDrawn, deckIndex, shuffledDeck, drawnSlots, sfx]);

	// ── COMMIT to BE ─────────────────────────────────────────────────────────────
	const handleCommit = useCallback(async () => {
		if (!allDrawn || isCommitting) return;
		setIsCommitting(true);
		setCommitError(null);
		try {
			const response = await apiRequest<{ drawnCards: ReadingCard[] }>(
				API_ENDPOINTS.tarotReadings.draw(sessionId),
				{ method: "POST", body: JSON.stringify({ allowReversed: true }) },
			);
			const beCards = response.data.drawnCards;
			sfx.playConfirm();
			setDrawnSlots((prev) =>
				prev.map((slot, i) => {
					if (!slot) return slot;
					const beCard = beCards[i];
					return beCard
						? {
								...slot,
								isReversed: beCard.isReversed,
								readingCardId: beCard.readingCardId,
								positionName: beCard.positionName,
								imageUrl: beCard.cardTemplate.imageUrl ?? slot.imageUrl,
								name: beCard.cardTemplate.name ?? slot.name,
							}
						: slot;
				}),
			);
			setReadingCards(beCards);
			setIsAllCommitted(true);
		} catch {
			setCommitError("Không thể xác nhận bài. Vui lòng thử lại.");
			setIsCommitting(false);
		}
	}, [allDrawn, isCommitting, sessionId, setReadingCards, sfx]);

	// ── FLIP card ───────────────────────────────────────────────────────────────
	const handleFlip = useCallback(
		(index: number) => {
			setDrawnSlots((prev) => {
				const next = [...prev];
				if (next[index]) {
					const card = next[index]!;
					next[index] = { ...card, isFlipped: true };
					if (card.isReversed) {
						sfx.playReversed();
					} else {
						sfx.playCardFlip();
					}
				}
				return next;
			});
		},
		[sfx],
	);

	const canProceed = isAllCommitted && allFlipped;

	// ── Grid layout based on card count ─────────────────────────────────────────
	const gridClass = useMemo(() => {
		if (cardsToDraw <= 1) return "flex justify-center";
		if (cardsToDraw <= 3) return "flex flex-wrap justify-center gap-4";
		if (cardsToDraw === 5) return "grid grid-cols-3 sm:grid-cols-5 gap-3";
		if (cardsToDraw === 7) return "grid grid-cols-3 sm:grid-cols-4 gap-3";
		// 10 cards: 5×2 grid
		return "grid grid-cols-3 sm:grid-cols-5 gap-3";
	}, [cardsToDraw]);

	// ── Loading ─────────────────────────────────────────────────────────────────
	if (isLoadingTemplates) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
			>
				<motion.div
					className="relative h-16 w-16"
					animate={{ rotate: 360 }}
					transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
				>
					<svg viewBox="0 0 64 64" className="h-full w-full">
						<circle cx="32" cy="32" r="28" fill="none" stroke="hsl(45 65% 55% / 0.3)" strokeWidth="1" strokeDasharray="14 8" />
						<circle cx="32" cy="32" r="20" fill="none" stroke="hsl(270 60% 70% / 0.5)" strokeWidth="1" strokeDasharray="8 12" />
					</svg>
					<Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
				</motion.div>
				<p className="text-muted-foreground text-sm">Đang triệu hồi bộ bài...</p>
			</motion.div>
		);
	}

	const remaining = shuffledDeck.length - deckIndex;
	const visibleStackCount = Math.min(remaining, 7);

	// ─────────────────────────────────────────────────────────────────────────────
	return (
		<>
			{/* ── Fixed/Portal Visual Effects ─────────────────────────────────────── */}

			{/* Flying card */}
			{flyingCard && (
				<motion.div
					key={`flying-${flyingCard.id}`}
					className="pointer-events-none fixed rounded-xl border overflow-hidden"
					style={{
						width: 96,
						height: 150,
						left: flyingCard.fromX - 48,
						top: flyingCard.fromY - 75,
						backgroundImage: `url('${CARD_BACK}')`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						zIndex: 9999,
						boxShadow: "0 0 24px hsl(45 80% 60% / 0.7), 0 0 48px hsl(270 65% 70% / 0.4), 0 8px 32px rgba(0,0,0,0.5)",
						borderColor: "hsl(45 80% 60% / 0.6)",
					}}
					animate={{
						x: flyingCard.toX - flyingCard.fromX,
						// Arc: go up proportionally then down to target
						y: [
							0,
							-Math.max(70, Math.abs(flyingCard.toX - flyingCard.fromX) * 0.3),
							flyingCard.toY - flyingCard.fromY,
						],
						rotate: [0, -20, 8, 1, 0],
						scale: [1, 1.08, 1.04, 1],
					}}
					transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
				/>
			)}

			{/* Summon circle at deck */}
			<AnimatePresence>
				{summonCircle && (
					<ArcaneSummonCircle key={`circle-${summonCircle.id}`} x={summonCircle.x} y={summonCircle.y} />
				)}
			</AnimatePresence>

			{/* Arcane rune particles */}
			<AnimatePresence>
				{arcaneRunes.map((r) => (
					<ArcaneRune key={r.id} {...r} />
				))}
			</AnimatePresence>

			{/* Landing bursts */}
			<AnimatePresence>
				{landingBursts.map((b) => (
					<LandingBurst key={b.id} x={b.x} y={b.y} />
				))}
			</AnimatePresence>

			{/* Zoom popup */}
			<AnimatePresence>
				{zoomedCard && (
					<CardZoomPopup card={zoomedCard} onClose={() => setZoomedCard(null)} />
				)}
			</AnimatePresence>

			{/* ── Main Draw Area ───────────────────────────────────────────────────── */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="space-y-8"
				data-testid="card-draw-area"
			>
				{/* Header */}
				<div className="text-center space-y-2">
					<h2 className="text-2xl font-bold text-foreground">
						{!allDrawn
							? "Rút Lá Bài Của Bạn"
							: !isAllCommitted
								? "Xác Nhận Bài Đã Chọn"
								: !allFlipped
									? "Lật Bài Để Khám Phá"
									: "Đã Sẵn Sàng"}
					</h2>
					<p className="text-sm text-muted-foreground">
						{!allDrawn
							? `Đã rút ${drawnCount}/${cardsToDraw} lá — nhấn vào xấp bài để rút`
							: !isAllCommitted
								? "Vũ Trụ sẽ xác định hướng của từng lá bài"
								: !allFlipped
									? "Nhấn vào từng lá bài để lật và khám phá thông điệp"
									: "Nhấn nút bên dưới để xem kết quả quẻ bói"}
					</p>
				</div>

				{/* Main Layout: Deck + Arrow + Slots */}
				<div className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-10">

					{/* ── Deck Stack ─────────────────────────────────────────────────── */}
					<div className="flex flex-col items-center gap-4 shrink-0">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
							Xấp Bài
						</p>

						<button
							ref={deckRef}
							type="button"
							onClick={handleDraw}
							disabled={allDrawn || isAnimating}
							className="group relative cursor-pointer disabled:cursor-not-allowed focus:outline-none"
							aria-label="Rút lá bài"
						>
							{/* Multi-ring arcane glow on hover */}
							<motion.div
								className="absolute -inset-5 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
								style={{ background: "radial-gradient(ellipse, hsl(270 65% 70% / 0.35), hsl(45 65% 55% / 0.2), transparent)" }}
							/>

							{/* Orbiting rune ring */}
							{!allDrawn && (
								<motion.div
									className="absolute inset-0 pointer-events-none"
									style={{ top: -55, left: -55, width: "calc(100% + 110px)", height: "calc(100% + 110px)" }}
									animate={{ rotate: 360 }}
									transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
								>
									{["ᚠ", "ᚱ", "ᚦ", "ᚨ", "ᚷ"].map((rune, ri) => (
										<span
											key={rune}
											className="absolute text-[10px] text-primary/30 font-bold"
											style={{
												left: "50%",
												top: "50%",
												transform: `rotate(${ri * 72}deg) translateY(-65%) translateX(-50%)`,
											}}
										>
											{rune}
										</span>
									))}
								</motion.div>
							)}

							{/* Card stack */}
							<div className="relative h-[190px] w-[125px]">
								{remaining === 0 ? (
									<div className="absolute inset-0 rounded-xl border-2 border-dashed border-muted/30 flex items-center justify-center">
										<span className="text-xs text-muted-foreground">Hết bài</span>
									</div>
								) : (
									Array.from({ length: visibleStackCount }).map((_, i) => {
										const isTop = i === visibleStackCount - 1;
										const offset = (visibleStackCount - 1 - i) * 2.5;
										return (
											<motion.div
												key={`stack-${i}`}
												className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
												style={{
													top: -offset,
													left: offset / 2,
													zIndex: i,
													backgroundImage: `url('${CARD_BACK}')`,
													backgroundSize: "cover",
													backgroundPosition: "center",
													border: isTop
														? "1px solid hsl(45 65% 55% / 0.4)"
														: "1px solid hsl(270 40% 50% / 0.2)",
												}}
												animate={
													isTop && !allDrawn
														? {
																y: [0, -7, 0],
																boxShadow: [
																	"0 4px 14px rgba(0,0,0,0.4), 0 0 10px hsl(45 65% 55% / 0.15)",
																	"0 8px 28px rgba(0,0,0,0.5), 0 0 30px hsl(45 65% 55% / 0.5), 0 0 50px hsl(270 60% 70% / 0.25)",
																	"0 4px 14px rgba(0,0,0,0.4), 0 0 10px hsl(45 65% 55% / 0.15)",
																],
															}
														: {}
												}
												transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
											>
												{isTop && !allDrawn && (
													<motion.div
														className="absolute inset-0"
														style={{ background: "radial-gradient(circle at 50% 30%, hsl(45 65% 55% / 0.18), transparent)" }}
														animate={{ opacity: [0, 0.7, 0] }}
														transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
													/>
												)}
											</motion.div>
										);
									})
								)}
							</div>

							{/* Count badge */}
							<div className="mt-3 text-center">
								<motion.span
									className="glass-card rounded-full px-4 py-1 text-sm font-bold text-primary border border-primary/30"
									animate={
										!allDrawn
											? {
													boxShadow: [
														"0 0 0px transparent",
														"0 0 14px hsl(45 65% 55% / 0.45)",
														"0 0 0px transparent",
													],
												}
											: {}
									}
									transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
								>
									{remaining} lá
								</motion.span>
							</div>
						</button>

						{!allDrawn && (
							<motion.p
								className="text-xs text-primary/60 text-center"
								animate={{ opacity: [0.4, 1, 0.4] }}
								transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
							>
								Nhấn vào xấp bài để rút
							</motion.p>
						)}
					</div>

					{/* ── Arrow ───────────────────────────────────────────────────────── */}
					<div className="hidden lg:flex items-center self-center">
						<motion.div
							animate={!allDrawn ? { x: [0, 10, 0], opacity: [0.3, 0.9, 0.3] } : { opacity: 0.15 }}
							transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
							className="text-primary text-3xl"
						>
							→
						</motion.div>
					</div>

					{/* ── Card Slots ──────────────────────────────────────────────────── */}
					<div className="flex-1 min-w-0">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-5">
							Bàn Trải Bài
						</p>
						<div className={gridClass}>
							{drawnSlots.map((slot, i) => (
								<div key={`slot-wrapper-${i}`}>
									<AnimatePresence mode="wait">
										{slot ? (
											<motion.div
												key={`card-filled-${i}`}
												initial={{ opacity: 0, scale: 0.6, y: -10 }}
												animate={{ opacity: 1, scale: 1, y: 0 }}
												transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.04 }}
											>
												<CardSlot
													slot={slot}
													index={i}
													onFlip={handleFlip}
													onZoom={(s) => {
														sfx.playCardZoom?.();
														setZoomedCard(s);
													}}
													isAllCommitted={isAllCommitted}
													slotRef={(el) => {
														slotRefs.current[i] = el;
													}}
												/>
											</motion.div>
										) : (
											<CardSlot
												key={`card-empty-${i}`}
												slot={null}
												index={i}
												onFlip={handleFlip}
												onZoom={setZoomedCard}
												isAllCommitted={isAllCommitted}
												slotRef={(el) => {
													slotRefs.current[i] = el;
												}}
											/>
										)}
									</AnimatePresence>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Error */}
				{commitError && (
					<p className="text-center text-sm font-medium text-destructive">{commitError}</p>
				)}

				{/* Action Buttons */}
				<div className="flex justify-center pt-2">
					<AnimatePresence mode="wait">
						{!isAllCommitted && allDrawn && (
							<motion.div
								key="commit-btn"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
							>
								<Button
									size="lg"
									onClick={handleCommit}
									disabled={isCommitting}
									className="gradient-gold-purple-bg rounded-full px-10 font-semibold text-primary-foreground glow-gold"
								>
									{isCommitting ? (
										<>
											<Loader2 className="mr-2 h-5 w-5 animate-spin" />
											Vũ Trụ Đang Xem Xét...
										</>
									) : (
										<>
											<Sparkles className="mr-2 h-5 w-5" />
											Xác Nhận {cardsToDraw} Lá Bài
										</>
									)}
								</Button>
							</motion.div>
						)}

						{canProceed && (
							<motion.div
								key="proceed-btn"
								initial={{ opacity: 0, scale: 0.85 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
							>
								<Button
									size="lg"
									onClick={onConfirm}
									className="gradient-gold-purple-bg rounded-full px-10 font-semibold text-primary-foreground glow-gold"
								>
									<CheckCircle className="mr-2 h-5 w-5" />
									Xem Kết Quả Quẻ Bói ✨
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Hint */}
				{isAllCommitted && drawnSlots.some((s) => s?.isFlipped) && (
					<p className="text-center text-xs text-muted-foreground/60">
						💡 Nhấn vào lá bài đã lật để xem ảnh chi tiết
					</p>
				)}
			</motion.div>
		</>
	);
}
