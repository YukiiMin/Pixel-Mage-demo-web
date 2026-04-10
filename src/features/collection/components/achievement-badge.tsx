import { Check } from "lucide-react";
import Image from "next/image";
import type { Achievement } from "@/features/collection/types";

interface AchievementBadgeProps {
	achievement: Achievement;
	earned: boolean;
	earnedAt?: string;
}

export function AchievementBadge({
	achievement,
	earned,
	earnedAt,
}: AchievementBadgeProps) {
	return (
		<div
			data-testid={`achievement-${achievement.id}`}
			data-earned={earned}
			className={`group relative flex h-full flex-col items-center justify-start overflow-hidden rounded-xl border p-6 text-center transition-all duration-300 ${
				earned
					? "border-amber-500/30 bg-black/40 hover:border-amber-500/60 hover:bg-black/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
					: "border-white/5 bg-black/20 opacity-40 grayscale"
			}`}
			style={{
				backdropFilter: "blur(16px)",
				WebkitBackdropFilter: "blur(16px)",
			}}
		>
			<div className="relative mb-4 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/5">
				{achievement.iconUrl ? (
					<Image
						src={achievement.iconUrl}
						alt={achievement.name}
						width={48}
						height={48}
						className="object-contain"
					/>
				) : (
					<div className="h-12 w-12 rounded-full bg-white/10" />
				)}

				{earned && (
					<div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black">
						<Check className="h-4 w-4" strokeWidth={3} />
					</div>
				)}
			</div>

			<h3
				className={`mb-2 font-medium ${
					earned ? "text-amber-100" : "text-white/70"
				}`}
			>
				{achievement.name}
			</h3>
			<p className="mb-4 text-xs text-white/50">{achievement.description}</p>

			<div className="mt-auto flex w-full flex-col items-center gap-1">
				<div className="font-stats text-sm font-bold text-amber-500">
					+{achievement.pointReward} pts
				</div>
				{earned && earnedAt && (
					<div className="text-[10px] text-white/40">
						{new Date(earnedAt).toLocaleDateString("vi-VN")}
					</div>
				)}
			</div>
		</div>
	);
}
