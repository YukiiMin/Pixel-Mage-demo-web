import { expect, test } from "@playwright/test";
import { WalletPage } from "../pages/wallet.page";

test.describe("Wallet and Voucher System", () => {
	let walletPage: WalletPage;

	test.beforeEach(async ({ page }) => {
		walletPage = new WalletPage(page);
	});

	test("WalletBalance hiển thị đúng balance từ mock", async ({ page }) => {
		await walletPage.mockWalletBalance(150000);
		await walletPage.mockVouchers([]);
		await walletPage.setAuthAndGoto();

		await expect(walletPage.walletBalanceAmount).toHaveText("150,000");
	});

	test("Click Exchange -> AlertDialog xuất hiện, không dùng window.confirm", async ({
		page,
	}) => {
		await walletPage.mockWalletBalance(50000);
		await walletPage.mockVouchers([]);
		await walletPage.setAuthAndGoto();

		// Ensure window.confirm is not called
		let confirmCalled = false;
		page.on("dialog", (dialog) => {
			if (dialog.type() === "confirm") confirmCalled = true;
			dialog.accept();
		});

		await walletPage.exchangeBtn.click();
		await expect(walletPage.alertDialogContent).toBeVisible();
		expect(confirmCalled).toBe(false);
	});

	test("Confirm exchange -> invalidate queries + balance update", async ({
		page,
	}) => {
		await walletPage.mockWalletBalance(50000);
		await walletPage.mockVouchers([]);
		await walletPage.mockExchangeSuccess();

		// Track requests
		let balanceRequested = 0;
		let vouchersRequested = 0;

		await page.route("**/api/wallet/balance", async (route) => {
			balanceRequested++;
			await route.fulfill({
				status: 200,
				body: JSON.stringify({ code: 200, data: { pmPoint: 40000 } }),
			});
		});

		await page.route("**/api/vouchers/my", async (route) => {
			vouchersRequested++;
			await route.fulfill({
				status: 200,
				body: JSON.stringify({
					code: 200,
					data: [
						{
							id: 1,
							code: "NEW_VOUCHER",
							discountAmount: 10000,
							status: "ACTIVE",
						},
					],
				}),
			});
		});

		await walletPage.setAuthAndGoto();

		// Reset counters after initial load
		balanceRequested = 0;
		vouchersRequested = 0;

		await walletPage.exchangeBtn.click();
		await walletPage.alertConfirmBtn.click();

		await expect(walletPage.alertDialogContent).not.toBeVisible();

		// Verify toast success
		await expect(page.getByText("Đổi điểm thành công!")).toBeVisible();

		// Wait for invalidation to trigger requests
		await expect.poll(() => balanceRequested).toBeGreaterThan(0);
		await expect.poll(() => vouchersRequested).toBeGreaterThan(0);

		// Check balance update visually
		await expect(walletPage.walletBalanceAmount).toHaveText("40,000");
	});

	test("VoucherList render đúng số vouchers từ mock", async ({ page }) => {
		await walletPage.mockWalletBalance(1000);
		await walletPage.mockVouchers([
			{ id: 1, code: "TEST10", discountPercentage: 10, status: "ACTIVE" },
			{ id: 2, code: "EXPIRED1", discountAmount: 50000, status: "USED" },
		]);
		await walletPage.setAuthAndGoto();

		await expect(page.getByTestId("voucher-item-TEST10")).toBeVisible();
		await expect(page.getByTestId("voucher-item-EXPIRED1")).toBeVisible();
	});

	test("VoucherInput: validate trả success -> hiện discount", async ({
		page,
	}) => {
		await walletPage.mockWalletBalance(1000);
		await walletPage.mockVouchers([]);
		await walletPage.setAuthAndGoto();

		await walletPage.mockVoucherValidateSuccess(20000, "DISCOUNT20");

		await walletPage.voucherInput.fill("DISCOUNT20");
		await walletPage.voucherApplyBtn.click();

		await expect(page.getByText("DISCOUNT20")).toBeVisible();
		await expect(page.getByText("Giảm 20,000đ")).toBeVisible();
	});

	test("VoucherInput: validate trả 400 -> hiện error message", async ({
		page,
	}) => {
		await walletPage.mockWalletBalance(1000);
		await walletPage.mockVouchers([]);
		await walletPage.setAuthAndGoto();

		await walletPage.mockVoucherValidateError("Mã giảm giá hết hạn");

		await walletPage.voucherInput.fill("EXPIREDMOCK");
		await walletPage.voucherApplyBtn.click();

		await expect(walletPage.voucherErrorMsg).toHaveText("Mã giảm giá hết hạn");
	});
});
