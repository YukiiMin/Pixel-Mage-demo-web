"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, Sparkles, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { useTarotSessionStore } from "@/features/tarot/stores/use-tarot-session-store";
import type { ReadingCard } from "@/features/tarot/types";
import { useCardTemplates } from "@/features/tarot/hooks/use-card-templates";
import type { CardTemplateItem } from "@/features/tarot/hooks/use-card-templates";
import { useSfx } from "@/features/audio/hooks/use-sfx";

interface CardDrawAreaProps {
	sessionId: number;
	/** Số lá cần rút — lấy từ spread.positionCount */
	cardsToDraw: number;
	onConfirm: () => void;
}

// ─── Sub-types ───────────────────────────────────────────────────────────────
interface DrawnSlot {
	templateId: number;
	name: string;
	imageUrl: string | null;
	isFlipped: boolean;
	/** Filled from BE after commit */
	isReversed?: boolean;
	readingCardId?: number;
	positionName?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CARD_BACK = "/images/deck/card-back.jpg";

// Fisher-Yates shuffle (secure enough for UX fiction)
function shuffleArray<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// ─── Zoom Popup ──────────────────────────────────────────────────────────────
function CardZoomPopup({
	card,
	onClose,
}: {
	card: DrawnSlot;
	onClose: () => void;
}) {
	const imageUrl = card.imageUrl ?? CARD_BACK;
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.5, rotateY: -30 }}
				animate={{ scale: 1, rotateY: 0 }}
				exit={{ scale: 0.5, opacity: 0 }}
				transition={{ type: "spring", stiffness: 280, damping: 22 }}
				className="relative max-h-[85vh] max-w-[320px] cursor-default"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="glass-card absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white hover:text-destructive"
				>
					<X className="h-4 w-4" />
				</button>
				<div
					className="relative overflow-hidden rounded-2xl shadow-2xl border border-primary/30"
					style={{ transform: card.isReversed ? "rotate(180deg)" : undefined }}
				>
					<img
						src={imageUrl}
						alt={card.name}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="mt-4 text-center">
					<p className="font-bold text-primary text-lg glow-gold">{card.name}</p>
					{card.isReversed && (
						<span className="mt-1 inline-block rounded bg-destructive/20 px-3 py-0.5 text-xs font-bold text-destructive">
							NGƯỢC
						</span>
					)}
					{card.positionName && (
						<p className="mt-1 text-sm text-muted-foreground">
							Vị trí: {card.positionName}
						</p>
					)}
				</div>
			</motion.div>
		</motion.div>
	);
}

