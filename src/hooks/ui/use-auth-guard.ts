"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthSession, hasStoredAuthSession } from "@/lib/api-config";

export type AuthGuardMode = "guest-only" | "authenticated-only";

export function useAuthGuard(mode: AuthGuardMode, redirectTo: string) {
	const router = useRouter();
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		let active = true;

		const check = async () => {
			const quickAuth = hasStoredAuthSession();
			const session = await getAuthSession({ syncStorage: true });
			const isAuthenticated = quickAuth || Boolean(session?.authenticated);

			if (!active) {
				return;
			}

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
		};

		void check();

		return () => {
			active = false;
		};
	}, [mode, redirectTo, router]);

	return { checking };
}
