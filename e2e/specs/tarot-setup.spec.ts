import { expect, test } from "@playwright/test";
import { TarotSetupPage } from "../pages/tarot-setup.page";

test.describe("Tarot Setup Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Mock config data if needed

		// Mock spreads API
		await page.route("**/api/v1/readings/spreads", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: [
						{
							spreadId: 1,
							name: "Rút 1 Lá",
							description: "Khám phá vấn đề một cách nhanh chóng",
							positionCount: 1,
							minCardsRequired: 1,
						},
						{
							spreadId: 2,
							name: "Trải Bài 3 Lá",
							description: "Quá khứ, hiện tại, tương lai",
							positionCount: 3,
							minCardsRequired: 3,
						},
					],
				},
			});
		});
	});

	test("scenario 1: happy path - user có cards", async ({ page }) => {
		// Mock account profile
		await page.route("**/api/accounts/**", async (route) => {
			await route.fulfill({
				json: {
					data: {
						id: 1,
						name: "Test User",
						email: "test@example.com",
						guestReadingUsedAt: null,
					},
				},
			});
		});

		// Mock inventory (has cards)
		await page.route("**/api/inventory/my-cards*", async (route) => {
			await route.fulfill({
				json: {
					data: [
						{ cardId: 101, name: "The Fool", quantity: 1, rarity: "COMMON" },
					],
				},
			});
		});

		// Mock session creation
		// Mock session creation success
		let createSessionPayload: any = null;
		await page.route("**/api/v1/readings/sessions", async (route) => {
			if (route.request().method() === "POST") {
				createSessionPayload = JSON.parse(route.request().postData() || "{}");
				await route.fulfill({
					json: {
						data: {
							sessionId: 999,
							spreadId: 1,
							mode: "EXPLORE",
							status: "PENDING",
						},
					},
				});
			} else {
				await route.continue();
			}
		});

		// Mock login (simulate logged in user)
		await page.context().addCookies([
			{
				name: "pm_logged_in",
				value: "1",
				url: "http://localhost:3000",
			},
			{
				name: "pm_user_id",
				value: "1",
				url: "http://localhost:3000",
			},
		]);

		const setupPage = new TarotSetupPage(page);
		await setupPage.goto();

		// Step 0
		await setupPage.selectTopic("Tình Yêu");
		await setupPage.clickNext();

		// Step 1: Skip question
		await setupPage.clickNext();

		// Step 2
		await setupPage.selectSpread("Rút 1 Lá");
		console.log("Scenario 1: Step 2 spread selected.");

		// Assert guest banner is NOT shown
		await expect(setupPage.guestBanner).not.toBeVisible();

		// Assert start button is enabled
		await expect(setupPage.startButton).toBeEnabled();

		await setupPage.clickStart();

		// Verify POST body mode: 'EXPLORE'
		expect(createSessionPayload).toBeDefined();
		expect(createSessionPayload.mode).toBe("EXPLORE");
		expect(createSessionPayload.spreadId).toBe(1);

		// Verify navigation to session id
		await page.waitForURL("**/tarot/session/999");
	});

	test("scenario 2: guest gratis - no cards, chưa dùng thẻ khách hôm nay", async ({
		page,
	}) => {
		// Mock account (not used today)
		await page.route("**/api/accounts/**", async (route) => {
			await route.fulfill({
				json: {
					data: {
						id: 1,
						name: "Test User",
						email: "test@example.com",
						guestReadingUsedAt: null, // HAS NOT USED
					},
				},
			});
		});

		// Mock inventory (NO cards)
		await page.route("**/api/inventory/my-cards*", async (route) => {
			await route.fulfill({
				json: { data: [] },
			});
		});

		// Mock session creation success
		await page.route("**/api/v1/readings/sessions", async (route) => {
			if (route.request().method() === "POST") {
				await route.fulfill({
					json: {
						data: {
							sessionId: 888,
							spreadId: 1,
							mode: "EXPLORE",
							mainQuestion: "",
							status: "PENDING",
							createdAt: new Date().toISOString(),
						},
					},
				});
			} else {
				await route.continue();
			}
		});

		// Set auth
		await page.context().addCookies([
			{ name: "pm_logged_in", value: "1", url: "http://localhost:3000" },
			{ name: "pm_user_id", value: "1", url: "http://localhost:3000" },
		]);

		const setupPage = new TarotSetupPage(page);
		await setupPage.goto();

		await setupPage.selectTopic("Sự Nghiệp");
		await setupPage.clickNext();
		await setupPage.clickNext(); // Skip question

		await setupPage.selectSpread("Rút 1 Lá");

		// Assert start is enabled, no banner
		await expect(setupPage.guestBanner).not.toBeVisible();
		await expect(setupPage.startButton).toBeEnabled();

		await setupPage.clickStart();
		await page.waitForURL("**/tarot/session/888");
	});

	test("scenario 3: guest hết lượt - no cards, đã dùng hôm nay", async ({
		page,
	}) => {
		// Mock account (USED today)
		await page.route("**/api/accounts/**", async (route) => {
			await route.fulfill({
				json: {
					data: {
						id: 1,
						name: "Test User",
						email: "test@example.com",
						guestReadingUsedAt: new Date().toISOString(), // USED TODAY
					},
				},
			});
		});

		// Mock inventory (NO cards)
		await page.route("**/api/inventory/my-cards*", async (route) => {
			await route.fulfill({
				json: { data: [] },
			});
		});

		// Set auth
		await page.context().addCookies([
			{ name: "pm_logged_in", value: "1", url: "http://localhost:3000" },
			{ name: "pm_user_id", value: "1", url: "http://localhost:3000" },
		]);

		const setupPage = new TarotSetupPage(page);
		await setupPage.goto();

		await setupPage.selectTopic("Tổng Quát");
		await setupPage.clickNext();
		await setupPage.clickNext();

		await setupPage.selectSpread("Rút 1 Lá");

		// Assert guest banner IS shown, Start button IS disabled
		await expect(setupPage.guestBanner).toBeVisible();
		await expect(setupPage.guestBannerBuyButton).toBeVisible();

		await expect(setupPage.startButton).toBeDisabled();

		// Click buy pack -> verify go to marketplace
		await setupPage.guestBannerBuyButton.click();
		await page.waitForURL("**/marketplace");
	});

	test("scenario 4: 409 active session conflict", async ({ page }) => {
		await page.route("**/api/accounts/**", async (route) => {
			await route.fulfill({
				json: { data: { id: 1, guestReadingUsedAt: null } },
			});
		});
		await page.route("**/api/inventory/my-cards*", async (route) => {
			await route.fulfill({
				json: { data: [{ cardId: 101, name: "The Fool" }] },
			});
		});

		// MOCK 409 Conflict
		await page.route("**/api/v1/readings/sessions", async (route) => {
			if (route.request().method() === "POST") {
				await route.fulfill({
					status: 409,
					json: {
						code: 409, // Added 'code' as requested
						statusCode: 409,
						message: "Active session exists",
						data: {
							activeSessionId: 444,
						},
					},
				});
			} else {
				await route.continue();
			}
		});

		await page.context().addCookies([
			{ name: "pm_logged_in", value: "1", url: "http://localhost:3000" },
			{ name: "pm_user_id", value: "1", url: "http://localhost:3000" },
		]);

		const setupPage = new TarotSetupPage(page);
		await setupPage.goto();

		await setupPage.selectTopic("Sự Nghiệp");
		await setupPage.clickNext();
		await setupPage.clickNext();
		await setupPage.selectSpread("Trải Bài 3 Lá");

		await setupPage.clickStart();

		// Check banner appears - Wait specifically for the banner before assert
		await expect(setupPage.activeSessionBanner).toBeVisible({ timeout: 10000 });

		// Click continue
		await setupPage.activeSessionContinueButton.click();
		await page.waitForURL("**/tarot/session/444");
	});
});
