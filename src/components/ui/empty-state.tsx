import type { LucideIcon } from "lucide-react";
import { PackageSearch } from "lucide-react";

interface EmptyStateProps {
	icon?: LucideIcon;
	title?: string;
	description?: string;
	action?: React.ReactNode;
}

export function EmptyState({
	icon: Icon = PackageSearch,
	title = "Chưa có dữ liệu",
	description = "Khi dữ liệu có sẵn, nó sẽ xuất hiện tại đây.",
	action,
}: EmptyStateProps) {
	return (
		<div className="glass-card flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/50 px-8 py-14 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/40 bg-muted/30">
				<Icon className="h-7 w-7 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<p className="text-base font-semibold text-foreground">{title}</p>
				<p className="max-w-xs text-sm text-muted-foreground">{description}</p>
			</div>
			{action && <div className="pt-1">{action}</div>}
		</div>
	);
}
