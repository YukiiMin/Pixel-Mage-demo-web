"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RequestState } from "@/components/ui/request-state";
import { useAuthSession } from "@/hooks/useAuthSession";

export function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const authSession = useAuthSession();

	useEffect(() => {
		if (!authSession.isAuthenticated) {
			const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
			router.replace(`/login${redirect}`);
		}
	}, [authSession.isAuthenticated, pathname, router]);

	if (!authSession.isAuthenticated) {
		return (
			<div className="mx-auto max-w-xl px-4 py-20">
				<RequestState
					variant="loading"
					title="Checking your session..."
				/>
			</div>
		);
	}

	return <>{children}</>;
}
