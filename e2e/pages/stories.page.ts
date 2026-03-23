import { expect, type Locator, type Page, type Route } from "@playwright/test";

export class StoriesPage {
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
		await this.page.route(
			"**/api/stories?userId=123",
			async (route: Route) => {
				await route.fulfill({
					json: {
						data: [
							{
								id: 1,
								title: "Unlocked Story",
								summary: "Unlocked summary",
								coverImageUrl: null,
								isLocked: false,
							},
							{
								id: 2,
								title: "Locked Story",
								summary: "Locked summary",
								coverImageUrl: null,
								isLocked: true,
							},
						],
					},
				});
			},
		);
		await this.page.goto("/stories");
		await expect(
			this.page.locator('[data-testid^="story-card-"]').first(),
		).toBeVisible({ timeout: 10000 });
	}

	getStoryCard(id: number) {
		return this.page.getByTestId(`story-card-${id}`);
	}
}
