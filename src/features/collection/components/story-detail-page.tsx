"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredUserId } from "@/lib/api-config";
import { ApiHttpError } from "@/types/api";
import { useStoryDetail } from "../hooks/use-story-detail";
import { LockedStory } from "./locked-story";

interface StoryDetailPageClientProps {
	storyId: number;
}

export function StoryDetailPageClient({ storyId }: StoryDetailPageClientProps) {
	const [userId, setUserId] = useState<number | null>(null);

	useEffect(() => {
		setUserId(getStoredUserId());
	}, []);

	const { data: story, isLoading, error } = useStoryDetail(storyId, userId);

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
				<div className="mb-8 h-6 w-24 animate-pulse rounded bg-white/10" />
				<div className="mb-8 aspect-[16/9] w-full animate-pulse rounded-2xl bg-white/5" />
				<div className="mb-6 h-12 w-3/4 animate-pulse rounded bg-white/10" />
				<div className="h-4 w-full animate-pulse rounded bg-white/5" />
				<div className="mt-4 h-4 w-5/6 animate-pulse rounded bg-white/5" />
				<div className="mt-4 h-4 w-full animate-pulse rounded bg-white/5" />
			</div>
		);
	}

	if (error instanceof ApiHttpError && error.status === 403) {
		return <LockedStory />;
	}

	if (error || !story) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
				<div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
					{error instanceof Error ? error.message : "Đã có lỗi xảy ra"}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
			<Link
				href="/stories"
				className="mb-8 inline-flex items-center text-sm text-white/60 transition-colors hover:text-white"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Quay lại
			</Link>

			<div className="mb-12 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
				{story.coverImageUrl && (
					<div className="relative aspect-[16/9] w-full bg-white/5">
						<Image
							src={story.coverImageUrl}
							alt={story.title}
							fill
							sizes="(max-width: 1200px) 100vw, 1200px"
							className="object-cover"
							priority
						/>
					</div>
				)}

				<div className="p-8 md:p-12">
					<h1
						className="mb-8 text-4xl leading-tight text-white md:text-5xl"
						style={{ fontFamily: "var(--font-heading)" }}
					>
						✦ {story.title}
					</h1>

					<div className="prose prose-invert max-w-none">
						<div className="whitespace-pre-wrap text-lg leading-relaxed text-white/80">
							{story.content}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
