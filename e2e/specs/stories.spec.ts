import { test, expect } from "@playwright/test";
import { StoriesPage } from "../pages/stories.page";

test.describe("Stories Page", () => {
	let storiesPage: StoriesPage;

	test.beforeEach(async ({ page }) => {
		storiesPage = new StoriesPage(page);
	});

	test("Stories list renders with mock data", async ({ page }) => {
		await storiesPage.gotoWithMock();
		await expect(storiesPage.getStoryCard(1)).toBeVisible();
		await expect(storiesPage.getStoryCard(2)).toBeVisible();
	});

	test("Locked story card has data-locked='true' and does not navigate", async ({
		page,
	}) => {
		await storiesPage.gotoWithMock();
		const lockedCard = storiesPage.getStoryCard(2);
		await expect(lockedCard).toHaveAttribute("data-locked", "true");
		// Verify nothing happens on click
		await lockedCard.click({ force: true });
		await expect(page).toHaveURL(/.*\/stories/);
	});

	test("Unlocked story card navigates to /stories/{id}", async ({ page }) => {
		await storiesPage.gotoWithMock();
		const unlockedCard = storiesPage.getStoryCard(1);
		await expect(unlockedCard).toHaveAttribute("data-locked", "false");

		// Mock the story detail endpoint
		await page.route("**/api/stories/1?userId=123", async (route) => {
			await route.fulfill({
				json: {
					data: {
						id: 1,
						title: "Unlocked Story Detail",
						content: "Detail content of the story",
						coverImageUrl: null,
					},
				},
			});
		});

		await unlockedCard.click();
		await expect(page).toHaveURL(/.*\/stories\/1/);
		await expect(page.getByText("Unlocked Story Detail")).toBeVisible();
	});

	test("Story detail renders locked state on 403", async ({ page }) => {
		await storiesPage.mockAuth();
		// Mock the story detail endpoint with 403
		await page.route("**/api/stories/2?userId=123", async (route) => {
			await route.fulfill({
				status: 403,
				json: {
					code: 403,
					message: "Locked",
				},
			});
		});

		await page.goto("/stories/2");
		await expect(page.getByTestId("locked-story-state")).toBeVisible();
		await expect(
			page.getByText("Hoàn thành bộ thẻ để truy cập nội dung này"),
		).toBeVisible();
	});

	test("Skeleton loading state visible", async ({ page }) => {
		await storiesPage.mockAuth();
		await page.route("**/api/stories?userId=123", async (route) => {
			await new Promise((r) => setTimeout(r, 600));
			await route.fulfill({ json: { data: [] } });
		});

		await page.goto("/stories");
		await expect(page.locator(".animate-pulse").first()).toBeVisible();
	});
});