// ─── Deck Stack ───────────────────────────────────────────────────────────────
function DeckStack({
	remaining,
	onDraw,
	isAnimating,
	disabled,
}: {
	remaining: number;
	onDraw: () => void;
	isAnimating: boolean;
	disabled: boolean;
}) {
	const visibleCards = Math.min(remaining, 6);
	return (
		<div className="flex flex-col items-center gap-4">
			<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
				Xấp Bài
			</p>
			<button
				type="button"
				onClick={onDraw}
				disabled={disabled || isAnimating}
				className="group relative cursor-pointer"
				aria-label="Rút lá bài"
			>
				{/* Glow ring on hover */}
				<div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10 blur-lg" />
				{/* Stack of cards */}
				<div className="relative h-[200px] w-[130px]">
					{Array.from({ length: visibleCards }).map((_, i) => {
						const isTop = i === visibleCards - 1;
						const offset = (visibleCards - 1 - i) * 2;
						return (
							<motion.div
								key={`stack-${i}`}
								className="absolute inset-0 rounded-xl border border-primary/20 overflow-hidden shadow-lg"
								style={{
									top: -offset,
									left: offset / 2,
									zIndex: i,
									backgroundImage: `url('${CARD_BACK}')`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
								animate={isTop && !disabled ? {
									y: [0, -4, 0],
								} : {}}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							>
								{isTop && (
									<motion.div
										className="absolute inset-0 bg-primary/10"
										animate={{ opacity: [0, 0.3, 0] }}
										transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
									/>
								)}
							</motion.div>
						);
					})}
				</div>
				{/* Count badge */}
				<div className="mt-3 text-center">
					<span className="glass-card rounded-full px-3 py-1 text-sm font-bold text-primary border border-primary/30">
						{remaining} lá
					</span>
				</div>
			</button>
			{!disabled && (
				<motion.p
					className="text-xs text-primary/60 text-center"
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
				>
					Nhấn vào xấp bài để rút
				</motion.p>
			)}
		</div>
	);
}

// ─── Card Slot ────────────────────────────────────────────────────────────────
function CardSlot({
	slot,
	index,
	onFlip,
	onZoom,
	isAllCommitted,
}: {
	slot: DrawnSlot | null;
	index: number;
	onFlip: (index: number) => void;
	onZoom: (slot: DrawnSlot) => void;
	isAllCommitted: boolean;
}) {
	if (!slot) {
		// Empty placeholder slot
		return (
			<div className="flex flex-col items-center gap-2">
				<div className="h-[160px] w-[100px] rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-center">
					<span className="text-2xl opacity-30">✨</span>
				</div>
				<span className="text-xs text-muted-foreground">Lá {index + 1}</span>
			</div>
		);
	}

	const imageUrl = slot.imageUrl ?? CARD_BACK;

	return (
		<div className="flex flex-col items-center gap-2">
			<div
				className="relative h-[160px] w-[100px] cursor-pointer"
				style={{ perspective: "1000px" }}
				onClick={() => {
					if (!slot.isFlipped && isAllCommitted) {
						onFlip(index);
					} else if (slot.isFlipped) {
						onZoom(slot);
					}
				}}
			>
				{/* Card 3D flip container */}
				<motion.div
					className="relative h-full w-full"
					style={{ transformStyle: "preserve-3d" }}
					animate={{ rotateY: slot.isFlipped ? 180 : 0 }}
					transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
				>
					{/* Back face */}
					<div
						className="absolute inset-0 rounded-xl overflow-hidden border border-primary/30 shadow-lg"
						style={{
							backfaceVisibility: "hidden",
							backgroundImage: `url('${CARD_BACK}')`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					>
						{!slot.isFlipped && isAllCommitted && (
							<motion.div
								className="absolute inset-0 flex items-center justify-center bg-primary/20"
								animate={{ opacity: [0, 0.5, 0] }}
								transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
							>
								<span className="text-xl">✨</span>
							</motion.div>
						)}
					</div>

					{/* Front face */}
					<div
						className="absolute inset-0 rounded-xl overflow-hidden border border-primary/50 shadow-xl"
						style={{
							backfaceVisibility: "hidden",
							transform: "rotateY(180deg)",
						}}
					>
						<img
							src={imageUrl}
							alt={slot.name}
							className="h-full w-full object-cover"
							style={{
								transform: slot.isReversed ? "rotate(180deg)" : undefined,
								filter: slot.isReversed
									? "sepia(0.2) saturate(1.3)"
									: undefined,
							}}
						/>
						{/* Glow burst on reveal */}
						<motion.div
							className="absolute inset-0 bg-primary/30"
							initial={{ opacity: 0.6 }}
							animate={{ opacity: 0 }}
							transition={{ duration: 0.8 }}
						/>
					</div>
				</motion.div>
			</div>

			{/* Label below card */}
			<div className="text-center space-y-0.5 max-w-[110px]">
				{slot.isFlipped ? (
					<>
						<p className="text-xs font-bold text-primary truncate">{slot.name}</p>
						{slot.isReversed && (
							<span className="text-[9px] rounded bg-destructive/20 px-1.5 py-0.5 text-destructive font-bold">
								NGƯỢC
							</span>
						)}
						{slot.positionName && (
							<p className="text-[10px] text-muted-foreground">{slot.positionName}</p>
						)}
					</>
				) : (
					<>
						<span className="text-xs text-muted-foreground">Lá {index + 1}</span>
						{isAllCommitted && (
							<p className="text-[10px] text-primary/60 animate-pulse">Nhấn để lật</p>
						)}
					</>
				)}
			</div>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CardDrawArea({ sessionId, cardsToDraw, onConfirm }: CardDrawAreaProps) {
	const setReadingCards = useTarotSessionStore((s) => s.setReadingCards);
	const sfx = useSfx();

	// Load 78 card templates
	const { data: templates, isLoading: isLoadingTemplates } = useCardTemplates(1);

	// Shuffled deck (stable per session)
	const shuffledDeck = useMemo<CardTemplateItem[]>(() => {
		if (!templates || templates.length === 0) return [];
		return shuffleArray(templates);
	}, [templates]);

	// State
	const [drawnSlots, setDrawnSlots] = useState<(DrawnSlot | null)[]>(
		Array(cardsToDraw).fill(null),
	);
	const [deckIndex, setDeckIndex] = useState(0); // pointer into shuffledDeck
	const [isAnimating, setIsAnimating] = useState(false);
	const [isCommitting, setIsCommitting] = useState(false);
	const [commitError, setCommitError] = useState<string | null>(null);
	const [isAllCommitted, setIsAllCommitted] = useState(false);
	const [zoomedCard, setZoomedCard] = useState<DrawnSlot | null>(null);

	const drawnCount = drawnSlots.filter(Boolean).length;
	const allDrawn = drawnCount === cardsToDraw;
	const allFlipped = drawnSlots.every((s) => s?.isFlipped);

	// ── Draw action ─────────────────────────────────────────────────────────────
	const handleDraw = useCallback(() => {
		if (isAnimating || allDrawn || deckIndex >= shuffledDeck.length) return;

		const nextSlotIndex = drawnSlots.findIndex((s) => s === null);
		if (nextSlotIndex === -1) return;

		const templateItem = shuffledDeck[deckIndex];
		setIsAnimating(true);

		// SFX: card draw whoosh
		sfx.playCardDraw();

		// After animation completes, place card in slot
		setTimeout(() => {
			setDrawnSlots((prev) => {
				const next = [...prev];
				next[nextSlotIndex] = {
					templateId: templateItem.cardTemplateId,
					name: templateItem.name,
					imageUrl:
						templateItem.imagePath ??
						templateItem.designPath ??
						null,
					isFlipped: false,
				};
				return next;
			});
			setDeckIndex((d) => d + 1);
			setIsAnimating(false);
		}, 750);
	}, [isAnimating, allDrawn, deckIndex, shuffledDeck, drawnSlots]);

	// ── Commit to BE ─────────────────────────────────────────────────────────────
	const handleCommit = useCallback(async () => {
		if (!allDrawn || isCommitting) return;
		setIsCommitting(true);
		setCommitError(null);
		try {
			const response = await apiRequest<{ drawnCards: ReadingCard[] }>(
				API_ENDPOINTS.tarotReadings.draw(sessionId),
				{
					method: "POST",
					body: JSON.stringify({ allowReversed: true }),
				},
			);
			const beCards = response.data.drawnCards;

			// SFX: mystical chord on confirm
			sfx.playConfirm();

			// Merge BE result (isReversed, readingCardId, positionName) into slots
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
								// Override image with BE-confirmed imageUrl if available
								imageUrl: beCard.cardTemplate.imageUrl ?? slot.imageUrl,
								name: beCard.cardTemplate.name ?? slot.name,
							}
						: slot;
				}),
			);

			// Store in global state for downstream components
			setReadingCards(beCards);
			setIsAllCommitted(true);
		} catch {
			setCommitError("Không thể xác nhận bài. Vui lòng thử lại.");
			setIsCommitting(false);
		}
	}, [allDrawn, isCommitting, sessionId, setReadingCards]);

	// ── Flip card ─────────────────────────────────────────────────────────────
	const handleFlip = useCallback((index: number) => {
		setDrawnSlots((prev) => {
			const next = [...prev];
			if (next[index]) {
				const card = next[index]!;
				next[index] = { ...card, isFlipped: true };
				// SFX depends on reversed status
				if (card.isReversed) {
					sfx.playReversed();
				} else {
					sfx.playCardFlip();
				}
			}
			return next;
		});
	}, [sfx]);

	// When all flipped, ready to proceed
	const canProceed = isAllCommitted && allFlipped;

	// ── Loading state ───────────────────────────────────────────────────────────
	if (isLoadingTemplates) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
			>
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
				<p className="text-muted-foreground">Đang triệu hồi bộ bài...</p>
			</motion.div>
		);
	}

	return (
		<>
			<AnimatePresence>
				{zoomedCard && (
					<CardZoomPopup card={zoomedCard} onClose={() => setZoomedCard(null)} />
				)}
			</AnimatePresence>

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

				{/* Main Layout: Deck + Slots */}
				<div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-12">
					{/* Deck Stack */}
					<DeckStack
						remaining={shuffledDeck.length - deckIndex}
						onDraw={handleDraw}
						isAnimating={isAnimating}
						disabled={allDrawn}
					/>

					{/* Progress indicator (arrow) */}
					<div className="hidden md:flex items-center self-center">
						<motion.div
							animate={{ x: [0, 8, 0] }}
							transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
							className="text-primary/50 text-2xl"
						>
							→
						</motion.div>
					</div>

					{/* Card Slots */}
					<div className="flex-1">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-4">
							Bàn Trải Bài
						</p>
						<div
							className={`flex flex-wrap justify-center gap-4 ${
								cardsToDraw <= 3 ? "md:flex-nowrap" : ""
							}`}
						>
							{drawnSlots.map((slot, i) => (
								<div key={`slot-${i}`}>
									<AnimatePresence>
										{slot ? (
											<motion.div
												key={`card-in-slot-${i}`}
												initial={{ opacity: 0, scale: 0.7, y: -30 }}
												animate={{ opacity: 1, scale: 1, y: 0 }}
												transition={{
													type: "spring",
													stiffness: 260,
													damping: 20,
												}}
											>
												<CardSlot
													slot={slot}
													index={i}
													onFlip={handleFlip}
													onZoom={(s) => { sfx.playCardZoom(); setZoomedCard(s); }}
													isAllCommitted={isAllCommitted}
												/>
											</motion.div>
										) : (
											<CardSlot
												slot={null}
												index={i}
												onFlip={handleFlip}
												onZoom={setZoomedCard}
												isAllCommitted={isAllCommitted}
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
					<p className="text-center text-sm font-medium text-destructive">
						{commitError}
					</p>
				)}

				{/* Action Buttons */}
				<div className="flex justify-center pt-2">
					{!isAllCommitted && allDrawn && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
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
							initial={{ opacity: 0, scale: 0.9 }}
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
				</div>

				{/* Hint: click flipped card to zoom */}
				{isAllCommitted && drawnSlots.some((s) => s?.isFlipped) && (
					<p className="text-center text-xs text-muted-foreground/60">
						💡 Nhấn vào lá bài đã lật để xem ảnh chi tiết
					</p>
				)}
			</motion.div>
		</>
	);
}
