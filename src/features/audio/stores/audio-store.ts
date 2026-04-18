/**
 * Audio Store — Zustand + localStorage persist
 * Admin có thể set theme music URL
 * User có thể toggle on/off
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AudioState {
	/** URL nhạc theme (admin set) */
	themeMusicUrl: string;
	/** User preference: bật/tắt nhạc */
	isMusicEnabled: boolean;
	/** Volume (0-1) */
	volume: number;
	/** SFX on/off */
	isSfxEnabled: boolean;
	/** Admin-only: thay đổi URL nhạc */
	setThemeMusicUrl: (url: string) => void;
	/** User: toggle nhạc */
	toggleMusic: () => void;
	setMusicEnabled: (v: boolean) => void;
	setVolume: (v: number) => void;
	toggleSfx: () => void;
}

export const useAudioStore = create<AudioState>()(
	persist(
		(set) => ({
			// Default: nhạc ambient huyền bí miễn phí từ freemusicarchive / Pixabay
			themeMusicUrl:
				"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
			isMusicEnabled: false, // mặc định tắt (UX best practice)
			volume: 0.4,
			isSfxEnabled: true,

			setThemeMusicUrl: (url) => set({ themeMusicUrl: url }),
			toggleMusic: () => set((s) => ({ isMusicEnabled: !s.isMusicEnabled })),
			setMusicEnabled: (v) => set({ isMusicEnabled: v }),
			setVolume: (v) => set({ volume: v }),
			toggleSfx: () => set((s) => ({ isSfxEnabled: !s.isSfxEnabled })),
		}),
		{
			name: "pm-audio-settings",
		},
	),
);
