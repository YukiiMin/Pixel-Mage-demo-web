import { expect, test } from "@playwright/test";
import type { Pack } from "../../src/types/commerce";
import { MarketplacePage } from "../pages/marketplace.page";

const MOCK_PACKS: Partial<Pack>[] = [
	{
		packId: 1,
		name: "Starter Deck Mới Cấp",
		description:
			"Bao gồm 5 thẻ cơ bản để bắt đầu hành trình. 100% ra thẻ Common.",
		price: 15000,
		status: "STOCKED",
		cardCount: 5,
		isLimited: false,
		createdAt: new Date().toISOString(),
	},
	{
		packId: 2,
		name: "Booster Huyền Bí",
		description: "Chứa 5 thẻ ngẫu nhiên, tỉ lệ ra Rare và Legendary cao.",
		price: 35000,
		status: "STOCKED",
		cardCount: 5,
		isLimited: true,
		createdAt: new Date().toISOString(),
	},
];

test.describe("Marketplace Feature (TASK-FE-05)", () => {
	let mpPage: MarketplacePage;

	test.beforeEach(async ({ page }) => {
		mpPage = new MarketplacePage(page);
		await mpPage.mockPacks(MOCK_PACKS);
		await mpPage.mockPackDetail(2, MOCK_PACKS[1]);
	});

	test("pack grid renders from mock API", async () => {
		await mpPage.setAuthAndGoto();

		await expect(mpPage.packGrid).toBeVisible();

		// Check 2 mock packs
		await expect(mpPage.packCard("Starter Deck Mới Cấp")).toBeVisible();
		await expect(mpPage.packCard("Booster Huyền Bí")).toBeVisible();
	});

	test("click pack card opens modal", async () => {
		await mpPage.setAuthAndGoto();

		await mpPage
			.packCard("Booster Huyền Bí")
			.getByRole("button", { name: "Xem chi tiết" })
			.click();
		await expect(mpPage.packDetailModal).toBeVisible();
	});

	test("drop rate table visible BEFORE Checkout button in DOM (legal requirement)", async () => {
		await mpPage.setAuthAndGoto();

		await mpPage
			.packCard("Booster Huyền Bí")
			.getByRole("button", { name: "Xem chi tiết" })
			.click();
		await expect(mpPage.packDetailModal).toBeVisible();

		// Ensure we wait for them to be visible
		await expect(mpPage.dropRateTable).toBeVisible();
		await expect(mpPage.checkoutBtn).toBeVisible();

		// the critical boundingBox check
		const dropRateBox = await mpPage.dropRateTable.boundingBox();
		const checkoutBox = await mpPage.checkoutBtn.boundingBox();

		expect(dropRateBox).not.toBeNull();
		expect(checkoutBox).not.toBeNull();
		expect(dropRateBox!.y).toBeLessThan(checkoutBox!.y);
	});

	test("Checkout button present in modal with correct text", async () => {
		await mpPage.setAuthAndGoto();

		await mpPage
			.packCard("Booster Huyền Bí")
			.getByRole("button", { name: "Xem chi tiết" })
			.click();

		await expect(mpPage.checkoutBtn).toBeVisible();
		await expect(mpPage.checkoutBtn).toHaveText(/Mua ngay/);
	});
});
