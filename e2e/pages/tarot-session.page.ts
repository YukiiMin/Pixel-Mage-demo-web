import { type Locator, type Page } from "@playwright/test";

export class TarotSessionPage {
	readonly page: Page;

	get spinner() { return this.page.getByTestId("spinner"); }
	get interpretPanel() { return this.page.getByTestId("interpret-panel"); }
	get retryButton() { return this.page.getByTestId("retry-button"); }
	get backToTarotButton() { return this.page.getByTestId("back-to-tarot-button"); }
	get expiredSession() { return this.page.getByTestId("expired-session"); }
	get completionPhase() { return this.page.getByTestId("completion-phase"); }
	get cardDrawArea() { return this.page.getByTestId("card-draw-area"); }
	get confirmDrawButton() { return this.page.getByTestId("confirm-draw-button"); }
	get cardReveal() { return this.page.getByTestId("card-reveal"); }
	get historyPanel() { return this.page.getByTestId("reading-history-unique-v1").first(); }
	get shareButton() { return this.page.getByTestId("share-button"); }
	get readAgainButton() { return this.page.getByTestId("read-again-button"); }

	constructor(page: Page) {
		this.page = page;
	}

	async goto(sessionId: number) {
		await this.page.goto(`/tarot/session/${sessionId}`);
	}
}
