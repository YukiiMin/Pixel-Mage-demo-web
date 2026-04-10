export interface Story {
	id: number;
	title: string;
	summary: string;
	coverImageUrl: string | null;
	isLocked: boolean;
}

export interface StoryDetail {
	id: number;
	title: string;
	content: string;
	coverImageUrl: string | null;
}

export interface Achievement {
	id: number;
	name: string;
	description: string;
	iconUrl: string | null;
	pointReward: number;
}

export interface EarnedAchievement {
	achievement: Achievement;
	earnedAt: string;
}
