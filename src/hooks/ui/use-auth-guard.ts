"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredAccessToken, getStoredUserId } from "@/lib/api-config";

export type AuthGuardMode = "guest-only" | "authenticated-only";

export function useAuthGuard(mode: AuthGuardMode, redirectTo: string) {
	const router = useRouter();
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		const token = getStoredAccessToken();
		const userId = getStoredUserId();
		const isAuthenticated = Boolean(token) && Boolean(userId);

		if (mode === "guest-only" && isAuthenticated) {
			router.replace(redirectTo);
			setChecking(false);
			return;
		}

		if (mode === "authenticated-only" && !isAuthenticated) {
			router.replace(redirectTo);
			setChecking(false);
			return;
		}

		setChecking(false);
	}, [mode, redirectTo, router]);

	return { checking };
}
