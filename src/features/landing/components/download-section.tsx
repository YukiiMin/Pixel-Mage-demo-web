"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
	Check,
	ChevronRight,
	Smartphone,
	Layers,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import { ScrollSectionWrapper } from "./scroll-section-wrapper";

// ─── Types ───────────────────────────────────────────────────────────────────
type DemoScreen =
	| "tarot-home"
	| "tarot-reading"
	| "tarot-result"
	| "collection-home"
	| "collection-grid";
type DemoFlow = "tarot" | "collection";

// ─── Mock data for phone demo ────────────────────────────────────────────────
const MOCK_CARDS = [
	{
		name: "The Fool",
		emoji: "🌟",
		rarity: "LEGENDARY",
		color: "from-amber-400 to-orange-600",
	},
	{
		name: "The Moon",
		emoji: "🌙",
		rarity: "RARE",
		color: "from-blue-400 to-purple-600",
	},
	{
		name: "The Sun",
		emoji: "☀️",
		rarity: "EPIC",
		color: "from-yellow-300 to-amber-500",
	},
	{
		name: "The Tower",
		emoji: "⚡",
		rarity: "RARE",
		color: "from-slate-400 to-gray-600",
	},
	{
		name: "The Star",
		emoji: "✨",
		rarity: "COMMON",
		color: "from-sky-400 to-blue-600",
	},
	{
		name: "The World",
		emoji: "🌍",
		rarity: "LEGENDARY",
		color: "from-emerald-400 to-teal-600",
	},
];

const RARITY_COLORS: Record<string, string> = {
	LEGENDARY: "text-amber-400",
	EPIC: "text-purple-400",
	RARE: "text-blue-400",
	COMMON: "text-slate-400",
};

// ─── Screen Components ───────────────────────────────────────────────────────

function TarotHomeScreen({ onStart }: { onStart: () => void }) {
	return (
		<div className="flex flex-col h-full">
			{/* Status bar */}
			<div className="h-9 bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center">
				<span className="text-[10px] font-bold text-amber-400 tracking-widest">
					✦ PIXELMAGE ✦
				</span>
			</div>
			<div className="flex-1 bg-gradient-to-b from-[#0f0a1e] to-[#1a0e3a] p-4 flex flex-col gap-3 overflow-hidden">
				{/* Hero card */}
				<div className="relative rounded-2xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-amber-400/20 p-4 text-center">
					<div className="text-3xl mb-2">🔮</div>
					<p className="text-amber-400 text-xs font-semibold tracking-wider">
						TAROT AI
					</p>
					<p className="text-white/70 text-[10px] mt-1">
						Khám phá vận mệnh của bạn
					</p>
				</div>
				{/* Quick spreads */}
				<p className="text-white/50 text-[10px] uppercase tracking-wider font-medium">
					Kiểu trải bài
				</p>
				{["Celtic Cross", "3 Lá Bài", "Tình Duyên"].map((s, i) => (
					<button
						key={s}
						type="button"
						onClick={i === 1 ? onStart : undefined}
						className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/10 transition-colors"
					>
						<div className="flex items-center gap-2">
							<span className="text-sm">{["🌐", "🃏", "💕"][i]}</span>
							<span className="text-xs text-white/80">{s}</span>
						</div>
						<ChevronRight className="w-3 h-3 text-amber-400" />
					</button>
				))}
				<button
					type="button"
					onClick={onStart}
					className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0f0a1e] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
				>
					<Sparkles className="w-4 h-4" /> Bắt Đầu Đọc Bài
				</button>
			</div>
		</div>
	);
}

