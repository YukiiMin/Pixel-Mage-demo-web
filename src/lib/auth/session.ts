const ACCESS_TOKEN_KEY = "pixelmage.accessToken";

const isBrowser = () => typeof window !== "undefined";

export function getAccessToken(): string | null {
	if (!isBrowser()) return null;
	return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
	if (!isBrowser()) return;
	window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
	if (!isBrowser()) return;
	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function hasAccessToken(): boolean {
	return Boolean(getAccessToken());
}
