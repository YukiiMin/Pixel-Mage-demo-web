"use client";

import { motion } from "framer-motion";
import { Music, Play, Pause, Trash2, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { useAudioStore } from "@/features/audio/stores/audio-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ThemeMusicItem {
	musicId: number;
	title: string;
	artist?: string;
	url: string;
	active: boolean;
	createdAt: string;
}

/**
 * AdminMusicSettings — Full Admin Panel cho theme music
 * - Upload file mp3 lên Cloudinary qua BE
 * - Danh sách tất cả bài
 * - Kích hoạt 1 bài làm theme active
 * - Xoá bài (xoá cả Cloudinary)
 */
export function AdminMusicSettings() {
	const queryClient = useQueryClient();
	const { setThemeMusicUrl, setMusicEnabled } = useAudioStore();
	const fileRef = useRef<HTMLInputElement>(null);
	const [title, setTitle] = useState("");
	const [artist, setArtist] = useState("");
	const [previewId, setPreviewId] = useState<number | null>(null);
	const previewAudioRef = useRef<HTMLAudioElement | null>(null);

	// ─── Queries ──────────────────────────────────────────────────────────────
	const { data: tracks = [], isLoading } = useQuery<ThemeMusicItem[]>({
		queryKey: ["theme-music"],
		queryFn: async () => {
			const res = await apiRequest<ThemeMusicItem[]>(API_ENDPOINTS.themeMusic.list);
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	// ─── Mutations ────────────────────────────────────────────────────────────
	const uploadMutation = useMutation({
		mutationFn: async () => {
			const file = fileRef.current?.files?.[0];
			if (!file) throw new Error("Chọn file nhạc trước");
			if (!title.trim()) throw new Error("Nhập tên bài hát");

			const form = new FormData();
			form.append("file", file);
			form.append("title", title.trim());
			if (artist.trim()) form.append("artist", artist.trim());

			const res = await fetch(API_ENDPOINTS.themeMusic.upload, {
				method: "POST",
				body: form,
			});
			if (!res.ok) throw new Error(await res.text());
			return res.json() as Promise<ThemeMusicItem>;
		},
		onSuccess: () => {
			toast.success("Upload thành công! 🎵");
			setTitle("");
			setArtist("");
			if (fileRef.current) fileRef.current.value = "";
			queryClient.invalidateQueries({ queryKey: ["theme-music"] });
		},
		onError: (e: Error) => toast.error(e.message),
	});

	const activateMutation = useMutation({
		mutationFn: async (musicId: number) => {
			const res = await apiRequest<ThemeMusicItem>(API_ENDPOINTS.themeMusic.activate(musicId), {
				method: "PUT",
			});
			return res.data;
		},
		onSuccess: (data) => {
			toast.success(`Đã đặt "${data.title}" làm nhạc theme! 🎶`);
			// Sync vào store để ThemeMusicPlayer pick up ngay
			setThemeMusicUrl(data.url);
			setMusicEnabled(true);
			queryClient.invalidateQueries({ queryKey: ["theme-music"] });
			queryClient.invalidateQueries({ queryKey: ["theme-music-active"] });
		},
		onError: () => toast.error("Không thể kích hoạt bài này"),
	});

	const deleteMutation = useMutation({
		mutationFn: async (musicId: number) => {
			await apiRequest(API_ENDPOINTS.themeMusic.delete(musicId), { method: "DELETE" });
		},
		onSuccess: () => {
			toast.success("Đã xoá bài nhạc");
			queryClient.invalidateQueries({ queryKey: ["theme-music"] });
			queryClient.invalidateQueries({ queryKey: ["theme-music-active"] });
		},
		onError: () => toast.error("Không thể xoá bài này"),
	});

	// ─── Preview ──────────────────────────────────────────────────────────────
	const togglePreview = (track: ThemeMusicItem) => {
		if (previewId === track.musicId) {
			previewAudioRef.current?.pause();
			setPreviewId(null);
			return;
		}
		previewAudioRef.current?.pause();
		const audio = new Audio(track.url);
		audio.volume = 0.5;
		audio.play().catch(() => toast.error("Không thể phát preview"));
		audio.onended = () => setPreviewId(null);
		previewAudioRef.current = audio;
		setPreviewId(track.musicId);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="glass-card rounded-2xl border border-primary/20 p-6 space-y-6"
		>
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="rounded-xl bg-primary/10 p-2.5">
					<Music className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h3 className="font-bold text-foreground">Nhạc Theme Hệ Thống</h3>
					<p className="text-xs text-muted-foreground">
						Upload & quản lý nhạc nền — Admin toàn quyền
					</p>
				</div>
			</div>

			{/* Upload form */}
			<div className="rounded-xl border border-dashed border-primary/30 p-4 space-y-3 bg-primary/5">
				<p className="text-xs font-bold uppercase tracking-widest text-primary/60">
					Upload Bài Nhạc Mới
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Input
						placeholder="Tên bài hát *"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="bg-card/60"
					/>
					<Input
						placeholder="Nghệ sĩ (tuỳ chọn)"
						value={artist}
						onChange={(e) => setArtist(e.target.value)}
						className="bg-card/60"
					/>
				</div>
				<div className="flex items-center gap-3">
					<input
						ref={fileRef}
						type="file"
						accept="audio/*,.mp3,.ogg,.wav,.flac"
						className="flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
					/>
					<Button
						onClick={() => uploadMutation.mutate()}
						disabled={uploadMutation.isPending}
						className="shrink-0 gradient-gold-purple-bg rounded-full text-primary-foreground glow-gold"
					>
						{uploadMutation.isPending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Upload className="mr-2 h-4 w-4" />
						)}
						Upload
					</Button>
				</div>
			</div>

			{/* Track list */}
			<div className="space-y-2">
				<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
					Thư Viện Nhạc ({tracks.length} bài)
				</p>

				{isLoading ? (
					<div className="flex justify-center py-6">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : tracks.length === 0 ? (
					<p className="text-center py-6 text-sm text-muted-foreground">
						Chưa có bài nhạc nào. Hãy upload bài đầu tiên! 🎵
					</p>
				) : (
					<div className="space-y-2 max-h-72 overflow-y-auto pr-1">
						{tracks.map((track) => (
							<motion.div
								key={track.musicId}
								layout
								className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
									track.active
										? "bg-primary/15 border border-primary/30"
										: "bg-card/40 border border-border/30 hover:bg-card/70"
								}`}
							>
								{/* Active badge */}
								{track.active && (
									<CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
								)}

								{/* Info */}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-foreground truncate">
										{track.title}
										{track.active && (
											<span className="ml-2 text-[10px] text-primary font-bold animate-pulse">
												▶ ĐANG PHÁT
											</span>
										)}
									</p>
									{track.artist && (
										<p className="text-xs text-muted-foreground truncate">{track.artist}</p>
									)}
								</div>

								{/* Actions */}
								<div className="flex items-center gap-1.5 shrink-0">
									{/* Preview */}
									<button
										type="button"
										onClick={() => togglePreview(track)}
										className="rounded-lg p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
										title="Nghe thử"
									>
										{previewId === track.musicId ? (
											<Pause className="h-3.5 w-3.5" />
										) : (
											<Play className="h-3.5 w-3.5" />
										)}
									</button>

									{/* Activate */}
									{!track.active && (
										<button
											type="button"
											onClick={() => activateMutation.mutate(track.musicId)}
											disabled={activateMutation.isPending}
											className="rounded-lg px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors border border-primary/30 disabled:opacity-50"
											title="Chọn làm nhạc theme"
										>
											Đặt làm theme
										</button>
									)}

									{/* Delete */}
									<button
										type="button"
										onClick={() => {
											if (confirm(`Xoá bài "${track.title}"?`)) {
												deleteMutation.mutate(track.musicId);
											}
										}}
										disabled={deleteMutation.isPending}
										className="rounded-lg p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
										title="Xoá bài này"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</button>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
}
