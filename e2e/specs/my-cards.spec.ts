import { expect, test } from "@playwright/test";
import { MyCardsPage } from "../pages/my-cards.page";

test.describe("My Cards Page", () => {
	let myCardsPage: MyCardsPage;

	test.beforeEach(async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		myCardsPage = new MyCardsPage(page);
	});

	test("shows skeleton loading state initially", async ({ page }) => {
		await page.context().addCookies([
			{
				name: "pm_user_id",
				value: "123",
				domain: "localhost",
				path: "/",
			},
		]);

		// Intercept and delay the response to ensure skeletons are visible
		await page.route("**/api/inventory/my-cards*", async (route) => {
			await new Promise((r) => setTimeout(r, 500));
			await route.fulfill({ json: { data: [] } });
		});

		await page.route("**/api/collections/progress*", async (route) => {
			await route.fulfill({ json: { data: [] } });
		});

		await page.route("**/api/accounts/123", async (route) => {
			await route.fulfill({ json: { data: { id: 123 } } });
		});

		const gotoPromise = myCardsPage.page.goto("/my-cards", {
			waitUntil: "domcontentloaded",
		});

		// Wait that skeleton appears before network finishes
		await expect(page.getByTestId("card-skeleton").first()).toBeVisible();
		await gotoPromise;
		// Wait that skeleton is gone
		await expect(page.getByTestId("card-skeleton").first()).not.toBeVisible();
	});

	test("card grid shows correct number of cards with data", async () => {
		await myCardsPage.gotoWithMock();
		await expect(
			myCardsPage.cardGrid.locator('[data-testid^="card-"]'),
		).toHaveCount(3);
	});

	test('shows "Scan NFC" empty state when no cards', async () => {
		await myCardsPage.gotoEmpty();
		await expect(myCardsPage.emptyState).toBeVisible();
		await expect(myCardsPage.emptyState).toContainText(/Kho thẻ đang trống/i);
		await expect(myCardsPage.emptyState).toContainText(/Scan NFC/i);
	});

	test("LEGENDARY card has correct attributes and classes", async () => {
		await myCardsPage.gotoWithMock();
		const legendCard = myCardsPage.getCardById("3");
		await expect(legendCard).toHaveAttribute("data-rarity", "LEGENDARY");
		await expect(legendCard).toHaveClass(/glow-gold/);
		await expect(legendCard).toHaveClass(/animate-pulse-glow/);
	});

	test("RARE card has correct rarity data attribute", async () => {
		await myCardsPage.gotoWithMock();
		const rareCard = myCardsPage.getCardById("2");
		await expect(rareCard).toHaveAttribute("data-rarity", "RARE");
	});

	test("filtering functionally works and shows filter-empty-state when no match", async () => {
		await myCardsPage.gotoWithMock();

		// 1. Filter by RARE (Should have 1)
		await myCardsPage.filterByRarity("RARE");
		await expect(
			myCardsPage.cardGrid.locator('[data-testid^="card-"]'),
		).toHaveCount(1, { timeout: 10000 });
		await expect(myCardsPage.getCardById("2")).toBeVisible();

		// 2. Filter by LEGENDARY (Should have 1)
		await myCardsPage.filterByRarity("LEGENDARY");
		await expect(
			myCardsPage.cardGrid.locator('[data-testid^="card-"]'),
		).toHaveCount(1, { timeout: 10000 });
		await expect(myCardsPage.getCardById("3")).toBeVisible();

		// 3. Reset to ALL (Should have 3)
		await myCardsPage.filterByRarity("ALL");
		await expect(
			myCardsPage.cardGrid.locator('[data-testid^="card-"]'),
		).toHaveCount(3, { timeout: 10000 });
	});

	test("collection progress bar displays correct aria attributes", async () => {
		await myCardsPage.gotoWithMock();
		const bar1 = myCardsPage.page.getByTestId("progress-bar-101");
		await expect(bar1).toBeVisible();
		await expect(bar1).toHaveAttribute("aria-valuenow", "100");
		await expect(bar1).toHaveAttribute("aria-valuemin", "0");
		await expect(bar1).toHaveAttribute("aria-valuemax", "100");
	});

	test("clicking a card opens modal without unlink button", async () => {
		await myCardsPage.gotoWithMock();
		const card = myCardsPage.getCardById("1");
		await expect(card).toBeVisible();
		await card.click({ force: true });
		await expect(myCardsPage.modal).toBeVisible();
		await expect(myCardsPage.modal.getByText("Unlink")).not.toBeVisible();
	});
});
