"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Music, Volume1, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { useAudioStore } from "@/features/audio/stores/audio-store";

/**
 * MusicToggleButton — Floating button bottom-right
 * User can toggle music. Shows current state.
 */
export function MusicToggleButton() {
	const { isMusicEnabled, volume, toggleMusic, setVolume, isSfxEnabled, toggleSfx } =
		useAudioStore();
	const [showPanel, setShowPanel] = useState(false);

	const VolumeIcon =
		volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

	return (
		<div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
			{/* Expanded panel */}
			<AnimatePresence>
				{showPanel && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="glass-card rounded-2xl border border-primary/20 p-4 w-52 shadow-2xl"
					>
						<p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">
							Âm Thanh
						</p>

						{/* Music toggle */}
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm text-foreground">Nhạc nền</span>
							<button
								type="button"
								onClick={toggleMusic}
								className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
									isMusicEnabled ? "bg-primary" : "bg-muted"
								}`}
							>
								<motion.div
									className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
									animate={{ left: isMusicEnabled ? "calc(100% - 1.375rem)" : "0.125rem" }}
									transition={{ type: "spring", stiffness: 400, damping: 25 }}
								/>
							</button>
						</div>

						{/* SFX toggle */}
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm text-foreground">Hiệu ứng SFX</span>
							<button
								type="button"
								onClick={toggleSfx}
								className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
									isSfxEnabled ? "bg-primary" : "bg-muted"
								}`}
							>
								<motion.div
									className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
									animate={{ left: isSfxEnabled ? "calc(100% - 1.375rem)" : "0.125rem" }}
									transition={{ type: "spring", stiffness: 400, damping: 25 }}
								/>
							</button>
						</div>

						{/* Volume slider */}
						{isMusicEnabled && (
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<VolumeIcon className="h-3.5 w-3.5 text-muted-foreground" />
									<input
										type="range"
										min={0}
										max={1}
										step={0.05}
										value={volume}
										onChange={(e) => setVolume(Number(e.target.value))}
										className="flex-1 accent-primary h-1"
									/>
								</div>
							</div>
						)}

						<p className="mt-3 text-[10px] text-muted-foreground/50 leading-tight">
							Nhạc theme do quản trị viên thiết lập
						</p>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main toggle button */}
			<motion.button
				type="button"
				onClick={() => setShowPanel((p) => !p)}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.95 }}
				className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
					isMusicEnabled
						? "gradient-gold-purple-bg glow-gold border border-primary/30"
						: "glass-card border border-border/50"
				}`}
				aria-label="Điều chỉnh âm thanh"
			>
				<AnimatePresence mode="wait">
					{isMusicEnabled ? (
						<motion.div
							key="on"
							initial={{ scale: 0, rotate: -90 }}
							animate={{ scale: 1, rotate: 0 }}
							exit={{ scale: 0, rotate: 90 }}
						>
							<Music className="h-5 w-5 text-primary-foreground" />
						</motion.div>
					) : (
						<motion.div
							key="off"
							initial={{ scale: 0, rotate: 90 }}
							animate={{ scale: 1, rotate: 0 }}
							exit={{ scale: 0, rotate: -90 }}
						>
							<VolumeX className="h-5 w-5 text-muted-foreground" />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.button>

			{/* Pulsing ring when music is playing */}
			{isMusicEnabled && (
				<motion.div
					className="absolute bottom-0 right-0 h-12 w-12 rounded-full border-2 border-primary/30 pointer-events-none"
					animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
					transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
				/>
			)}
		</div>
	);
}
