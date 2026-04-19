"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, Image as ImageIcon, Link as LinkIcon, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { CardContentsViewerProps } from "@/features/staff/types/admin-cards";
import type { CardContentResponse } from "@/features/staff/types/catalog";

export function CardContentsViewer({ templateId }: CardContentsViewerProps) {
	const { data: contents, isLoading } = useQuery({
		queryKey: ["admin", "card-contents-viewer", templateId],
		queryFn: () =>
			apiRequest<CardContentResponse[]>(
				API_ENDPOINTS.cardContents.adminByTemplate(templateId),
			).then((r) => r.data || []),
	});

	const [selected, setSelected] = useState<CardContentResponse | null>(null);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="font-semibold text-sm">Danh sách Content</h4>
				<p className="text-xs text-muted-foreground">View mode (read-only)</p>
			</div>

			{isLoading ? (
				<p className="text-muted-foreground text-sm">Đang tải...</p>
			) : contents?.length === 0 ? (
				<p className="text-muted-foreground text-sm italic">
					Chưa có nội dung đính kèm nào.
				</p>
			) : (
				<div className="space-y-2">
					{contents?.map((content) => (
						<button
							type="button"
							key={content.contentId}
							onClick={() => setSelected(content)}
							className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:bg-secondary/10 transition-colors"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className="w-10 h-10 rounded bg-secondary/50 flex items-center justify-center shrink-0">
									{content.contentType === "STORY" ? (
										<FileText className="h-5 w-5 text-muted-foreground" />
									) : content.contentType === "VIDEO" ? (
										<Video className="h-5 w-5 text-blue-400" />
									) : content.contentType === "IMAGE" ||
										content.contentType === "GIF" ? (
										<ImageIcon className="h-5 w-5 text-green-400" />
									) : (
										<LinkIcon className="h-5 w-5 text-purple-400" />
									)}
								</div>
								<div className="min-w-0">
									<p className="text-sm font-semibold truncate">
										{content.title || `No Title - ${content.contentType}`}
									</p>
									<p className="text-xs text-muted-foreground truncate max-w-[420px]">
										{content.contentData}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<span
									className={`text-[10px] px-2 py-1 rounded-full font-bold ${content.isActive ? "bg-green-500/20 text-green-500" : "bg-destructive/20 text-destructive"}`}
								>
									{content.isActive ? "ACTIVE" : "INACTIVE"}
								</span>
								<Eye className="h-4 w-4 text-muted-foreground" />
							</div>
						</button>
					))}
				</div>
			)}

			<Dialog
				open={!!selected}
				onOpenChange={(open) => !open && setSelected(null)}
			>
				{selected && (
					<DialogContent className="max-w-2xl border-border/50 glass-card bg-background/95 backdrop-blur-xl">
						<DialogHeader>
							<DialogTitle className="text-base">
								{selected.title ||
									`Chi tiết nội dung (${selected.contentType})`}
							</DialogTitle>
							<DialogDescription className="text-xs">
								Chỉ xem — không chỉnh sửa trong View mode.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<span
									className={`text-[10px] px-2 py-1 rounded-full font-bold ${selected.isActive ? "bg-green-500/20 text-green-500" : "bg-destructive/20 text-destructive"}`}
								>
									{selected.isActive ? "ACTIVE" : "INACTIVE"}
								</span>
								<span className="text-xs text-muted-foreground">
									Type: {selected.contentType}
								</span>
							</div>

							{selected.contentType === "STORY" ? (
								<ScrollArea className="h-72 rounded-lg border border-border/50 bg-card/40 p-4">
									<p className="text-sm leading-relaxed whitespace-pre-wrap">
										{selected.contentData}
									</p>
								</ScrollArea>
							) : selected.contentType === "IMAGE" ||
								selected.contentType === "GIF" ? (
								<div className="rounded-lg border border-border/50 bg-card/40 p-3">
									<div className="relative w-full h-[420px]">
										<Image
											src={selected.contentData}
											alt={selected.title || "content"}
											fill
											className="object-contain rounded-md"
											unoptimized
										/>
									</div>
								</div>
							) : selected.contentType === "VIDEO" ? (
								<div className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-2">
									<a
										href={selected.contentData}
										target="_blank"
										rel="noreferrer"
										className="text-xs text-primary underline"
									>
										Mở video ở tab mới
									</a>
								</div>
							) : (
								<div className="rounded-lg border border-border/50 bg-card/40 p-3">
									<a
										href={selected.contentData}
										target="_blank"
										rel="noreferrer"
										className="text-sm text-primary underline break-all"
									>
										{selected.contentData}
									</a>
								</div>
							)}
						</div>
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}
