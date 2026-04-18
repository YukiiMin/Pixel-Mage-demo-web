/**
 * useSfx — Web Audio API sound effects (no external files needed)
 * Generates mystical sounds procedurally
 */
"use client";

import { useCallback, useRef } from "react";
import { useAudioStore } from "@/features/audio/stores/audio-store";

function createAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	try {
		return new (window.AudioContext || (window as any).webkitAudioContext)();
	} catch {
		return null;
	}
}

/** Play a short synthesized tone */
function playTone(
	ctx: AudioContext,
	frequency: number,
	duration: number,
	type: OscillatorType = "sine",
	volume = 0.3,
	attackTime = 0.01,
	releaseTime = 0.1,
) {
	const osc = ctx.createOscillator();
	const gainNode = ctx.createGain();

	osc.connect(gainNode);
	gainNode.connect(ctx.destination);

	osc.type = type;
	osc.frequency.setValueAtTime(frequency, ctx.currentTime);

	// Envelope
	gainNode.gain.setValueAtTime(0, ctx.currentTime);
	gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + attackTime);
	gainNode.gain.exponentialRampToValueAtTime(
		0.001,
		ctx.currentTime + duration - releaseTime,
	);

	osc.start(ctx.currentTime);
	osc.stop(ctx.currentTime + duration);
}

/** Play chord (multiple tones) */
function playChord(
	ctx: AudioContext,
	frequencies: number[],
	duration: number,
	volume = 0.2,
) {
	for (const freq of frequencies) {
		playTone(ctx, freq, duration, "sine", volume / frequencies.length, 0.02, 0.15);
	}
}

export function useSfx() {
	const isSfxEnabled = useAudioStore((s) => s.isSfxEnabled);
	const ctxRef = useRef<AudioContext | null>(null);

	const getCtx = useCallback((): AudioContext | null => {
		if (!isSfxEnabled) return null;
		if (!ctxRef.current || ctxRef.current.state === "closed") {
			ctxRef.current = createAudioContext();
		}
		if (ctxRef.current?.state === "suspended") {
			ctxRef.current.resume();
		}
		return ctxRef.current;
	}, [isSfxEnabled]);

	/** Khi rút lá bài từ xấp — "whoosh" mystical */
	const playCardDraw = useCallback(() => {
		const ctx = getCtx();
		if (!ctx) return;
		// Sweep up
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = "sine";
		osc.frequency.setValueAtTime(200, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
		gain.gain.setValueAtTime(0.15, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.4);

		// Add shimmer
		setTimeout(() => {
			playTone(ctx, 880, 0.2, "sine", 0.08, 0.01, 0.15);
		}, 200);
	}, [getCtx]);

	/** Khi confirm bài (gọi BE) — chords huyền bí */
	const playConfirm = useCallback(() => {
		const ctx = getCtx();
		if (!ctx) return;
		// Mystical ascending chord
		playChord(ctx, [261.6, 329.6, 392, 523.2], 1.2, 0.4);
	}, [getCtx]);

	/** Khi lật bài — flip reveal */
	const playCardFlip = useCallback(() => {
		const ctx = getCtx();
		if (!ctx) return;
		// Quick shimmer + note
		playTone(ctx, 523.2, 0.15, "triangle", 0.1, 0.005, 0.1);
		setTimeout(() => {
			playTone(ctx, 783.99, 0.3, "sine", 0.12, 0.01, 0.2);
		}, 100);
	}, [getCtx]);

	/** Khi bài ngược (reversed) — dark tone */
	const playReversed = useCallback(() => {
		const ctx = getCtx();
		if (!ctx) return;
		playTone(ctx, 130.8, 0.5, "sine", 0.15, 0.02, 0.3);
		playTone(ctx, 155.6, 0.5, "sine", 0.1, 0.02, 0.3);
	}, [getCtx]);

	/** Khi zoom card — soft ping */
	const playCardZoom = useCallback(() => {
		const ctx = getCtx();
		if (!ctx) return;
		playTone(ctx, 1046.5, 0.4, "sine", 0.08, 0.005, 0.35);
	}, [getCtx]);

	/** Xào bài xong → DRAWING phase — whoosh */
	const playPhaseTransition = useCallback(() => {
		const ctx = getCtx();
		if (!ctx) return;
		playChord(ctx, [196, 261.6, 392], 0.8, 0.3);
	}, [getCtx]);

	/** Hoàn thành bói toán — fanfare */
	const playComplete = useCallback(() => {
		const ctx = getCtx();
		if (!ctx) return;
		// C major arpeggio
		const notes = [261.6, 329.6, 392, 523.2, 659.3];
		notes.forEach((freq, i) => {
			setTimeout(() => {
				playTone(ctx, freq, 0.4, "sine", 0.15, 0.01, 0.3);
			}, i * 120);
		});
	}, [getCtx]);

	/** Click UI bình thường */
	const playClick = useCallback(() => {
		const ctx = getCtx();
		if (!ctx) return;
		playTone(ctx, 440, 0.08, "square", 0.05, 0.002, 0.06);
	}, [getCtx]);

	return {
		playCardDraw,
		playConfirm,
		playCardFlip,
		playReversed,
		playCardZoom,
		playPhaseTransition,
		playComplete,
		playClick,
	};
}
