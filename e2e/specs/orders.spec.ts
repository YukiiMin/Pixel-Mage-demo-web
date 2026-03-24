import { test, expect } from "@playwright/test";

test.describe("Orders Feature", () => {
	test.beforeEach(async ({ context }) => {
		await context.addInitScript(() => {
			window.sessionStorage.setItem("userId", "1");
			document.cookie = "pm_logged_in=1; path=/";
		});
	});

	test("Skeleton loading", async ({ page }) => {
		await page.route("**/api/orders/customer/*", async (route) => {
			await new Promise((r) => setTimeout(r, 1000));
			await route.fulfill({ json: { data: [] } });
		});

		await page.goto("/orders");
		await expect(page.locator('[data-testid="card-skeleton"]').first()).toBeVisible();
	});

	test("Empty state", async ({ page }) => {
		await page.route("**/api/orders/customer/*", async (route) => {
			await route.fulfill({ json: { data: [] } });
		});

		await page.goto("/orders");
		await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
	});

	test("Order list render", async ({ page }) => {
		await page.route("**/api/orders/customer/*", async (route) => {
			await route.fulfill({
				json: {
					data: [
						{ orderId: 101, status: "COMPLETED", paymentStatus: "PAID", totalAmount: 50000, createdAt: new Date().toISOString() },
						{ orderId: 102, status: "CANCELLED", paymentStatus: "FAILED", totalAmount: 20000, createdAt: new Date().toISOString() },
					],
				},
			});
		});

		await page.goto("/orders");
		await expect(page.locator('[data-testid="order-card-101"]')).toBeVisible();
		await expect(page.locator('[data-testid="order-card-102"]')).toBeVisible();
	});

	test("Status badge màu COMPLETED", async ({ page }) => {
		await page.route("**/api/orders/customer/*", async (route) => {
			await route.fulfill({
				json: {
					data: [{ orderId: 101, status: "COMPLETED", paymentStatus: "PAID", totalAmount: 50000, createdAt: new Date().toISOString() }],
				},
			});
		});

		await page.goto("/orders");
		await expect(page.locator('[data-testid="order-status-101"]')).toHaveText("COMPLETED");
		await expect(page.locator('[data-testid="order-status-101"]')).toHaveClass(/text-green-500/);
	});

	test("Status badge màu CANCELLED", async ({ page }) => {
		await page.route("**/api/orders/customer/*", async (route) => {
			await route.fulfill({
				json: {
					data: [{ orderId: 102, status: "CANCELLED", paymentStatus: "FAILED", totalAmount: 20000, createdAt: new Date().toISOString() }],
				},
			});
		});

		await page.goto("/orders");
		await expect(page.locator('[data-testid="order-status-102"]')).toHaveText("CANCELLED");
		await expect(page.locator('[data-testid="order-status-102"]')).toHaveClass(/text-destructive/);
	});

	test("Cancel PENDING order", async ({ page }) => {
		await page.route("**/api/orders/103", async (route) => {
			await route.fulfill({
				json: {
					data: { orderId: 103, status: "PENDING", paymentStatus: "PENDING", totalAmount: 20000, createdAt: new Date().toISOString(), orderItems: [] },
				},
			});
		});

		await page.goto("/orders/103");
		await expect(page.locator('[data-testid="cancel-order-btn"]')).toBeVisible();
		await page.locator('[data-testid="cancel-order-btn"]').click();
		await expect(page.locator('[data-testid="cancel-confirm-dialog"]')).toBeVisible();
	});

	test("Cancel confirm → success", async ({ page }) => {
		await page.route("**/api/orders/103", async (route) => {
			await route.fulfill({
				json: {
					data: { orderId: 103, status: "PENDING", paymentStatus: "PENDING", totalAmount: 20000, createdAt: new Date().toISOString(), orderItems: [] },
				},
			});
		});
		await page.route("**/api/orders/103/cancel", async (route) => {
			await route.fulfill({ status: 200, json: { data: {} } });
		});

		await page.goto("/orders/103");
		await page.locator('[data-testid="cancel-order-btn"]').click();
		await page.getByRole("button", { name: "Đồng ý huỷ" }).click();

		await expect(page.getByText("Đã huỷ đơn hàng thành công")).toBeVisible();
	});

	test("Cancel API error 503", async ({ page }) => {
		await page.route("**/api/orders/103", async (route) => {
			await route.fulfill({
				json: {
					data: { orderId: 103, status: "PENDING", paymentStatus: "PENDING", totalAmount: 20000, createdAt: new Date().toISOString(), orderItems: [] },
				},
			});
		});
		await page.route("**/api/orders/103/cancel", async (route) => {
			await route.fulfill({ status: 503, json: { message: "Service Unavailable" } });
		});

		await page.goto("/orders/103");
		await page.locator('[data-testid="cancel-order-btn"]').click();
		await page.getByRole("button", { name: "Đồng ý huỷ" }).click();

		await expect(page.getByText("API request failed with status 503")).toBeVisible();
	});

	test("Order detail render", async ({ page }) => {
		await page.route("**/api/orders/104", async (route) => {
			await route.fulfill({
				json: {
					data: { 
						orderId: 104, 
						status: "COMPLETED", 
						paymentStatus: "PAID", 
						totalAmount: 50000, 
						createdAt: new Date().toISOString(),
						orderItems: [{ id: 1, pack: { packId: 10, name: "Pack #10" }, quantity: 2, unitPrice: 25000 }]
					},
				},
			});
		});

		await page.goto("/orders/104");
		await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();
		await expect(page.getByText("Sản phẩm đặt mua")).toBeVisible();
		await expect(page.getByText("Pack #10")).toBeVisible();
	});
});
