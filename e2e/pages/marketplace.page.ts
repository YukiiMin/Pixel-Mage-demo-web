import type { Page } from "@playwright/test";
import type { Pack } from "../../src/types/commerce";

export class MarketplacePage {
	readonly page: Page;
	readonly packGrid: ReturnType<Page["getByTestId"]>;
	readonly packDetailModal: ReturnType<Page["getByTestId"]>;
	readonly dropRateTable: ReturnType<Page["getByTestId"]>;
	readonly checkoutBtn: ReturnType<Page["getByTestId"]>;

	constructor(page: Page) {
		this.page = page;
		this.packGrid = this.page.getByTestId("pack-grid");
		this.packDetailModal = this.page.getByTestId("pack-detail-modal");
		this.dropRateTable = this.page.getByTestId("drop-rate-table");
		this.checkoutBtn = this.page.getByTestId("checkout-btn");
	}

	packCard(name: string) {
		return this.page.getByTestId(`pack-card-${name}`);
	}

	async mockPacks(packs: Partial<Pack>[]) {
		await this.page.route("/api/packs/available", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: packs,
				}),
			});
		});
	}

	async mockPackDetail(packId: number, pack: Partial<Pack>) {
		await this.page.route(`/api/packs/${packId}`, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: pack,
				}),
			});
		});
	}

	async setAuthAndGoto() {
		await this.page.context().addCookies([
			{
				name: "pm_user_id",
				value: "1",
				domain: "localhost",
				path: "/",
			},
		]);
		await this.page.goto("/marketplace");
		await this.page.waitForLoadState("networkidle");
	}
}
