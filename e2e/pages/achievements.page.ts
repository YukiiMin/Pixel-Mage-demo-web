import { expect, type Locator, type Page, type Route } from "@playwright/test";

export class AchievementsPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async mockAuth() {
		await this.page.context().addCookies([
			{ name: "pm_logged_in", value: "1", url: "http://localhost:3000" },
			{ name: "pm_user_id", value: "123", url: "http://localhost:3000" },
		]);
		await this.page.route("**/api/accounts/123", async (route: Route) => {
			await route.fulfill({ json: { data: { id: 123 } } });
		});
	}

	async gotoWithMock() {
		await this.mockAuth();
		await this.page.route("**/api/achievements", async (route: Route) => {
			await route.fulfill({
				json: {
					data: [
						{
							id: 1,
							name: "First Blood",
							description: "Win a match",
							iconUrl: null,
							pointReward: 50,
						},
						{
							id: 2,
							name: "Hero",
							description: "Save a life",
							iconUrl: null,
							pointReward: 100,
						},
					],
				},
			});
		});
		await this.page.route("**/api/achievements/my", async (route: Route) => {
			await route.fulfill({
				json: {
					data: [
						{
							achievement: {
								id: 1,
								name: "First Blood",
								description: "Win a match",
								iconUrl: null,
								pointReward: 50,
							},
							earnedAt: "2026-03-23T00:00:00Z",
						},
					],
				},
			});
		});

		await this.page.goto("/achievements");
		await expect(
			this.page.locator('[data-testid^="achievement-"]').first(),
		).toBeVisible({ timeout: 10000 });
	}

	getAchievementBadge(id: number) {
		return this.page.getByTestId(`achievement-${id}`);
	}
}
