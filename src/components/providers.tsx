"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CursorEffect } from "@/components/effects/cursor-effect";
import { ThemeMusicPlayer } from "@/features/audio/components/theme-music-player";
import { MusicToggleButton } from "@/features/audio/components/music-toggle-button";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						retry: 1,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
				<TooltipProvider>
					<Toaster />
					<Sonner />
					{/* Global visual & audio effects */}
					<CursorEffect />
					<ThemeMusicPlayer />
					<MusicToggleButton />
					{children}
				</TooltipProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
