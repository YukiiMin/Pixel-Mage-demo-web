import type {
	CardContentRequestDTO,
	CardTemplateRequestDTO,
} from "@/features/staff/types/catalog";

export const PAGE_SIZE = 12;

export const RARITY_COLOR: Record<string, string> = {
	COMMON: "bg-slate-500/15 text-slate-400 border-slate-500/25",
	RARE: "bg-blue-500/15 text-blue-400 border-blue-500/25",
	LEGENDARY: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export function normalizeRarity(
	value: unknown,
): CardTemplateRequestDTO["rarity"] {
	return value === "COMMON" || value === "RARE" || value === "LEGENDARY"
		? value
		: "COMMON";
}

export function normalizeArcanaType(
	value: unknown,
): CardTemplateRequestDTO["arcanaType"] {
	return value === "MAJOR" || value === "MINOR" ? value : "MINOR";
}

export function normalizeSuit(value: unknown): CardTemplateRequestDTO["suit"] {
	return value === "WANDS" ||
		value === "CUPS" ||
		value === "SWORDS" ||
		value === "PENTACLES"
		? value
		: "WANDS";
}

export function normalizeContentType(
	value: unknown,
): CardContentRequestDTO["contentType"] {
	return value === "STORY" ||
		value === "IMAGE" ||
		value === "VIDEO" ||
		value === "GIF" ||
		value === "LINK"
		? value
		: "STORY";
}
