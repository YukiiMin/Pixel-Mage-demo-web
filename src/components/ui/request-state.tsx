import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestStateProps {
	title: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
	variant?: "loading" | "error" | "empty";
}

export function RequestState({
	title,
	description,
	actionLabel,
	onAction,
	variant = "empty",
}: RequestStateProps) {
	if (variant === "loading") {
		return (
			<div className="glass-card rounded-xl p-8 text-center">
				<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>{title}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="glass-card rounded-xl p-8 text-center">
			{variant === "error" ? (
				<AlertCircle className="mx-auto h-6 w-6 text-destructive" />
			) : null}
			<p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
			{description ? (
				<p className="mt-2 text-xs text-muted-foreground">{description}</p>
			) : null}
			{actionLabel && onAction ? (
				<Button size="sm" className="mt-4" onClick={onAction}>
					{actionLabel}
				</Button>
			) : null}
		</div>
	);
}
