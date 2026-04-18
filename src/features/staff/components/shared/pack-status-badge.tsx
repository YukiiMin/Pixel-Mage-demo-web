"use client";

import { Badge } from "@/components/ui/badge";
import { Box, CheckCircle2, Clock, PackageOpen, ShoppingCart, Smartphone } from "lucide-react";
import type { PackStatus, Rarity } from "@/types/commerce";

// ─── Pack Status ──────────────────────────────────────────────────────────────
export const PACK_STATUS_CONFIG = {
	STOCKED: {
		label: "Trong kho",
		cls: "bg-blue-500/10 text-blue-400 border-blue-500/25",
		icon: <Box className="h-3 w-3 mr-1 inline" />,
	},
	RESERVED: {
		label: "Đã đặt",
		cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
		icon: <Clock className="h-3 w-3 mr-1 inline" />,
	},
	SOLD: {
		label: "Đã bán",
		cls: "bg-green-500/10 text-green-400 border-green-500/25",
		icon: <CheckCircle2 className="h-3 w-3 mr-1 inline" />,
	},
} as const;

export function PackStatusBadge({ status }: { status: PackStatus | string }) {
	const cfg = PACK_STATUS_CONFIG[status as PackStatus] ?? {
		label: status,
		cls: "bg-muted/40 text-muted-foreground",
		icon: null,
	};
	return (
		<Badge className={cfg.cls}>
			{cfg.icon}
			{cfg.label}
		</Badge>
	);
}

// ─── Card Status ──────────────────────────────────────────────────────────────
export const CARD_STATUS_CONFIG = {
	READY: {
		label: "Sẵn sàng",
		cls: "bg-blue-500/10 text-blue-400 border-blue-500/25",
		icon: <PackageOpen className="h-3 w-3 mr-1 inline" />,
	},
	SOLD: {
		label: "Đã bán",
		cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
		icon: <ShoppingCart className="h-3 w-3 mr-1 inline" />,
	},
	LINKED: {
		label: "Đã liên kết",
		cls: "bg-green-500/10 text-green-400 border-green-500/25",
		icon: <Smartphone className="h-3 w-3 mr-1 inline" />,
	},
	DEACTIVATED: {
		label: "Vô hiệu",
		cls: "bg-red-500/10 text-red-400 border-red-500/25",
		icon: null,
	},
	PENDING_BIND: {
		label: "Chờ liên kết",
		cls: "bg-gray-500/10 text-gray-400 border-gray-500/25",
		icon: null,
	},
} as const;

type CardStatus = keyof typeof CARD_STATUS_CONFIG;

export function CardStatusBadge({ status }: { status: CardStatus | string }) {
	const cfg = CARD_STATUS_CONFIG[status as CardStatus] ?? {
		label: status,
		cls: "bg-muted/40 text-muted-foreground",
		icon: null,
	};
	return (
		<Badge className={cfg.cls}>
			{cfg.icon}
			{cfg.label}
		</Badge>
	);
}

// ─── Rarity ───────────────────────────────────────────────────────────────────
export const RARITY_CONFIG = {
	LEGENDARY: {
		cls: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30",
		short: "L",
	},
	RARE: {
		cls: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30",
		short: "R",
	},
	COMMON: {
		cls: "bg-gray-500/10 text-gray-400 border-gray-500/30",
		short: "C",
	},
} as const;

export function RarityBadge({ rarity, short = false }: { rarity: Rarity | string; short?: boolean }) {
	const cfg = RARITY_CONFIG[rarity as Rarity] ?? {
		cls: "bg-muted/40 text-muted-foreground border-border/25",
		short: rarity[0],
	};
	return (
		<Badge className={cfg.cls}>
			{short ? cfg.short : rarity}
		</Badge>
	);
}

export function getPackStatusClass(status: string): string {
	return PACK_STATUS_CONFIG[status as PackStatus]?.cls ?? "bg-muted/40 text-muted-foreground";
}

export function getRarityClass(rarity: string): string {
	return RARITY_CONFIG[rarity as Rarity]?.cls ?? "bg-muted/40 text-muted-foreground";
}
