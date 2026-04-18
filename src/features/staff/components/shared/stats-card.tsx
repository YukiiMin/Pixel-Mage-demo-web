import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface SimpleStatCardProps {
	label: string;
	value: number | string;
	icon: LucideIcon;
	iconColor?: string;
	iconBgColor?: string;
	valueColor?: string;
}

/**
 * SimpleStatCard — compact metric display card used throughout the admin dashboard.
 *
 * @example
 * <SimpleStatCard label="Trong kho" value={17} icon={Box} iconColor="text-blue-400" iconBgColor="bg-blue-500/10" valueColor="text-blue-400" />
 */
export function SimpleStatCard({
	label,
	value,
	icon: Icon,
	iconColor = "text-muted-foreground",
	iconBgColor = "bg-card/40",
	valueColor = "text-foreground",
}: SimpleStatCardProps) {
	return (
		<Card className="glass-card">
			<CardContent className="p-4 flex items-center gap-3">
				<div className={`p-2 rounded-lg ${iconBgColor}`}>
					<Icon className={`h-5 w-5 ${iconColor}`} />
				</div>
				<div>
					<p className="text-sm text-muted-foreground">{label}</p>
					<p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}
