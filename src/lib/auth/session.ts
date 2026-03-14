const ACCESS_TOKEN_KEY = "pixelmage.accessToken";
const ACCOUNT_KEY = "pixelmage.account";
const SESSION_EVENT = "pixelmage:session-change";

const isBrowser = () => typeof window !== "undefined";

type SessionAccount = {
	id: number;
	email: string;
	name: string;
	phoneNumber: string | null;
	roleId: number | null;
	provider: string | null;
};

function emitSessionChange() {
	if (!isBrowser()) return;
	window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getAccessToken(): string | null {
	if (!isBrowser()) return null;
	return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
	if (!isBrowser()) return;
	window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
	emitSessionChange();
}

export function clearAccessToken(): void {
	if (!isBrowser()) return;
	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
	emitSessionChange();
}

export function hasAccessToken(): boolean {
	return Boolean(getAccessToken());
}

export function getSessionAccount(): SessionAccount | null {
	if (!isBrowser()) return null;

	const rawValue = window.localStorage.getItem(ACCOUNT_KEY);
	if (!rawValue) return null;

	try {
		return JSON.parse(rawValue) as SessionAccount;
	} catch {
		window.localStorage.removeItem(ACCOUNT_KEY);
		return null;
	}
}

export function setSessionAccount(account: SessionAccount | null): void {
	if (!isBrowser()) return;

	if (account) {
		window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
	} else {
		window.localStorage.removeItem(ACCOUNT_KEY);
	}

	emitSessionChange();
}

export function setSession(token: string, account: SessionAccount | null = null) {
	if (!isBrowser()) return;
	window.localStorage.setItem(ACCESS_TOKEN_KEY, token);

	if (account) {
		window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
	} else {
		window.localStorage.removeItem(ACCOUNT_KEY);
	}

	emitSessionChange();
}

export function clearSession(): void {
	if (!isBrowser()) return;
	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
	window.localStorage.removeItem(ACCOUNT_KEY);
	emitSessionChange();
}

export function subscribeToSessionChange(callback: () => void): () => void {
	if (!isBrowser()) return () => undefined;

	const onStorage = (event: StorageEvent) => {
		if (event.key === ACCESS_TOKEN_KEY || event.key === ACCOUNT_KEY) {
			callback();
		}
	};

	window.addEventListener(SESSION_EVENT, callback);
	window.addEventListener("storage", onStorage);

	return () => {
		window.removeEventListener(SESSION_EVENT, callback);
		window.removeEventListener("storage", onStorage);
	};
}
