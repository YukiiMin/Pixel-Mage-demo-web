import { test, expect } from "@playwright/test";

test.describe("SEPay QR Checkout", () => {
	test.beforeEach(async ({ context }) => {
		await context.addInitScript(() => {
			window.sessionStorage.setItem("userId", "1");
			document.cookie = "pm_logged_in=1; path=/";
		});
	});

	test.describe("Checkout Flow Mock", () => {
		test.beforeEach(async ({ page }) => {
			// Mock list packs for marketplace index (EXACT PATH)
			await page.route("**/api/packs/available", async (route) => {
				await route.fulfill({
					json: { data: [{ packId: 1, name: "Starter Pack", status: "STOCKED", price: 50000, cardCount: 10, isLimited: false, description: "Desc", createdAt: new Date().toISOString() }] },
				});
			});
			// Mock detail pack for modal
			await page.route("**/api/packs/1", async (route) => {
				await route.fulfill({
					json: { data: { packId: 1, name: "Starter Pack", status: "STOCKED", price: 50000, cardCount: 10, isLimited: false, description: "Desc", createdAt: new Date().toISOString() } },
				});
			});

			await page.goto("/marketplace");
			// open the modal by clicking "Xem chi tiết" on the card
			await page.getByRole("button", { name: "Xem chi tiết" }).click();
			await expect(page.locator('[data-testid="pack-detail-modal"]')).toBeVisible();
		});

		test("QR image render đúng src", async ({ page }) => {
			await page.route("**/api/orders", async (route) => {
				if (route.request().method() === "POST") {
					return route.fulfill({ json: { data: { orderId: 201, totalAmount: 50000 } } });
				}
				return route.continue();
			});
			await page.route("**/api/payments/initiate?gateway=sepay", async (route) => route.fulfill({ json: { data: { paymentUrl: "https://qr.sepay.vn/img?fake", isRedirect: false } } }));
			
			const btn = page.locator('[data-testid="checkout-btn"]');
			await btn.click();

			const qrImg = page.locator('img[data-testid="qr-image"]');
			await expect(qrImg).toBeVisible({ timeout: 10000 });
			await expect(qrImg).toHaveAttribute("src", "https://qr.sepay.vn/img?fake");
		});

		test("paymentUrl null → fallback", async ({ page }) => {
			await page.route("**/api/orders", async (route) => {
				if (route.request().method() === "POST") {
					return route.fulfill({ json: { data: { orderId: 201, totalAmount: 50000 } } });
				}
				return route.continue();
			});
			await page.route("**/api/payments/initiate?gateway=sepay", async (route) => route.fulfill({ json: { data: { paymentUrl: null, isRedirect: false } } }));
			
			const btn = page.locator('[data-testid="checkout-btn"]');
			await btn.click();

			await expect(page.getByText("Không thể tải mã QR. Vui lòng thử lại.")).toBeVisible({ timeout: 10000 });
		});

		test("Poll PENDING → PAID → redirect", async ({ page }) => {
			let pollCount = 0;
			await page.route("**/api/orders", async (route) => {
				if (route.request().method() === "POST") {
					return route.fulfill({ json: { data: { orderId: 201, totalAmount: 50000 } } });
				}
				return route.continue();
			});
			await page.route("**/api/payments/initiate?gateway=sepay", async (route) => route.fulfill({ json: { data: { paymentUrl: "https://qr.sepay.vn/img?fake", isRedirect: false } } }));
			await page.route("**/api/orders/201", async (route) => {
				pollCount++;
				if (pollCount === 1) {
					return route.fulfill({ json: { data: { paymentStatus: "PENDING", status: "PENDING" } } });
				}
				return route.fulfill({ json: { data: { paymentStatus: "PAID", status: "COMPLETED" } } });
			});
			
			const btn = page.locator('[data-testid="checkout-btn"]');
			await btn.click();

			await expect(page.getByText("Thanh toán thành công!", { exact: false })).toBeVisible({ timeout: 10000 });
			await expect(page).toHaveURL(/\/orders\/201/);
		});

		test("Poll → CANCELLED → error overlay", async ({ page }) => {
			await page.route("**/api/orders", async (route) => {
				if (route.request().method() === "POST") {
					return route.fulfill({ json: { data: { orderId: 201, totalAmount: 50000 } } });
				}
				return route.continue();
			});
			await page.route("**/api/payments/initiate?gateway=sepay", async (route) => route.fulfill({ json: { data: { paymentUrl: "https://qr.sepay.vn/img?fake", isRedirect: false } } }));
			await page.route("**/api/orders/201", async (route) => {
				return route.fulfill({ json: { data: { paymentStatus: "FAILED", status: "CANCELLED" } } });
			});
			
			const btn = page.locator('[data-testid="checkout-btn"]');
			await btn.click();

			await expect(page.locator('[data-testid="qr-expired-overlay"]')).toBeVisible();
			await expect(page.getByText("Giao dịch đã bị huỷ")).toBeVisible();
		});

		test("POST /orders 409 → toast", async ({ page }) => {
			await page.route("**/api/orders", async (route) => {
				if (route.request().method() === "POST") {
					return route.fulfill({ status: 409, json: { message: "Conflict" } });
				}
				return route.continue();
			});
			
			const btn = page.locator('[data-testid="checkout-btn"]');
			await btn.click();

			await expect(page.getByText("Pack đã hết hàng")).toBeVisible();
		});

		test("POST /orders 503 → toast", async ({ page }) => {
			await page.route("**/api/orders", async (route) => {
				if (route.request().method() === "POST") {
					return route.fulfill({ status: 503, json: { message: "Service Unavailable" } });
				}
				return route.continue();
			});
			
			const btn = page.locator('[data-testid="checkout-btn"]');
			await btn.click();

			await expect(page.getByText("Hệ thống tạm gián đoạn")).toBeVisible();
		});
	});
});
