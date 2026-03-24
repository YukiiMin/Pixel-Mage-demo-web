import { expect, type Locator, type Page } from "@playwright/test";

export class TarotSetupPage {
	readonly page: Page;
	readonly stepButtons: Locator;
	readonly nextButton: Locator;
	readonly startButton: Locator;
	readonly backButton: Locator;
	readonly topicButtons: Locator;
	readonly questionInput: Locator;
	readonly spreadButtons: Locator;
	readonly guestBanner: Locator;
	readonly guestBannerBuyButton: Locator;
	readonly activeSessionBanner: Locator;
	readonly activeSessionContinueButton: Locator;
	readonly errorNote: Locator;

	constructor(page: Page) {
		this.page = page;

		// Setup common locators based on the text/ui elements
		this.stepButtons = page
			.locator("button.rounded-full")
			.filter({ hasText: /^[123]$/ });
		this.nextButton = page.getByRole("button", { name: "Tiếp Theo" });
		this.startButton = page.getByRole("button", { name: "Bắt Đầu Đọc Bài" });
		this.backButton = page.getByRole("button", { name: "Quay Lại" });

		// Step 0: Topics
		this.topicButtons = page
			.locator("button.glass-card")
			.filter({ hasText: /^(Tình Yêu|Sự Nghiệp|Tổng Quát|Tài Chính)$/ });

		// Step 1: Question
		this.questionInput = page.getByPlaceholder(
			"Ví dụ: Mối quan hệ hiện tại của tôi sẽ đi về đâu?",
		);

		// Step 2: Spreads
		this.spreadButtons = page
			.locator("button.glass-card")
			.filter({ has: page.locator("span.bg-primary\\/10") });

		// Banners
		this.guestBanner = page.locator("div.border-destructive\\/50");
		this.guestBannerBuyButton = this.guestBanner.getByRole("button", {
			name: "Mua Pack ngay",
		});

		this.activeSessionBanner = page.locator("div.border-primary\\/50");
		this.activeSessionContinueButton = this.activeSessionBanner.getByRole(
			"button",
			{ name: "Tiếp tục" },
		);

		this.errorNote = page.getByText("Tarot là công cụ suy ngẫm");
	}

	async goto() {
		await this.page.goto("/tarot");
		// Wait for page load
		await expect(this.page.getByText(/Bạn muốn hỏi về/)).toBeVisible({ timeout: 10000 });
	}

	async selectTopic(name: string) {
		await this.page
			.getByRole("button", { name: new RegExp(name, "i") })
			.click();
	}

	async enterQuestion(question: string) {
		await expect(this.questionInput).toBeVisible({ timeout: 5000 });
		await this.questionInput.fill(question);
	}

	async selectSpread(name: string) {
		// Wait for skeletons to disappear, might take a bit since it's fetching
		await expect(this.page.locator(".animate-pulse")).toHaveCount(0, {
			timeout: 10000,
		});
		const btn = this.page.getByRole("button", { name: new RegExp(name, "i") });
		await btn.click();
		await expect(btn).toHaveClass(/ring-2/);
	}

	async clickNext() {
		await this.nextButton.click();
	}

	async clickStart() {
		await this.startButton.click();
	}
}
