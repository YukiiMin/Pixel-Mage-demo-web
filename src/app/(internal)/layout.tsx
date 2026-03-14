import type { ReactNode } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function InternalLayout({ children }: { children: ReactNode }) {
	return (
		<AuthGuard>
			<div className="min-h-screen bg-background text-foreground">
				<div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_minmax(0,1fr)] md:px-6">
					<aside className="rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur">
						<p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
							Internal
						</p>
						<nav className="space-y-2 text-sm">
							<Link
								href="/admin/accounts"
								className="block rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
							>
								Accounts
							</Link>
							<Link
								href="/admin/roles"
								className="block rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
							>
								Roles
							</Link>
						</nav>
					</aside>

					<div>{children}</div>
				</div>
			</div>
		</AuthGuard>
	);
}
