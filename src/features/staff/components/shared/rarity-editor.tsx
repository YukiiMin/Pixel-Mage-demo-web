"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { RarityRates } from "@/features/staff/types/pack-category";

// ─── Default config ────────────────────────────────────────────────────────
export const DEFAULT_RARITY_RATES: RarityRates = {
	COMMON: 60,
	RARE: 30,
	LEGENDARY: 10,
};

const RARITY_BADGE_CLS: Record<string, string> = {
	LEGENDARY:
		"bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 w-24 justify-center text-xs",
	RARE: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30 w-24 justify-center text-xs",
	COMMON: "bg-gray-500/10 text-gray-400 border-gray-500/30 w-24 justify-center text-xs",
};

interface RarityEditorProps {
	value: RarityRates;
	onChange: (rates: RarityRates) => void;
	disabled?: boolean;
}

/**
 * RarityEditor — editable form for gacha rarity percentages.
 * Total must equal 100%.
 */
export function RarityEditor({ value, onChange, disabled }: RarityEditorProps) {
	const total = Object.values(value).reduce((acc, v) => (acc ?? 0) + (v ?? 0), 0);
	const isValid = total === 100;

	return (
		<div className="space-y-3">
			{Object.entries(value).map(([rarity, rate]) => (
				<div key={rarity} className="flex items-center gap-3">
					<Badge className={RARITY_BADGE_CLS[rarity] ?? "w-24 justify-center text-xs"}>
						{rarity}
					</Badge>
					<Input
						type="number"
						min="0"
						max="100"
						value={rate ?? 0}
						disabled={disabled}
						className="w-24"
						onChange={(e) =>
							onChange({ ...value, [rarity]: parseInt(e.target.value) || 0 })
						}
					/>
					<span className="text-muted-foreground text-sm">%</span>
				</div>
			))}
			<p className={`text-sm font-medium ${isValid ? "text-green-400" : "text-red-400"}`}>
				Tổng: {total}% {isValid ? "✓" : "— cần đủ 100%"}
			</p>
		</div>
	);
}

// ─── Helper functions for form management ─────────────────────────────────────
export function parseRarityRates(json: string): RarityRates {
	try {
		return JSON.parse(json) as RarityRates;
	} catch {
		return { ...DEFAULT_RARITY_RATES };
	}
}

export function stringifyRarityRates(rates: RarityRates): string {
	return JSON.stringify(rates);
}
