export const mockMyCardsData = {
	data: [
		{
			id: "1",
			name: "Kiếm Thần Vô Song",
			description: "Một thanh kiếm truyền thuyết.",
			quantity: 2,
			rarity: "COMMON",
			status: "AVAILABLE",
			updatedAt: "2024-03-22T10:00:00Z"
		},
		{
			id: "2",
			name: "Giáp Huyết Mạch",
			description: "Kháng mọi sát thương.",
			quantity: 1,
			rarity: "RARE",
			status: "AVAILABLE",
			updatedAt: "2024-03-22T10:00:00Z"
		},
		{
			id: "3",
			name: "Phượng Hoàng Lửa",
			description: "Sức mạnh tái sinh.",
			quantity: 1,
			rarity: "LEGENDARY",
			status: "AVAILABLE",
			updatedAt: "2024-03-22T10:00:00Z"
		}
	]
};

export const mockCollectionProgressData = {
	data: [
		{
			collectionId: "101",
			collectionName: "Bộ Starter Huyền Bí",
			completedItems: 5,
			totalItems: 5,
			completionRate: 100
		},
		{
			collectionId: "102",
			collectionName: "Sức Mạnh Cổ Đại",
			completedItems: 2,
			totalItems: 10,
			completionRate: 20
		}
	]
};

import type { Page, Route } from '@playwright/test';

export async function mockMyCardsApi(page: Page) {
    await page.context().addCookies([
        { name: 'pm_logged_in', value: '1', domain: 'localhost', path: '/' },
        { name: 'pm_user_id', value: '123', domain: 'localhost', path: '/' },
    ]);

    await page.route('**/api/inventory/my-cards*', async (route: Route) => {
        await route.fulfill({ json: mockMyCardsData });
    });
    
    await page.route('**/api/collections/progress*', async (route: Route) => {
        await route.fulfill({ json: mockCollectionProgressData });
    });

    // Mock account session check for useAuthGuard
    await page.route('**/api/accounts/123', async (route: Route) => {
        await route.fulfill({ json: { data: { id: 123, email: 'test@example.com', name: 'Test User' } } });
    });
}
