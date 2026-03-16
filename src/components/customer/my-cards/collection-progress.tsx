"use client";

import type { CollectionProgressItem } from "@/types/commerce";

interface CollectionProgressProps {
	progress: CollectionProgressItem[];
}

export function CollectionProgress({ progress }: CollectionProgressProps) {
	if (progress.length === 0) {
		return null;
	}

	return (
		<section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
			{progress.map((item) => (
				<div
					key={item.collectionId}
					className="glass-card rounded-2xl border border-border/50 p-4"
				>
					<p className="text-sm font-semibold text-foreground">
						{item.collectionName}
					</p>
					<div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-primary"
							style={{
								width: `${Math.max(0, Math.min(100, item.completionRate))}%`,
							}}
						/>
					</div>
					<p className="mt-2 text-xs text-muted-foreground">
						{item.completedItems}/{item.totalItems} thẻ • {item.completionRate}%
					</p>
				</div>
			))}
		</section>
	);
}
