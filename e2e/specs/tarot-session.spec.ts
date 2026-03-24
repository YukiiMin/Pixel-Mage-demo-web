import { expect, test } from "@playwright/test";
import { TarotSessionPage } from "../pages/tarot-session.page";

test.describe("Tarot Session Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Set cookie to simulate logged in user
		await page.context().addCookies([
			{
				name: "pm_user_id",
				value: "1",
				domain: "localhost",
				path: "/",
			},
		]);

		// Mock session GET API default response
		await page.route("**/api/v1/readings/sessions/1", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: {
						sessionId: 1,
						spreadId: 1,
						mode: "EXPLORE",
						mainQuestion: "Question",
						status: "PENDING",
						drawnCards: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				},
			});
		});

		// Mock account history GET API default response
		await page.route("**/api/v1/readings/sessions", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: [],
				},
			});
		});

		// Monitor console
		page.on("console", (msg) => {
			if (msg.type() === "log") {
				console.log(`[BROWSER LOG]: ${msg.text()}`);
			}
		});
	});

	test("scenario 1: Loading skeleton visible khi GET /sessions/{id} delay", async ({
		page,
	}) => {
		const sessionPage = new TarotSessionPage(page);

		await page.route("**/api/v1/readings/sessions/1", async (route) => {
			// Delay response by 500ms
			await new Promise((resolve) => setTimeout(resolve, 500));
			await route.fulfill({
				json: { statusCode: 200, data: { sessionId: 1, status: "PENDING" } },
			});
		});

		await sessionPage.goto(1);
		
		// Wait for loading skeleton
		const skeleton = page.locator(".animate-pulse").first();
		await expect(skeleton).toBeVisible();
	});

	test("scenario 2: Resume COMPLETED — hiện result ngay", async ({ page }) => {
		const sessionPage = new TarotSessionPage(page);

		await page.route("**/api/v1/readings/sessions/1", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: {
						sessionId: 1,
						spreadId: 1,
						status: "COMPLETED",
						drawnCards: [
							{
								readingCardId: 101,
								cardTemplate: {
									cardTemplateId: 1,
									name: "Mock Card 1",
									imageUrl: "/cards/1.jpg",
									rarity: "COMMON",
								},
								positionIndex: 1,
								positionName: "Present",
								isReversed: false,
							},
						],
						interpretation: "This is the final interpretation.",
					},
				},
			});
		});

		await sessionPage.goto(1);

		// Thử check UI completionPhase
		await expect(sessionPage.completionPhase).toBeVisible();
		await expect(page.locator("text=This is the final interpretation.")).toBeVisible();
	});

	test("scenario 3: Resume INTERPRETING — hiện spinner", async ({ page }) => {
		const sessionPage = new TarotSessionPage(page);

		// Initial load: INTERPRETING
		await page.route("**/api/v1/readings/sessions/1", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: {
						sessionId: 1,
						status: "INTERPRETING",
					},
				},
			});
		});

		// Polling wait
		await page.route("**/api/v1/readings/sessions/1/interpret", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: {
						interpretation: null,
						session: { status: "INTERPRETING", sessionId: 1 },
					},
				},
			});
		});

		await sessionPage.goto(1);

		await expect(sessionPage.spinner).toBeVisible();
		await expect(page.locator("text=Vũ Trụ Đang Giải Mã...")).toBeVisible();
	});

	test("scenario 4: Resume EXPIRED — hiện expired screen", async ({ page }) => {
		const sessionPage = new TarotSessionPage(page);

		await page.route("**/api/v1/readings/sessions/1", async (route) => {
			await route.fulfill({
				json: { statusCode: 200, data: { sessionId: 1, status: "EXPIRED" } },
			});
		});

		await sessionPage.goto(1);

		await expect(sessionPage.expiredSession).toBeVisible();
		await expect(page.locator("text=Phiên Đọc Đã Hết Hạn")).toBeVisible();
		await expect(sessionPage.backToTarotButton).toBeVisible();
	});

	test("scenario 5: Resume PENDING — hiện card draw UI", async ({ page }) => {
		const sessionPage = new TarotSessionPage(page);

		await sessionPage.goto(1);

		// Shuffling phase -> Draw phase
		// Default mock status is PENDING, so it will go to Shuffling -> Draw
		// We expect card draw area to appear after shuffling animation
		await expect(sessionPage.cardDrawArea).toBeVisible({ timeout: 10000 });
	});

	test("scenario 6: Timeout 60s — warning + Thử lại button", async ({ page }) => {
		await page.clock.install();
		const sessionPage = new TarotSessionPage(page);

		await page.route("**/api/v1/readings/sessions/1", async (route) => {
			await route.fulfill({
				json: { statusCode: 200, data: { sessionId: 1, status: "INTERPRETING" } },
			});
		});

		await page.route("**/api/v1/readings/sessions/1/interpret", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: { session: { status: "INTERPRETING", sessionId: 1 } },
				},
			});
		});

		await sessionPage.goto(1);

		await expect(sessionPage.spinner).toBeVisible();
		
		// Advance clock by 61 seconds
		await page.clock.fastForward(61000);

		await expect(sessionPage.retryButton).toBeVisible();
		await expect(page.locator("text=Việc giải bài đang mất thời gian")).toBeVisible();
	});

	test("scenario 7: Max retries — sau 2 retries -> Về trang Tarot", async ({ page }) => {
		await page.clock.install();
		const sessionPage = new TarotSessionPage(page);

		await page.route("**/api/v1/readings/sessions/1", async (route) => {
			await route.fulfill({
				json: { statusCode: 200, data: { sessionId: 1, status: "INTERPRETING" } },
			});
		});

		await page.route("**/api/v1/readings/sessions/1/interpret", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: { session: { status: "INTERPRETING", sessionId: 1 } },
				},
			});
		});

		await sessionPage.goto(1);
		// Wait for React to mount and useEffect to set the timer
		await page.waitForTimeout(500); 

		await page.clock.fastForward(61000);
		// Wait a tiny bit for React state update to propagate to DOM
		await page.waitForTimeout(100); 
		await expect(sessionPage.retryButton).toBeVisible();
		await sessionPage.retryButton.click();
		// Wait for React to reset and set new timer
		await page.waitForTimeout(500); 

		// Second timeout
		await page.clock.fastForward(61000);
		await page.waitForTimeout(100);
		await expect(sessionPage.retryButton).toBeVisible();
		await sessionPage.retryButton.click();
		// Wait for React to reset and set new timer
		await page.waitForTimeout(500); 

		// Third timeout -> Max Retries
		await page.clock.fastForward(61000);
		await page.waitForTimeout(100);
		await expect(page.locator("text=Hệ thống đang gặp vấn đề")).toBeVisible();
		await expect(sessionPage.backToTarotButton).toBeVisible();
		await expect(sessionPage.retryButton).not.toBeVisible();
	});

	test("scenario 8: isReversed card — có class rotate-180 trong DOM", async ({ page }) => {
		const sessionPage = new TarotSessionPage(page);

		await page.route("**/api/v1/readings/sessions/1", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: {
						sessionId: 1,
						status: "COMPLETED",
						drawnCards: [
							{
								readingCardId: 101,
								cardTemplate: {
									cardTemplateId: 10,
									name: "The Fool",
									imageUrl: "/images/cards/fool.jpg",
									rarity: "COMMON",
								},
								positionIndex: 1,
								positionName: "Single",
								isReversed: true,
							},
						],
						interpretation: "Test",
					},
				},
			});
		});

		await sessionPage.goto(1);

		// Check classes for rotate-180
		const cardFace = page.locator(".rotate-180").first();
		await expect(cardFace).toBeVisible();
	});

	test("scenario 9: History — COMPLETED sessions shown", async ({ page }) => {
		const sessionPage = new TarotSessionPage(page);

		await page.route("**/api/v1/readings/sessions", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: [
						{
							sessionId: 2,
							status: "COMPLETED",
							mainQuestion: "Question ABC",
							createdAt: new Date().toISOString(),
							spreadId: 1,
						},
						{
							sessionId: 3,
							status: "PENDING",
							mainQuestion: "Question XYZ",
							createdAt: new Date().toISOString(),
							spreadId: 1,
						},
					],
				},
			});
		});

		await page.goto("/tarot");

		await expect(sessionPage.historyPanel).toBeVisible();
		const historyItemBlock = page.locator("[data-testid='history-item-2']");
		await expect(historyItemBlock).toBeVisible();
		
		const pendingItemBlock = page.locator("[data-testid='history-item-3']");
		await expect(pendingItemBlock).not.toBeVisible();
	});

	test("scenario 10: History empty — empty state visible", async ({ page }) => {
		const sessionPage = new TarotSessionPage(page);

		await page.route("**/api/v1/readings/sessions", async (route) => {
			await route.fulfill({
				json: {
					statusCode: 200,
					data: [],
				},
			});
		});

		await page.goto("/tarot");

		await expect(sessionPage.historyPanel).toBeVisible();
		await expect(page.locator("text=Bạn chưa có lịch sử đọc bài nào được hoàn thành.")).toBeVisible();
	});
});
