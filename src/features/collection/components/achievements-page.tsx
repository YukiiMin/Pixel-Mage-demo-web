"use client";

import { useEffect, useState } from "react";
import { getStoredUserId } from "@/lib/api-config";
import { useAchievements, useMyAchievements } from "../hooks/use-achievements";
import { AchievementBadge } from "./achievement-badge";

export function AchievementsPageClient() {
	const [userId, setUserId] = useState<number | null>(null);

	useEffect(() => {
		setUserId(getStoredUserId());
	}, []);

	const achievementsQuery = useAchievements();
	const myAchievementsQuery = useMyAchievements(userId);

	const isLoading =
		achievementsQuery.isLoading || (!!userId && myAchievementsQuery.isLoading);

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-7xl px-4 py-12 md:px-6">
				<div className="mb-12">
					<div className="h-10 w-48 animate-pulse rounded bg-white/10" />
					<div className="mt-4 h-6 w-96 animate-pulse rounded bg-white/5" />
				</div>
				<div className="mb-8 h-8 w-32 animate-pulse rounded bg-white/10" />
				<div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="h-56 w-full animate-pulse rounded-xl bg-white/5"
						/>
					))}
				</div>
				<div className="mb-8 h-8 w-32 animate-pulse rounded bg-white/10" />
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="h-56 w-full animate-pulse rounded-xl bg-white/5"
						/>
					))}
				</div>
			</div>
		);
	}

	const allAchievements = achievementsQuery.data || [];
	const myAchievements = myAchievementsQuery.data || [];

	const earnedMap = new Map(
		myAchievements.map((ea) => [ea.achievement.id, ea.earnedAt]),
	);

	const earnedList = allAchievements.filter((a) => earnedMap.has(a.id));
	const unearnedList = allAchievements.filter((a) => !earnedMap.has(a.id));

	return (
		<div className="container mx-auto max-w-7xl px-4 py-12 md:px-6">
			<div className="mb-12">
				<h1
					className="text-4xl text-white md:text-5xl"
					style={{ fontFamily: "var(--font-heading)" }}
				>
					✦ Thành Tựu
				</h1>
				<p className="mt-4 text-white/70">
					Những cột mốc trong hành trình của bạn.
				</p>
			</div>

			<div className="mb-16">
				<h2 className="mb-6 text-xl text-white">
					Đã đạt được ({earnedList.length})
				</h2>
				{earnedList.length === 0 ? (
					<div className="flex h-32 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-sm text-white/40">
						Chưa có thành tựu nào.
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{earnedList.map((achievement, i) => (
							<div
								key={achievement.id}
								className="animate-fog-in opacity-0"
								style={{
									animationDelay: `${Math.min(i, 5) * 0.08}s`,
									animationFillMode: "forwards",
								}}
							>
								<AchievementBadge
									achievement={achievement}
									earned={true}
									earnedAt={earnedMap.get(achievement.id)}
								/>
							</div>
						))}
					</div>
				)}
			</div>

			<div>
				<h2 className="mb-6 text-xl text-white">
					Chưa đạt ({unearnedList.length})
				</h2>
				{unearnedList.length === 0 ? (
					<div className="text-sm text-white/40">Đã đạt tất cả thành tựu!</div>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{unearnedList.map((achievement) => (
							<AchievementBadge
								key={achievement.id}
								achievement={achievement}
								earned={false}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
