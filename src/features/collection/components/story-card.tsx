import { Lock } from "lucide-react";
import Image from "next/image";
import type { Story } from "@/types/collection";

interface StoryCardProps {
	story: Story;
	onClick: () => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
	return (
		<div
			className={`relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 transition-all duration-300 md:p-6 ${
				story.isLocked
					? "cursor-not-allowed opacity-50"
					: "cursor-pointer hover:border-white/30 hover:bg-black/60"
			}`}
			data-testid={`story-card-${story.id}`}
			data-locked={story.isLocked}
			onClick={story.isLocked ? undefined : onClick}
			style={{
				backdropFilter: "blur(16px)",
				WebkitBackdropFilter: "blur(16px)",
			}}
		>
			<div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-lg bg-white/5">
				{story.coverImageUrl ? (
					<Image
						src={story.coverImageUrl}
						alt={story.title}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className="object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-white/5 text-white/20">
						No Image
					</div>
				)}

				{story.isLocked && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/60">
						<Lock className="h-8 w-8 text-white/50" />
					</div>
				)}
			</div>

			<h3
				className="mb-2 text-xl tracking-wide text-white"
				style={{ fontFamily: "var(--font-heading)" }}
			>
				{story.title}
			</h3>
			<p className="line-clamp-2 text-sm text-white/60">{story.summary}</p>
		</div>
	);
}