function TarotReadingScreen({ onReveal }: { onReveal: () => void }) {
	const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
	const [allFlipped, setAllFlipped] = useState(false);

	const flipCard = (i: number) => {
		setFlipped((prev) => {
			const next = [...prev];
			next[i] = true;
			if (next.every(Boolean)) {
				setTimeout(() => setAllFlipped(true), 400);
			}
			return next;
		});
	};

	return (
		<div className="flex flex-col h-full">
			<div className="h-9 bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center">
				<span className="text-[10px] font-bold text-amber-400 tracking-widest">
					✦ PIXELMAGE ✦
				</span>
			</div>
			<div className="flex-1 bg-gradient-to-b from-[#0f0a1e] to-[#1a0e3a] p-4 flex flex-col">
				<p className="text-center text-white/60 text-[10px] mb-1">
					Trải Bài 3 Lá
				</p>
				<p className="text-center text-amber-400/80 text-[9px] mb-4">
					Chạm để lật bài
				</p>
				<div className="flex justify-center gap-3 mb-4">
					{["Quá Khứ", "Hiện Tại", "Tương Lai"].map((label, i) => (
						<button
							key={label}
							type="button"
							onClick={() => flipCard(i)}
							className="flex flex-col items-center gap-1.5"
						>
							<div
								className={`w-[60px] h-[90px] rounded-xl border-2 transition-all duration-500 flex items-center justify-center text-xl
									${
										flipped[i]
											? "border-amber-400/60 bg-gradient-to-br from-purple-900/80 to-indigo-900/80 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
											: "border-white/20 bg-gradient-to-br from-indigo-900 to-purple-900 cursor-pointer hover:border-amber-400/40"
									}`}
							>
								{flipped[i] ? MOCK_CARDS[i].emoji : "✦"}
							</div>
							<span className="text-[9px] text-white/50">{label}</span>
							{flipped[i] && (
								<span className="text-[9px] text-amber-400 font-medium">
									{MOCK_CARDS[i].name}
								</span>
							)}
						</button>
					))}
				</div>
				{allFlipped && (
					<button
						type="button"
						onClick={onReveal}
						className="mt-auto w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0f0a1e] font-bold text-xs flex items-center justify-center gap-2 animate-pulse-glow"
					>
						🔮 Xem Giải Nghĩa AI
					</button>
				)}
				{!allFlipped && (
					<p className="text-center text-white/30 text-[9px] mt-auto">
						Lật tất cả các lá để tiếp tục
					</p>
				)}
			</div>
		</div>
	);
}

function TarotResultScreen({ onReset }: { onReset: () => void }) {
	return (
		<div className="flex flex-col h-full">
			<div className="h-9 bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center">
				<span className="text-[10px] font-bold text-amber-400 tracking-widest">
					✦ KẾT QUẢ ✦
				</span>
			</div>
			<div className="flex-1 bg-gradient-to-b from-[#0f0a1e] to-[#1a0e3a] p-4 flex flex-col gap-3 overflow-auto">
				<div className="text-center py-2">
					<div className="text-2xl mb-1">✨</div>
					<p className="text-amber-400 text-xs font-semibold">
						Giải Nghĩa Của Bạn
					</p>
				</div>
				{MOCK_CARDS.slice(0, 3).map((card, i) => (
					<div
						key={card.name}
						className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1"
					>
						<div className="flex items-center gap-2">
							<span>{card.emoji}</span>
							<span className="text-white text-[11px] font-semibold">
								{card.name}
							</span>
							<span
								className={`text-[9px] ml-auto ${RARITY_COLORS[card.rarity]}`}
							>
								{["Quá Khứ", "Hiện Tại", "Tương Lai"][i]}
							</span>
						</div>
						<p className="text-white/50 text-[10px] leading-relaxed">
							{
								[
									"Một chương mới đang mở ra, hãy tin vào hành trình.",
									"Thay đổi đang đến — đón nhận với tâm thế bình an.",
									"Ánh sáng phía trước dẫn lối cho bước chân bạn.",
								][i]
							}
						</p>
					</div>
				))}
				<button
					type="button"
					onClick={onReset}
					className="mt-auto w-full py-2.5 rounded-xl bg-white/10 text-white/70 text-xs font-medium border border-white/10 hover:bg-white/15 transition-colors"
				>
					← Đọc Bài Lại
				</button>
			</div>
		</div>
	);
}

