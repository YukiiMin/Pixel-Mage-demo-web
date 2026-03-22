"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAuthSession, hasStoredAuthSession } from "@/lib/api-config";

export type AuthGuardMode = "guest-only" | "authenticated-only";

export function useAuthGuard(mode: AuthGuardMode, redirectTo: string) {
	const router = useRouter();
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		let active = true;

		const check = async () => {
			const quickCheck = document.cookie.includes("pm_logged_in=1");
			console.log(`[AuthGuard] Mode: ${mode}, RedirectTo: ${redirectTo}, QuickCheck: ${quickCheck}`);

			try {
				// 1. Unauthenticated case (fast check)
				if (mode === "authenticated-only" && !quickCheck) {
					console.log("[AuthGuard] Fast check failed for authenticated-only route.");
					if (active) {
						setChecking(false);
						router.replace(redirectTo);
					}
					return;
				}

				// 2. Full session check
				console.log("[AuthGuard] Performing getAuthSession...");
				const session = await getAuthSession({ syncStorage: true });
				const isAuthenticated = Boolean(session?.authenticated);
				console.log("[AuthGuard] IsAuthenticated:", isAuthenticated);

				if (!active) {
					console.log("[AuthGuard] Check completed but old effect is no longer active.");
					return;
				}

				if (mode === "guest-only" && isAuthenticated) {
					console.log("[AuthGuard] User is authenticated on guest-only route. Redirecting...");
					router.replace(redirectTo);
					return;
				}

				if (mode === "authenticated-only" && !isAuthenticated) {
					console.log("[AuthGuard] User is not authenticated on protected route. Redirecting...");
					router.replace(redirectTo);
					return;
				}

				console.log("[AuthGuard] Check complete. Permitted.");
			} catch (error) {
				console.error("[AuthGuard] Error during check:", error);
			} finally {
				// ALWAYS clear loading state if this is the active effect instance
				if (active) {
					console.log("[AuthGuard] Setting checking to false.");
					setChecking(false);
				}
			}
		};

		check();

		return () => {
			active = false;
		};
	}, [mode, redirectTo, router]);

	return { checking };
}
