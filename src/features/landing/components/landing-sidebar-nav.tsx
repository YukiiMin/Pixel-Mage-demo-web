"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSectionObserver } from "@/features/landing/hooks/use-section-observer";

// ─── Section config with Tarot symbols ───────────────────────────────────────
const SECTIONS = [
	{
		id: "hero",
		label: "Khởi Đầu",
		symbol: "☽",
		runeLabel: "THE FOOL",
		color: "from-amber-400/20 to-amber-600/20",
		glow: "shadow-[0_0_20px_rgba(251,191,36,0.4)]",
		activeText: "text-amber-400",
	},
	{
		id: "features",
		label: "Tính Năng",
		symbol: "✦",
		runeLabel: "THE STAR",
		color: "from-purple-400/20 to-purple-600/20",
		glow: "shadow-[0_0_20px_rgba(147,51,234,0.4)]",
		activeText: "text-purple-400",
	},
	{
		id: "how-it-works",
		label: "Cách Dùng",
		symbol: "⊕",
		runeLabel: "THE WHEEL",
		color: "from-blue-400/20 to-indigo-600/20",
		glow: "shadow-[0_0_20px_rgba(96,165,250,0.4)]",
		activeText: "text-blue-400",
	},
	{
		id: "download",
		label: "Tải App",
		symbol: "★",
		runeLabel: "THE WORLD",
		color: "from-emerald-400/20 to-teal-600/20",
		glow: "shadow-[0_0_20px_rgba(52,211,153,0.4)]",
		activeText: "text-emerald-400",
	},
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// ─── Smooth scroll utility ────────────────────────────────────────────────────
function scrollToSection(id: string) {
	const el = document.getElementById(id);
	if (!el) return;
	el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingSidebarNav() {
	const pathname = usePathname();
	const [isHovered, setIsHovered] = useState(false);
	const [mounted, setMounted] = useState(false);
	const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const activeSection = useSectionObserver(
		SECTIONS.map((s) => s.id),
		0.25,
	) as SectionId;

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleMouseEnter = useCallback(() => {
		if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
		setIsHovered(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		hoverTimeout.current = setTimeout(() => setIsHovered(false), 300);
	}, []);

	// Only show on landing page
	if (!mounted || pathname !== "/") return null;

	const activeIdx = SECTIONS.findIndex((s) => s.id === activeSection);

	return (
		<motion.div
			className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: 1.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
		>
			<div
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className="relative"
			>
				{/* ── Compact state ── */}
				<AnimatePresence>
					{!isHovered && (
						<motion.div
							key="compact"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.2 }}
							className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl"
							style={{
								background: "rgba(15, 10, 30, 0.75)",
								backdropFilter: "blur(16px)",
								border: "1px solid rgba(251, 191, 36, 0.12)",
							}}
						>
							{/* Progress track */}
							<div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-white/5 rounded-full" />
							{/* Progress fill */}
							<motion.div
								className="absolute left-1/2 -translate-x-1/2 top-4 w-0.5 rounded-full bg-gradient-to-b from-amber-400/60 to-purple-500/60"
								animate={{
									height:
										activeIdx >= 0
											? `${((activeIdx + 0.5) / SECTIONS.length) * (100 - 20)}%`
											: "0%",
								}}
								transition={{ duration: 0.4, ease: "easeOut" }}
								style={{ top: "1rem" }}
							/>

							{SECTIONS.map((section, i) => {
								const isActive = activeSection === section.id;
								return (
									<button
										key={section.id}
										type="button"
										aria-label={`Scroll to ${section.label}`}
										onClick={() => scrollToSection(section.id)}
										className="relative z-10 group flex flex-col items-center"
									>
										<motion.div
											animate={
												isActive
													? { scale: 1.3 }
													: { scale: 1 }
											}
											transition={{ type: "spring", stiffness: 300, damping: 20 }}
											className={`
												w-8 h-8 rounded-full flex items-center justify-center text-sm
												transition-all duration-300 my-0.5
												${isActive
													? `bg-gradient-to-br ${section.color} ${section.glow} ${section.activeText} border border-current/40`
													: "text-white/25 hover:text-white/60 hover:scale-110"}
											`}
										>
											{section.symbol}
										</motion.div>
									</button>
								);
							})}
						</motion.div>
					)}
				</AnimatePresence>

				{/* ── Expanded state ── */}
				<AnimatePresence>
					{isHovered && (
						<motion.div
							key="expanded"
							initial={{ opacity: 0, scale: 0.9, x: 10 }}
							animate={{ opacity: 1, scale: 1, x: 0 }}
							exit={{ opacity: 0, scale: 0.9, x: 10 }}
							transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
							className="flex flex-col gap-1 py-3 px-3 rounded-2xl min-w-[160px]"
							style={{
								background: "rgba(15, 10, 30, 0.92)",
								backdropFilter: "blur(20px)",
								border: "1px solid rgba(251, 191, 36, 0.18)",
								boxShadow:
									"0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
							}}
						>
							{/* Header */}
							<div className="text-center mb-2 pb-2 border-b border-white/5">
								<p className="text-[9px] text-amber-400/60 tracking-[0.2em] uppercase font-medium">
									✦ Navigator ✦
								</p>
							</div>

							{SECTIONS.map((section) => {
								const isActive = activeSection === section.id;
								return (
									<button
										key={section.id}
										type="button"
										onClick={() => scrollToSection(section.id)}
										className={`
											group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
											transition-all duration-200 relative overflow-hidden
											${isActive
												? `bg-gradient-to-r ${section.color} border border-current/20`
												: "hover:bg-white/5 border border-transparent"}
										`}
									>
										{/* Active glow */}
										{isActive && (
											<motion.div
												layoutId="sidebar-active-glow"
												className="absolute inset-0 rounded-xl"
												style={{
													background: `linear-gradient(135deg, transparent, rgba(251,191,36,0.08))`,
												}}
											/>
										)}

										{/* Symbol */}
										<motion.span
											animate={isActive ? { scale: 1.2 } : { scale: 1 }}
											transition={{ type: "spring", stiffness: 300 }}
											className={`
												text-base flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
												${isActive
													? `${section.activeText} bg-current/10`
													: "text-white/30 group-hover:text-white/60"}
												transition-colors duration-200
											`}
										>
											{section.symbol}
										</motion.span>

										<div className="min-w-0 flex-1">
											<p
												className={`text-xs font-semibold leading-tight transition-colors ${
													isActive ? section.activeText : "text-white/60 group-hover:text-white/90"
												}`}
											>
												{section.label}
											</p>
											<p className="text-[9px] text-white/25 tracking-wider font-medium">
												{section.runeLabel}
											</p>
										</div>

										{/* Active pulse dot */}
										{isActive && (
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-glow flex-shrink-0"
											/>
										)}
									</button>
								);
							})}

							{/* Footer */}
							<div className="mt-1 pt-2 border-t border-white/5 text-center">
								<p className="text-[8px] text-white/15 tracking-wider">
									PIXELMAGE · TAROT
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
