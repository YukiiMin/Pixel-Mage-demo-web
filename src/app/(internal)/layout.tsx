import type { ReactNode } from "react";

export default function InternalLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</div>
		</div>
	);
}
