"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUserId } from "@/lib/api-config";
import { useStories } from "../hooks/use-stories";
import { StoryCard } from "./story-card";

export function StoriesPageClient() {
	const [userId, setUserId] = useState<number | null>(null);
	const router = useRouter();

	useEffect(() => {
		setUserId(getStoredUserId());
	}, []);

	const { data: stories, isLoading } = useStories(userId);

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-7xl px-4 py-12 md:px-6">
				<div className="mb-12">
					<div className="h-10 w-48 animate-pulse rounded-md bg-white/10" />
					<div className="mt-4 h-6 w-96 animate-pulse rounded-md bg-white/5" />
				</div>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="h-80 w-full animate-pulse rounded-xl bg-white/5"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-12 md:px-6">
			<div className="mb-12">
				<h1
					className="text-4xl text-white md:text-5xl"
					style={{ fontFamily: "var(--font-heading)" }}
				>
					✦ Câu Chuyện
				</h1>
				<p className="mt-4 text-white/70">
					Khám phá câu chuyện ẩn sau mỗi bộ thẻ.
				</p>
			</div>

			{!stories || stories.length === 0 ? (
				<div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/50">
					Chưa có câu chuyện nào.
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{stories.map((story, i) => (
						<div
							key={story.id}
							className="animate-fog-in opacity-0"
							style={{
								animationDelay: `${Math.min(i, 5) * 0.08}s`,
								animationFillMode: "forwards",
							}}
						>
							<StoryCard
								story={story}
								onClick={() => router.push(`/stories/${story.id}`)}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