function CollectionHomeScreen({ onBrowse }: { onBrowse: () => void }) {
	return (
		<div className="flex flex-col h-full">
			<div className="h-9 bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center">
				<span className="text-[10px] font-bold text-amber-400 tracking-widest">
					✦ BỘ SƯU TẬP ✦
				</span>
			</div>
			<div className="flex-1 bg-gradient-to-b from-[#0f0a1e] to-[#1a0e3a] p-4 flex flex-col gap-3">
				{/* Stats */}
				<div className="grid grid-cols-3 gap-2">
					{[
						["78", "Lá Bài"],
						["12", "Sở Hữu"],
						["4.9★", "Rating"],
					].map(([val, label]) => (
						<div
							key={label}
							className="rounded-xl bg-white/5 border border-amber-400/10 p-2 text-center"
						>
							<p className="text-amber-400 font-bold text-sm">{val}</p>
							<p className="text-white/40 text-[9px]">{label}</p>
						</div>
					))}
				</div>
				<p className="text-white/50 text-[10px] uppercase tracking-wider font-medium">
					Bộ Sưu Tập
				</p>
				<div className="flex gap-2 overflow-x-auto pb-1">
					{["Major Arcana", "Minor Arcana", "Special"].map((set) => (
						<button
							key={set}
							type="button"
							onClick={onBrowse}
							className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-white/10 px-3 py-2 text-center min-w-[80px]"
						>
							<p className="text-base mb-1">🃏</p>
							<p className="text-white/70 text-[9px]">{set}</p>
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={onBrowse}
					className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0f0a1e] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
				>
					<Layers className="w-4 h-4" /> Xem Tất Cả Thẻ
				</button>
			</div>
		</div>
	);
}

function CollectionGridScreen({ onReset }: { onReset: () => void }) {
	return (
		<div className="flex flex-col h-full">
			<div className="h-9 bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center gap-2">
				<button
					type="button"
					onClick={onReset}
					className="absolute left-3 text-amber-400/60 text-[10px]"
				>
					←
				</button>
				<span className="text-[10px] font-bold text-amber-400 tracking-widest">
					✦ MAJOR ARCANA ✦
				</span>
			</div>
			<div className="flex-1 bg-gradient-to-b from-[#0f0a1e] to-[#1a0e3a] p-3 overflow-auto">
				<div className="grid grid-cols-3 gap-2">
					{MOCK_CARDS.map((card) => (
						<div
							key={card.name}
							className="rounded-xl overflow-hidden border border-white/10 flex flex-col"
						>
							<div
								className={`h-[70px] bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl`}
							>
								{card.emoji}
							</div>
							<div className="bg-[#0f0a1e]/80 px-1 py-1 text-center">
								<p className="text-white/80 text-[9px] font-medium truncate">
									{card.name}
								</p>
								<p className={`text-[8px] ${RARITY_COLORS[card.rarity]}`}>
									{card.rarity}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// ─── Phone Frame ─────────────────────────────────────────────────────────────

interface PhoneDemoProps {
	flow: DemoFlow;
}

function PhoneFrame({ flow }: PhoneDemoProps) {
	const [screen, setScreen] = useState<DemoScreen>(
		flow === "tarot" ? "tarot-home" : "collection-home",
	);

	// Auto-advance from result/collection screens after a delay
	useEffect(() => {
		setScreen(flow === "tarot" ? "tarot-home" : "collection-home");
	}, [flow]);

	const renderScreen = () => {
		if (flow === "tarot") {
			if (screen === "tarot-home")
				return <TarotHomeScreen onStart={() => setScreen("tarot-reading")} />;
			if (screen === "tarot-reading")
				return (
					<TarotReadingScreen onReveal={() => setScreen("tarot-result")} />
				);
			if (screen === "tarot-result")
				return <TarotResultScreen onReset={() => setScreen("tarot-home")} />;
		}
		if (flow === "collection") {
			if (screen === "collection-home")
				return (
					<CollectionHomeScreen onBrowse={() => setScreen("collection-grid")} />
				);
			if (screen === "collection-grid")
				return (
					<CollectionGridScreen onReset={() => setScreen("collection-home")} />
				);
		}
		return null;
	};

	return (
		<div className="relative mx-auto w-[220px] sm:w-[240px]">
			{/* Glow behind phone */}
			<div className="absolute inset-0 -z-10 rounded-[50px] bg-amber-500/10 blur-[60px] scale-110" />

			{/* Phone chassis */}
			<div className="relative bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-[40px] p-[5px] shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]">
				{/* Dynamic island */}
				<div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1a1a] rounded-full z-10 flex items-center justify-center gap-1.5">
					<div className="w-1.5 h-1.5 rounded-full bg-[#2d2d2d]" />
					<div className="w-2 h-2 rounded-full bg-[#2d2d2d]" />
				</div>

				{/* Screen area */}
				<div className="relative bg-[#0a0612] rounded-[36px] overflow-hidden h-[480px] shadow-inner">
					<AnimatePresence mode="wait">
						<motion.div
							key={screen}
							className="absolute inset-0"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.25, ease: "easeInOut" }}
						>
							{renderScreen()}
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Side buttons */}
				<div className="absolute -right-[3px] top-[80px] w-1 h-10 bg-[#2a2a2a] rounded-r-full" />
				<div className="absolute -left-[3px] top-[70px] w-1 h-8 bg-[#2a2a2a] rounded-l-full" />
				<div className="absolute -left-[3px] top-[90px] w-1 h-8 bg-[#2a2a2a] rounded-l-full" />
				<div className="absolute -left-[3px] top-[120px] w-1 h-12 bg-[#2a2a2a] rounded-l-full" />
			</div>

			{/* Home indicator */}
			<div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-white/20" />
		</div>
	);
}

// ─── Main Export ─────────────────────────────────────────────────────────────

const benefits = [
	"Quét NFC liên kết thẻ bài vật lý",
	"Đọc bài Tarot AI mọi lúc, mọi nơi",
	"Sưu tập & quản lý bộ bài riêng",
];

export default function DownloadSection() {
	const [activeFlow, setActiveFlow] = useState<DemoFlow>("tarot");

	return (
		<section
			id="download"
			className="py-28 gradient-bg-section relative overflow-hidden"
		>
			{/* Ambient glows */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-1/4 left-0 w-72 h-72 rounded-full bg-amber-500/5 blur-[120px]" />
				<div className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full bg-purple-600/5 blur-[120px]" />
			</div>

			<div className="container mx-auto px-6 relative z-10">
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					{/* LEFT — Copy */}
					<ScrollSectionWrapper direction="left">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 badge-mystic">
								📲 Tải PixelMage App
							</div>

							<h2 className="text-3xl md:text-4xl font-bold leading-tight">
								Quét NFC · Đọc Tarot
								<br />
								<span className="text-mystic-gradient">Mọi Lúc Mọi Nơi</span>
							</h2>

							<ul className="space-y-3">
								{benefits.map((b, i) => (
									<li
										key={i}
										className="flex items-center gap-3 text-muted-foreground"
									>
										<Check className="w-5 h-5 text-primary flex-shrink-0" />
										{b}
									</li>
								))}
							</ul>

							<div className="flex flex-wrap gap-3 pt-2">
								<a
									href="/"
									className="btn-shimmer gradient-gold-purple-bg text-primary-foreground font-semibold rounded-full px-6 py-3 glow-gold transition-transform hover:scale-105 flex items-center gap-2"
								>
									<Smartphone className="w-4 h-4" /> Tải Android APK
								</a>
								<span className="glass-card rounded-full px-6 py-3 text-muted-foreground opacity-60 cursor-not-allowed">
									🍎 iOS — Sắp ra mắt
								</span>
							</div>

							<div className="flex gap-6 pt-4 text-sm text-muted-foreground">
								<span>
									<strong className="text-primary">4.8★</strong> Rating
								</span>
								<span>
									<strong className="text-primary">10K+</strong> Downloads
								</span>
								<span>
									<strong className="text-primary">100%</strong> Free
								</span>
							</div>
						</div>
					</ScrollSectionWrapper>

					{/* RIGHT — Interactive Phone Demo */}
					<ScrollSectionWrapper direction="right">
						<div className="flex flex-col items-center gap-6">
							{/* Flow toggle */}
							<div className="flex gap-2 glass-card rounded-full p-1">
								{(["tarot", "collection"] as const).map((flow) => (
									<button
										key={flow}
										type="button"
										onClick={() => setActiveFlow(flow)}
										className={`btn-shimmer rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
											activeFlow === flow
												? "gradient-gold-purple-bg text-primary-foreground shadow-md"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{flow === "tarot" ? "🔮 Đọc Tarot" : "🃏 Bộ Sưu Tập"}
									</button>
								))}
							</div>

							<PhoneFrame flow={activeFlow} />

							<p className="text-xs text-muted-foreground/60 text-center max-w-[200px]">
								Demo thực tế — tương tác ngay trên trình duyệt
							</p>
						</div>
					</ScrollSectionWrapper>
				</div>
			</div>
		</section>
	);
}
