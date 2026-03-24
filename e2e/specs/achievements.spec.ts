import { expect, test } from "@playwright/test";
import { AchievementsPage } from "../pages/achievements.page";

test.describe("Achievements Page", () => {
	let achievementsPage: AchievementsPage;

	test.beforeEach(async ({ page }) => {
		achievementsPage = new AchievementsPage(page);
	});

	test("Achievements page renders earned section + unearned section", async ({
		page,
	}) => {
		await achievementsPage.gotoWithMock();

		// 1 is earned, 2 is unearned
		const earnedBadge = achievementsPage.getAchievementBadge(1);
		const unearnedBadge = achievementsPage.getAchievementBadge(2);

		await expect(earnedBadge).toBeVisible();
		await expect(unearnedBadge).toBeVisible();

		// Should have correct data-earned
		await expect(earnedBadge).toHaveAttribute("data-earned", "true");
		await expect(unearnedBadge).toHaveAttribute("data-earned", "false");
	});

	test("Hover glow is only on earned achievement", async ({ page }) => {
		await achievementsPage.gotoWithMock();

		const earnedBadge = achievementsPage.getAchievementBadge(1);
		const unearnedBadge = achievementsPage.getAchievementBadge(2);

		await expect(earnedBadge).toHaveClass(/hover:shadow/);
		await expect(unearnedBadge).not.toHaveClass(/hover:shadow/);
	});
});
