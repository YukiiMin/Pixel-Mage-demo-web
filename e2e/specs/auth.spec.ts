import { expect, test } from "@playwright/test";

test("unauthenticated → protected route → redirect /login", async ({
	page,
}) => {
	// Không có cookie → vào /my-cards → bị redirect /login
	await page.goto("/my-cards");
	await expect(page).toHaveURL("/login");
});
