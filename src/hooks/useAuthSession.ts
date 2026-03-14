"use client";

import { useSyncExternalStore } from "react";
import {
	getAccessToken,
	getSessionAccount,
	subscribeToSessionChange,
} from "@/lib/auth/session";

type AuthSessionSnapshot = {
	token: string | null;
	account: ReturnType<typeof getSessionAccount>;
	isAuthenticated: boolean;
};

const SERVER_SNAPSHOT: AuthSessionSnapshot = {
	token: null,
	account: null,
	isAuthenticated: false,
};

let currentSnapshot: AuthSessionSnapshot = SERVER_SNAPSHOT;

function getSnapshot() {
	const token = getAccessToken();
	const account = getSessionAccount();
	const nextSnapshot: AuthSessionSnapshot = {
		token,
		account,
		isAuthenticated: Boolean(token),
	};

	if (
		currentSnapshot.token === nextSnapshot.token &&
		JSON.stringify(currentSnapshot.account) === JSON.stringify(nextSnapshot.account)
	) {
		return currentSnapshot;
	}

	currentSnapshot = nextSnapshot;
	return currentSnapshot;
}

function getServerSnapshot() {
	return SERVER_SNAPSHOT;
}

export function useAuthSession() {
	return useSyncExternalStore(
		subscribeToSessionChange,
		getSnapshot,
		getServerSnapshot,
	);
}
