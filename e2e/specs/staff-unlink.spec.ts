import type { Route } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { MOCK_UNLINK_REQUESTS } from "../mocks/handlers";
import { StaffUnlinkPage } from "../pages/staff-unlink.page";

// Auth mock for all tests: login + pm_user_role=STAFF (required for /staff/* by middleware)
test.describe("Staff Unlink Requests", () => {
	// ─── Test 1: Happy path — table renders all requests ───────────────────────
	test("Table renders all requests from mock", async ({ page }) => {
		const staffPage = new StaffUnlinkPage(page);
		await staffPage.setup();
		await staffPage.goto();

		// All 3 mock rows should be visible
		await expect(staffPage.getRow(1)).toBeVisible();
		await expect(staffPage.getRow(2)).toBeVisible();
		await expect(staffPage.getRow(3)).toBeVisible();

		// Table element present
		await expect(staffPage.tableBody).toBeVisible();

		// Verify content of first row
		await expect(staffPage.getRow(1)).toContainText("The Fool");
		await expect(staffPage.getRow(1)).toContainText("Nguyễn Văn A");
	});

	// ─── Test 2: Filter PENDING ─────────────────────────────────────────────────
	test("Filter PENDING shows only pending rows", async ({ page }) => {
		const staffPage = new StaffUnlinkPage(page);
		await staffPage.setup();
		await staffPage.goto();

		// Click PENDING filter
		await staffPage.getFilterTab("PENDING").click();

		// Row 1 (PENDING) should be visible
		await expect(staffPage.getRow(1)).toBeVisible();

		// Row 3 (APPROVED) should NOT be visible
		await expect(staffPage.getRow(3)).not.toBeVisible();
	});

	// ─── Test 3: Approve → confirmation modal appears before submit ─────────────
	test("Approve button → AlertDialog appears before submit", async ({
		page,
	}) => {
		const staffPage = new StaffUnlinkPage(page);
		await staffPage.setup();
		await staffPage.goto();

		// Click approve for row 1 (PENDING)
		await staffPage.getApproveBtn(1).click();

		// AlertDialog must appear (not window.confirm)
		const dialog = staffPage.getApproveDialog();
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText("Xác nhận phê duyệt");
		await expect(dialog).toContainText("The Fool");
	});

	// ─── Test 4: Reject — staffNote empty → submit disabled ─────────────────────
	test("Reject modal: submit disabled when staffNote is empty", async ({
		page,
	}) => {
		const staffPage = new StaffUnlinkPage(page);
		await staffPage.setup();
		await staffPage.goto();

		// Click reject for row 1
		await staffPage.getRejectBtn(1).click();

		// Modal should be visible
		await expect(staffPage.getRejectModal()).toBeVisible();

		// staffNote is empty — submit button should be disabled
		await expect(staffPage.getRejectSubmitBtn()).toBeDisabled();
	});

	// ─── Test 5: Reject — staffNote filled → submit enabled ─────────────────────
	test("Reject modal: submit enabled when staffNote is filled", async ({
		page,
	}) => {
		const staffPage = new StaffUnlinkPage(page);
		await staffPage.setup();

		// Mock POST reject
		await page.route(
			"**/api/staff/unlink-requests/1/reject",
			async (route: Route) => {
				await route.fulfill({
					status: 200,
					json: { code: 200, data: null },
				});
			},
		);

		await staffPage.goto();

		// Open reject modal
		await staffPage.getRejectBtn(1).click();
		await expect(staffPage.getRejectModal()).toBeVisible();

		// Fill staffNote
		await staffPage.getStaffNoteInput().fill("Thẻ không hợp lệ theo quy định.");

		// Submit button should now be enabled
		await expect(staffPage.getRejectSubmitBtn()).toBeEnabled();
	});

	// ─── Test 6: After approve → table refreshes ────────────────────────────────
	test("After approve → table re-fetches and reflects updated data", async ({
		page,
	}) => {
		const staffPage = new StaffUnlinkPage(page);

		// Initial: 3 requests with id=1 PENDING
		let callCount = 0;
		const UPDATED_REQUESTS = MOCK_UNLINK_REQUESTS.map((r) =>
			r.id === 1
				? { ...r, status: "APPROVED", processedAt: new Date().toISOString() }
				: r,
		);

		await staffPage.page.context().addCookies([
			{ name: "pm_logged_in", value: "1", url: "http://localhost:3000" },
			{ name: "pm_user_id", value: "123", url: "http://localhost:3000" },
			{ name: "pm_user_role", value: "STAFF", url: "http://localhost:3000" },
		]);
		await page.route("**/api/accounts/123", async (route: Route) => {
			await route.fulfill({
				json: {
					code: 200,
					data: { id: 123, name: "Staff User", role: "STAFF" },
				},
			});
		});
		await page.route("**/api/staff/unlink-requests", async (route: Route) => {
			if (route.request().method() === "GET") {
				callCount++;
				const data = callCount === 1 ? MOCK_UNLINK_REQUESTS : UPDATED_REQUESTS;
				await route.fulfill({ json: { code: 200, data } });
			} else {
				await route.continue();
			}
		});
		await page.route(
			"**/api/staff/unlink-requests/1/approve",
			async (route: Route) => {
				await route.fulfill({ status: 200, json: { code: 200, data: null } });
			},
		);

		await staffPage.goto();

		// Confirm row 1 with PENDING approve button visible
		await expect(staffPage.getApproveBtn(1)).toBeVisible();

		// Click approve → dialog → confirm
		await staffPage.getApproveBtn(1).click();
		await expect(staffPage.getApproveDialog()).toBeVisible();
		await staffPage.getApproveConfirmBtn().click();

		// Wait for modal to close + re-fetch
		await expect(staffPage.getApproveDialog()).not.toBeVisible({
			timeout: 5000,
		});

		// After refetch: row 1 should now show APPROVED badge
		await expect(
			staffPage.getRow(1).getByTestId("status-badge-approved"),
		).toBeVisible({ timeout: 5000 });

		// Approve button for row 1 should be gone (APPROVED status = no actions)
		await expect(staffPage.getApproveBtn(1)).not.toBeVisible();
	});
});
