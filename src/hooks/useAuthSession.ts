"use client";

import { useSyncExternalStore } from "react";
import {
	getAccessToken,
	getSessionAccount,
	subscribeToSessionChange,
} from "@/lib/auth/session";

function getSnapshot() {
	const token = getAccessToken();
	const account = getSessionAccount();

	return {
		token,
		account,
		isAuthenticated: Boolean(token),
	};
}

function getServerSnapshot() {
	return {
		token: null,
		account: null,
		isAuthenticated: false,
	};
}

export function useAuthSession() {
	return useSyncExternalStore(
		subscribeToSessionChange,
		getSnapshot,
		getServerSnapshot,
	);
}
