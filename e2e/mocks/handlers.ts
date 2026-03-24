export const mockMyCardsData = {
	data: [
		{
			id: "1",
			name: "Kiếm Thần Vô Song",
			description: "Một thanh kiếm truyền thuyết.",
			quantity: 2,
			rarity: "COMMON",
			status: "AVAILABLE",
			updatedAt: "2024-03-22T10:00:00Z",
		},
		{
			id: "2",
			name: "Giáp Huyết Mạch",
			description: "Kháng mọi sát thương.",
			quantity: 1,
			rarity: "RARE",
			status: "AVAILABLE",
			updatedAt: "2024-03-22T10:00:00Z",
		},
		{
			id: "3",
			name: "Phượng Hoàng Lửa",
			description: "Sức mạnh tái sinh.",
			quantity: 1,
			rarity: "LEGENDARY",
			status: "AVAILABLE",
			updatedAt: "2024-03-22T10:00:00Z",
		},
	],
};

export const mockCollectionProgressData = {
	data: [
		{
			collectionId: "101",
			collectionName: "Bộ Starter Huyền Bí",
			completedItems: 5,
			totalItems: 5,
			completionRate: 100,
		},
		{
			collectionId: "102",
			collectionName: "Sức Mạnh Cổ Đại",
			completedItems: 2,
			totalItems: 10,
			completionRate: 20,
		},
	],
};

import type { Page, Route } from "@playwright/test";

export async function mockAuthSession(page: Page, userId = "123") {
	await page.context().addCookies([
		{ name: "pm_logged_in", value: "1", domain: "localhost", path: "/" },
		{ name: "pm_user_id", value: userId, domain: "localhost", path: "/" },
	]);

	// Mock account session check for useAuthGuard
	await page.route(`**/api/accounts/${userId}`, async (route: Route) => {
		await route.fulfill({
			json: {
				data: { id: Number(userId), email: "test@example.com", name: "Test User" },
			},
		});
	});
}

/**
 * Staff auth mock — includes pm_user_role=STAFF cookie.
 * Required for /staff/* routes (middleware reads pm_user_role).
 * Uses url: 'http://localhost:3000' — NOT domain — lesson learned FE-07/FE-09.
 */
export async function mockStaffAuth(page: Page, userId = "123") {
	await page.context().addCookies([
		{ name: "pm_logged_in", value: "1", url: "http://localhost:3000" },
		{ name: "pm_user_id", value: userId, url: "http://localhost:3000" },
		{ name: "pm_user_role", value: "STAFF", url: "http://localhost:3000" },
	]);
	await page.route(`**/api/accounts/${userId}`, async (route: Route) => {
		await route.fulfill({
			json: {
				data: {
					id: Number(userId),
					email: "staff@pixelmage.com",
					name: "Staff User",
					role: "STAFF",
				},
			},
		});
	});
}

export const MOCK_UNLINK_REQUESTS = [
	{
		id: 1,
		userId: 101,
		userName: "Nguyễn Văn A",
		userEmail: "user-a@example.com",
		cardId: 201,
		cardName: "The Fool",
		requestedAt: "2026-03-24T09:00:00Z",
		status: "PENDING",
		staffNote: null,
		processedAt: null,
	},
	{
		id: 2,
		userId: 102,
		userName: "Trần Thị B",
		userEmail: "user-b@example.com",
		cardId: 202,
		cardName: "The World",
		requestedAt: "2026-03-23T14:30:00Z",
		status: "EMAIL_CONFIRMED",
		staffNote: null,
		processedAt: null,
	},
	{
		id: 3,
		userId: 103,
		userName: "Lê Văn C",
		userEmail: "user-c@example.com",
		cardId: 203,
		cardName: "The Star",
		requestedAt: "2026-03-22T10:00:00Z",
		status: "APPROVED",
		staffNote: null,
		processedAt: "2026-03-22T11:00:00Z",
	},
];

export async function mockUnlinkRequestsApi(
	page: Page,
	requests = MOCK_UNLINK_REQUESTS,
) {
	await mockStaffAuth(page);
	await page.route("**/api/staff/unlink-requests", async (route: Route) => {
		if (route.request().method() === "GET") {
			await route.fulfill({ json: { code: 200, data: requests } });
		} else {
			await route.continue();
		}
	});
}

export async function mockMyCardsApi(page: Page) {
	await mockAuthSession(page);

	await page.route("**/api/inventory/my-cards*", async (route: Route) => {
		await route.fulfill({ json: mockMyCardsData });
	});

	await page.route("**/api/collections/progress*", async (route: Route) => {
		await route.fulfill({ json: mockCollectionProgressData });
	});
}
