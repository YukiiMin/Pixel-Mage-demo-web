import { expect, type Locator, type Page } from "@playwright/test";

export class WalletPage {
	readonly page: Page;
	readonly walletBalanceAmount: Locator;
	readonly exchangeBtn: Locator;
	readonly alertDialogContent: Locator;
	readonly alertConfirmBtn: Locator;
	readonly alertCancelBtn: Locator;
	readonly voucherInput: Locator;
	readonly voucherApplyBtn: Locator;
	readonly voucherErrorMsg: Locator;

	constructor(page: Page) {
		this.page = page;
		this.walletBalanceAmount = page.getByTestId("wallet-balance-amount");
		this.exchangeBtn = page.getByRole("button", {
			name: /Đổi Điểm Thành Voucher/i,
		});
		this.alertDialogContent = page.getByRole("alertdialog");
		this.alertConfirmBtn = page.getByRole("button", { name: /Đổi Ngay/i });
		this.alertCancelBtn = page.getByRole("button", { name: /Hủy Bỏ/i });
		this.voucherInput = page.getByTestId("voucher-input-field");
		this.voucherApplyBtn = page.getByRole("button", { name: /Áp Dụng/i });
		this.voucherErrorMsg = page.getByTestId("voucher-error-msg");
	}

	async setAuthAndGoto() {
		await this.page.context().addCookies([
			{ name: "pm_logged_in", value: "1", domain: "localhost", path: "/" },
			{ name: "pm_user_id", value: "123", domain: "localhost", path: "/" },
		]);
		await this.page.route("**/api/accounts/123", (route) => {
			route.fulfill({
				status: 200,
				body: JSON.stringify({ code: 200, data: { userId: 123 } }),
			});
		});

		await this.page.goto("/wallet");
		await this.page.waitForLoadState("networkidle");
	}

	async mockWalletBalance(balance: number) {
		await this.page.route("**/api/wallet/balance", (route) => {
			route.fulfill({
				status: 200,
				body: JSON.stringify({ code: 200, data: { pmPoint: balance } }),
			});
		});
	}

	async mockExchangeSuccess() {
		await this.page.route("**/api/wallet/exchange", (route) => {
			route.fulfill({
				status: 200,
				body: JSON.stringify({ code: 200, data: {} }),
			});
		});
	}

	async mockVouchers(vouchers: any[]) {
		await this.page.route("**/api/vouchers/my", (route) => {
			route.fulfill({
				status: 200,
				body: JSON.stringify({ code: 200, data: vouchers }),
			});
		});
	}

	async mockVoucherValidateSuccess(discountAmount: number, code: string) {
		await this.page.route("**/api/vouchers/validate", (route) => {
			route.fulfill({
				status: 200,
				body: JSON.stringify({
					code: 200,
					data: {
						isValid: true,
						discountAmount,
						finalTotal: 100000 - discountAmount,
					},
				}),
			});
		});
	}

	async mockVoucherValidateError(message: string) {
		await this.page.route("**/api/vouchers/validate", (route) => {
			route.fulfill({
				status: 400,
				body: JSON.stringify({ code: 400, message, data: null }),
			});
		});
	}
}
