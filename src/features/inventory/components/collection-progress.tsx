"use client";

import { CheckCircle2 } from "lucide-react";
import type { CollectionProgressItem } from "@/types/commerce";

interface CollectionProgressProps {
	progress: CollectionProgressItem[];
}

export function CollectionProgress({ progress }: CollectionProgressProps) {
	if (progress.length === 0) {
		return null;
	}

	return (
		<aside
			data-testid="collection-progress"
			className="glass-card mb-6 rounded-2xl border border-border/40 p-5"
		>
			<h2 className="mb-4 text-lg font-semibold text-foreground">
				Collection Progress
			</h2>
			<div className="flex flex-col gap-4">
				{progress.map((item) => {
					const isCompleted =
						item.completedItems > 0 && item.completedItems >= item.totalItems;

					return (
						<div key={item.collectionId} className="flex flex-col">
							<div className="mb-1.5 flex items-start justify-between gap-2">
								<p
									className={`text-sm font-medium font-heading ${isCompleted ? "text-primary" : "text-foreground"}`}
								>
									{isCompleted && (
										<CheckCircle2 className="mr-1.5 inline h-4 w-4 align-text-bottom" />
									)}
									{item.collectionName}
								</p>
								<span className="text-xs font-medium font-stats text-muted-foreground whitespace-nowrap">
									{Math.round(item.completionRate)}%
								</span>
							</div>

							<div
								role="progressbar"
								aria-valuenow={Math.round(item.completionRate)}
								aria-valuemin={0}
								aria-valuemax={100}
								data-testid={`progress-bar-${item.collectionId}`}
								className="h-2 w-full overflow-hidden rounded-full bg-muted/60"
							>
								<div
									className={`h-full rounded-full transition-all duration-500 ease-out ${isCompleted ? "bg-primary glow-gold" : "bg-primary"}`}
									style={{
										width: `${Math.max(0, Math.min(100, item.completionRate))}%`,
									}}
								/>
							</div>

							<p className="mt-1.5 text-xs font-stats text-muted-foreground">
								{item.completedItems}/{item.totalItems} thẻ
							</p>
						</div>
					);
				})}
			</div>
		</aside>
	);
}
