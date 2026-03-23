import { expect, type Locator, type Page, type Route } from "@playwright/test";
import { mockAuthSession, mockMyCardsApi } from "../mocks/handlers";

export class MyCardsPage {
	readonly page: Page;
	readonly cardGrid: Locator;
	readonly skeletons: Locator;
	readonly emptyState: Locator;
	readonly filterEmptyState: Locator;
	readonly progressBar: Locator;
	readonly modal: Locator;

	constructor(page: Page) {
		this.page = page;
		this.cardGrid = page.getByTestId("card-grid");
		this.skeletons = page.getByTestId("card-skeleton");
		this.emptyState = page.getByTestId("empty-state");
		this.filterEmptyState = page.getByTestId("filter-empty-state");
		this.progressBar = page.getByRole("progressbar");
		this.modal = page.getByTestId("card-detail-modal");
	}

	async gotoWithMock() {
		await mockMyCardsApi(this.page);
		await this.page.goto("/my-cards");
		// Wait for skeletons to disappear AND first card to appear
		await expect(
			this.page.getByTestId("card-skeleton").first(),
		).not.toBeVisible();
		await expect(
			this.page.locator('[data-testid^="card-"]').first(),
		).toBeVisible({ timeout: 10000 });
	}

	async gotoEmpty() {
		await mockAuthSession(this.page);

		await this.page.route("**/api/inventory/my-cards*", async (route: Route) => {
			await route.fulfill({ json: { data: [] } });
		});
		await this.page.route(
			"**/api/collections/progress*",
			async (route: Route) => {
				await route.fulfill({ json: { data: [] } });
			},
		);
		await this.page.goto("/my-cards");
		// Wait for empty state specifically
		await expect(this.page.getByTestId("empty-state")).toBeVisible({
			timeout: 10000,
		});
	}

	getCardById(id: string) {
		return this.page.getByTestId(`card-${id}`);
	}

	async filterByRarity(rarity: string) {
		// Use the newly added data-testid for guaranteed targeting
		const btn = this.page.getByTestId(`filter-${rarity}`);

		await btn.waitFor({ state: "visible", timeout: 10000 });
		await btn.click({ force: true });
	}
}
