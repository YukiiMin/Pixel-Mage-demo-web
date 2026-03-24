import type { Locator, Page, Route } from "@playwright/test";
import { MOCK_UNLINK_REQUESTS, mockStaffAuth } from "../mocks/handlers";

export class StaffUnlinkPage {
	readonly page: Page;
	readonly tableBody: Locator;
	readonly skeleton: Locator;
	readonly emptyState: Locator;
	readonly tableError: Locator;

	constructor(page: Page) {
		this.page = page;
		this.tableBody = page.getByRole("table");
		this.skeleton = page.getByTestId("table-skeleton");
		this.emptyState = page.getByTestId("empty-state");
		this.tableError = page.getByTestId("table-error");
	}

	async setup(requests = MOCK_UNLINK_REQUESTS) {
		await mockStaffAuth(this.page);
		await this.page.route(
			"**/api/staff/unlink-requests",
			async (route: Route) => {
				if (route.request().method() === "GET") {
					await route.fulfill({
						json: { code: 200, data: requests },
					});
				} else {
					await route.continue();
				}
			},
		);
	}

	async goto() {
		await this.page.goto("/staff/unlink-requests");
		await this.page.waitForLoadState("networkidle");
	}

	getRow(id: number) {
		return this.page.getByTestId(`unlink-row-${id}`);
	}

	getApproveBtn(id: number) {
		return this.page.getByTestId(`approve-btn-${id}`);
	}

	getRejectBtn(id: number) {
		return this.page.getByTestId(`reject-btn-${id}`);
	}

	getFilterTab(value: string) {
		return this.page.getByTestId(`filter-tab-${value.toLowerCase()}`);
	}

	getApproveDialog() {
		return this.page.getByTestId("approve-confirm-dialog");
	}

	getRejectModal() {
		return this.page.getByTestId("reject-modal");
	}

	getStaffNoteInput() {
		return this.page.getByTestId("staff-note-input");
	}

	getRejectSubmitBtn() {
		return this.page.getByTestId("reject-submit-btn");
	}

	getApproveConfirmBtn() {
		return this.page.getByTestId("approve-confirm-btn");
	}
}
