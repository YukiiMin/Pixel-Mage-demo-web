"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { useAudioStore } from "@/features/audio/stores/audio-store";

interface ActiveTrackResponse {
	musicId: number;
	title: string;
	url: string;
	active: boolean;
}

/**
 * ThemeMusicPlayer
 * 1. On mount: fetch /api/theme-music/active → sync URL to store
 * 2. Plays/pauses based on user toggle (isMusicEnabled)
 * 3. Invisible component
 */
export function ThemeMusicPlayer() {
	const { themeMusicUrl, isMusicEnabled, volume, setThemeMusicUrl } = useAudioStore();
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Fetch active track from BE
	const { data: activeTrack } = useQuery<ActiveTrackResponse | null>({
		queryKey: ["theme-music-active"],
		queryFn: async () => {
			try {
				const res = await apiRequest<ActiveTrackResponse>(API_ENDPOINTS.themeMusic.active);
				return res.data ?? null;
			} catch {
				return null;
			}
		},
		staleTime: 5 * 60 * 1000, // refetch every 5 min
		refetchOnWindowFocus: true,
	});

	// When BE returns active track, sync URL to store
	useEffect(() => {
		if (activeTrack?.url && activeTrack.url !== themeMusicUrl) {
			setThemeMusicUrl(activeTrack.url);
		}
	}, [activeTrack?.url, themeMusicUrl, setThemeMusicUrl]);

	// Create audio element once
	useEffect(() => {
		const audio = new Audio();
		audio.loop = true;
		audio.preload = "none";
		audio.volume = volume;
		audioRef.current = audio;

		return () => {
			audio.pause();
			audio.src = "";
		};
	}, []);

	// Update src when URL changes
	useEffect(() => {
		if (!audioRef.current || !themeMusicUrl) return;
		const wasPlaying = !audioRef.current.paused;
		audioRef.current.src = themeMusicUrl;
		if (wasPlaying) {
			audioRef.current.play().catch(() => {});
		}
	}, [themeMusicUrl]);

	// Update volume
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
		}
	}, [volume]);

	// Play / pause
	useEffect(() => {
		if (!audioRef.current) return;
		if (isMusicEnabled && themeMusicUrl) {
			if (!audioRef.current.src) {
				audioRef.current.src = themeMusicUrl;
			}
			audioRef.current.play().catch(() => {
				// Autoplay policy — requires user interaction first
			});
		} else {
			audioRef.current.pause();
		}
	}, [isMusicEnabled, themeMusicUrl]);

	return null;
}
