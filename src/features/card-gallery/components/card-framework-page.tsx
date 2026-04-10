"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnhancedCardDetailModal } from "@/features/card-gallery/components/enhanced-card-detail-modal";
import {
	getCardContentsByTemplateId,
	getCardFrameworks,
	getCardTemplatesByFramework,
} from "@/features/card-gallery/lib/card-gallery";
import type {
	CardContent,
	CardFramework,
	CardGalleryFilters,
	CardTemplateWithContent,
	Rarity,
} from "@/features/card-gallery/types";
import { getApiErrorMessage } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import {
	AnimatePresence,
	motion,
	type TargetAndTransition,
} from "framer-motion";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Eye,
	Heart,
	Search,
	Sparkles,
	Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const PAGE_SIZE = 20;

const RARITY_TABS: { label: string; value: Rarity | "ALL" }[] = [
	{ label: "TẤT CẢ", value: "ALL" },
	{ label: "COMMON", value: "COMMON" },
	{ label: "RARE", value: "RARE" },
	{ label: "LEGENDARY", value: "LEGENDARY" },
];

// ─────────────────────────────────────────────
// Rarity-specific config (card hover & badge styles)
// ─────────────────────────────────────────────
const RARITY_CONFIG: Record<
	string,
	{
		badge: string;
		cardBorder: string;
		cardBg: string;
		shimmer: string;
		hoverBorder: string;
	}
> = {
	LEGENDARY: {
		badge: "bg-yellow-500/25 text-yellow-300 border border-yellow-400/60",
		cardBorder: "border-yellow-500/40",
		cardBg: "bg-gradient-to-b from-[#1e1810] via-[#1a1520] to-[#0f0d1e]",
		shimmer: "legendary-shimmer",
		hoverBorder: "hover:border-yellow-400/80",
	},
	RARE: {
		badge: "bg-purple-500/25 text-purple-300 border border-purple-400/60",
		cardBorder: "border-purple-500/40",
		cardBg: "bg-gradient-to-b from-[#140e1e] via-[#120f1e] to-[#0f0d1e]",
		shimmer: "rare-shimmer",
		hoverBorder: "hover:border-purple-400/80",
	},
	COMMON: {
		badge: "bg-blue-500/20 text-blue-300 border border-blue-400/40",
		cardBorder: "border-blue-500/20",
		cardBg: "bg-gradient-to-b from-[#0d1220] via-[#0e1020] to-[#0f0d1e]",
		shimmer: "common-shimmer",
		hoverBorder: "hover:border-blue-400/60",
	},
};

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
function CardSkeleton() {
	return (
		<div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 animate-pulse">
			<div className="h-72 bg-white/10" />
			<div className="p-3 space-y-2">
				<div className="h-4 bg-white/10 rounded w-3/4" />
				<div className="h-3 bg-white/10 rounded w-1/2" />
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────
// Card Item — rarity-aware hover animations
// ─────────────────────────────────────────────
function CardItem({
	card,
	onClick,
}: {
	card: CardTemplateWithContent;
	onClick: () => void;
}) {
	const rarity = card.rarity ?? "COMMON";
	const cfg = RARITY_CONFIG[rarity] ?? RARITY_CONFIG.COMMON;

	// Per-rarity motion variants — typed as TargetAndTransition for Framer Motion
	const legendaryHover: TargetAndTransition = {
		y: -10,
		scale: 1.04,
		rotateY: 6,
		filter:
			"drop-shadow(0 0 8px rgba(250,204,21,0.6)) drop-shadow(0 0 24px rgba(250,204,21,0.35)) drop-shadow(0 0 48px rgba(250,204,21,0.15))",
		transition: { duration: 0.35, ease: "easeOut" },
	};
	const rareHover: TargetAndTransition = {
		y: -8,
		scale: 1.03,
		rotateY: 4,
		filter:
			"drop-shadow(0 0 12px rgba(168,85,247,0.6)) drop-shadow(0 0 32px rgba(168,85,247,0.25))",
		transition: { duration: 0.3, ease: "easeOut" },
	};
	const commonHover: TargetAndTransition = {
		y: -5,
		scale: 1.02,
		filter: "drop-shadow(0 0 8px rgba(59,130,246,0.4))",
		transition: { duration: 0.25, ease: "easeOut" },
	};

	const whileHoverVariant: TargetAndTransition =
		rarity === "LEGENDARY"
			? legendaryHover
			: rarity === "RARE"
				? rareHover
				: commonHover;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.25 }}
			whileHover={whileHoverVariant}
			onClick={onClick}
			className="cursor-pointer group"
			style={{ perspective: 800 }}
		>
			{/* Card wrapper */}
			<div
				className={`
          relative rounded-2xl overflow-hidden
          border-2 ${cfg.cardBorder} ${cfg.hoverBorder}
          ${cfg.cardBg}
          transition-all duration-300
          ${rarity === "LEGENDARY" ? "legendary-card-wrap" : ""}
        `}
			>
				{/* Image */}
				<div className="relative aspect-[2/3] overflow-hidden">
					{card.imagePath ? (
						<Image
							src={card.imagePath}
							alt={card.name}
							fill
							sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
							className="object-cover transition-transform duration-500 group-hover:scale-110"
						/>
					) : (
						<div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-secondary/20">
							<Sparkles className="h-12 w-12 text-primary/30" />
						</div>
					)}

					{/* ── Rarity badge: BOTTOM-LEFT (không che logo PixelMage góc trên trái) ── */}
					<div className="absolute bottom-2 left-2">
						<span
							className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider backdrop-blur-sm ${cfg.badge}`}
						>
							{rarity}
						</span>
					</div>

					{/* Owned badge — top-right */}
					{card.isOwned && (
						<div className="absolute top-2 right-2">
							<span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/25 text-green-300 border border-green-400/50 backdrop-blur-sm">
								<Heart className="h-2.5 w-2.5 fill-green-400" />
								Sở hữu
							</span>
						</div>
					)}

					{/* Legendary rainbow shimmer overlay (only on hover) */}
					{rarity === "LEGENDARY" && (
						<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none legendary-rainbow-overlay" />
					)}

					{/* Rare purple shimmer */}
					{rarity === "RARE" && (
						<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rare-shimmer-overlay" />
					)}

					{/* Hover overlay — owner count */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
						<div className="flex items-center gap-2 text-white/80 text-xs">
							<Eye className="h-3.5 w-3.5" />
							<span>{card.ownerCount?.toLocaleString() ?? 0} người sở hữu</span>
						</div>
					</div>
				</div>

				{/* Card footer */}
				<div
					className={`px-3 py-2 ${
						rarity === "LEGENDARY"
							? "bg-linear-to-r from-yellow-950/60 via-black/40 to-yellow-950/60"
							: rarity === "RARE"
								? "bg-linear-to-r from-purple-950/60 via-black/40 to-purple-950/60"
								: "bg-black/30"
					}`}
				>
					<p
						className={`text-xs font-semibold line-clamp-1 transition-colors ${
							rarity === "LEGENDARY"
								? "text-yellow-200 group-hover:text-yellow-300"
								: rarity === "RARE"
									? "text-purple-200 group-hover:text-purple-300"
									: "text-white group-hover:text-blue-300"
						}`}
					>
						{card.name}
					</p>
					{card.cardCode && (
						<p className="text-[10px] text-white/40 mt-0.5">#{card.cardCode}</p>
					)}
				</div>
			</div>
		</motion.div>
	);
}

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────
function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	if (totalPages <= 1) return null;

	const pages: (number | "...")[] = [];
	if (totalPages <= 7) {
		for (let i = 0; i < totalPages; i++) pages.push(i);
	} else {
		pages.push(0);
		if (currentPage > 2) pages.push("...");
		for (
			let i = Math.max(1, currentPage - 1);
			i <= Math.min(totalPages - 2, currentPage + 1);
			i++
		) {
			pages.push(i);
		}
		if (currentPage < totalPages - 3) pages.push("...");
		pages.push(totalPages - 1);
	}

	return (
		<div className="flex items-center justify-center gap-1 mt-10">
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 0}
				className="p-2 rounded-lg border border-white/10 text-white/60 hover:border-amber-500/40 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
			>
				<ChevronLeft className="h-4 w-4" />
			</button>

			{pages.map((p, i) =>
				p === "..." ? (
					<span key={`dots-${i}`} className="px-3 py-2 text-white/30 text-sm">
						…
					</span>
				) : (
					<button
						key={p}
						onClick={() => onPageChange(p as number)}
						className={`
              min-w-9 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
              ${
								p === currentPage
									? "bg-amber-500 border-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]"
									: "border-white/10 text-white/60 hover:border-amber-500/40 hover:text-amber-400"
							}
            `}
					>
						{(p as number) + 1}
					</button>
				),
			)}

			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages - 1}
				className="p-2 rounded-lg border border-white/10 text-white/60 hover:border-amber-500/40 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
			>
				<ChevronRight className="h-4 w-4" />
			</button>
		</div>
	);
}

// ─────────────────────────────────────────────
// Framework Switcher Dropdown
// ─────────────────────────────────────────────
function FrameworkSwitcher({
	frameworks,
	currentFrameworkId,
}: {
	frameworks: CardFramework[];
	currentFrameworkId: string;
}) {
	const [open, setOpen] = useState(false);
	const current = frameworks.find(
		(f) => String(f.frameworkId) === String(currentFrameworkId),
	);

	return (
		<div className="relative">
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1730]/80 border border-white/15 hover:border-amber-500/50 text-sm text-white transition-all backdrop-blur-sm"
			>
				<Star className="h-4 w-4 text-amber-400" />
				<span className="max-w-[120px] truncate">
					{current?.name ?? "Chọn bộ"}
				</span>
				<ChevronLeft
					className={`h-4 w-4 text-white/50 transition-transform ${open ? "-rotate-90" : "rotate-180"}`}
				/>
			</button>

			{open && (
				<div className="absolute top-full mt-1 left-0 z-50 min-w-50 rounded-xl bg-[#12101e] border border-white/10 shadow-2xl overflow-hidden">
					{frameworks.map((fw) => {
						const isSelected =
							String(fw.frameworkId) === String(currentFrameworkId);
						return (
							<Link
								key={fw.frameworkId}
								href={`/card-gallery/${fw.frameworkId}`}
								onClick={() => setOpen(false)}
								className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
									isSelected
										? "bg-amber-500/20 text-amber-400"
										: "text-white/70 hover:bg-white/5 hover:text-white"
								}`}
							>
								<Star className="h-3.5 w-3.5 shrink-0" />
								<span className="flex-1">{fw.name}</span>
								{isSelected && <span className="text-amber-400">✓</span>}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────
// Styled Select (dark theme matching background)
// ─────────────────────────────────────────────
function DarkSelect({
	value,
	onChange,
	options,
	className = "",
}: {
	value: string;
	onChange: (val: string) => void;
	options: { value: string; label: string }[];
	className?: string;
}) {
	return (
		<div className={`relative ${className}`}>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="appearance-none w-full px-3 py-2 h-9 rounded-lg bg-[#1a1730]/80 border border-white/15 text-sm text-white/80 hover:border-amber-500/40 focus:border-amber-500/60 focus:outline-none backdrop-blur-sm cursor-pointer pr-8 transition-all"
				style={{ colorScheme: "dark" }}
			>
				{options.map((opt) => (
					<option
						key={opt.value}
						value={opt.value}
						className="bg-[#12101e] text-white"
					>
						{opt.label}
					</option>
				))}
			</select>
			{/* custom arrow */}
			<ChevronLeft className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 -rotate-90 pointer-events-none" />
		</div>
	);
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
function CardFrameworkContent() {
	const params = useParams();
	const searchParams = useSearchParams();
	const frameworkId = params.frameworkId as string;
	const initialCardId = searchParams.get("card");

	const [selectedCard, setSelectedCard] =
		useState<CardTemplateWithContent | null>(null);
	const [page, setPage] = useState(0);
	const [filters, setFilters] = useState<CardGalleryFilters>({
		search: "",
		rarity: "ALL",
		sortBy: "name",
		sortOrder: "asc",
		page: 0,
		limit: PAGE_SIZE,
	});
	const [isAuthenticated] = useState(false);

	// Reset page when filter changes
	useEffect(() => {
		setPage(0);
	}, [filters.search, filters.rarity, filters.sortBy, filters.sortOrder]);

	// Fetch card frameworks for switcher
	const { data: frameworks = [] } = useQuery<CardFramework[]>({
		queryKey: ["cardFrameworks"],
		queryFn: getCardFrameworks,
		staleTime: 1000 * 60 * 5,
	});

	// Derive API-compatible rarity param (undefined = no filter)
	const rarityParam = filters.rarity === "ALL" ? undefined : filters.rarity;

	// Fetch cards
	const {
		data: pageData,
		isLoading,
		error,
	} = useQuery({
		queryKey: [
			"cardTemplatesPaged",
			frameworkId,
			page,
			rarityParam,
			filters.search,
			filters.sortBy,
			filters.sortOrder,
		],
		queryFn: async () => {
			const result = await getCardTemplatesByFramework(frameworkId, {
				search: filters.search,
				rarity: rarityParam,
				sortBy: filters.sortBy,
				sortOrder: filters.sortOrder,
				page,
				limit: PAGE_SIZE,
			});
			// Enrich with card contents
			const enriched = await Promise.allSettled(
				result.content.map(async (template: CardTemplateWithContent) => {
					try {
						const contents = await getCardContentsByTemplateId(
							template.cardTemplateId,
						);
						return {
							...template,
							cardContents: contents as CardContent[],
							totalContentPieces: contents.length,
							publicContentCount: contents.filter(
								(c: CardContent) => c.isPublic,
							).length,
							privateContentCount: contents.filter(
								(c: CardContent) => !c.isPublic,
							).length,
							frameworkId,
						};
					} catch {
						return { ...template, cardContents: [], frameworkId };
					}
				}),
			);
			return {
				...result,
				content: enriched.map((r) =>
					r.status === "fulfilled" ? r.value : r.reason,
				),
			};
		},
		enabled: !!frameworkId,
	});

	const cards = pageData?.content ?? [];
	const totalPages = pageData?.totalPages ?? 0;
	const totalElements = pageData?.totalElements ?? 0;

	useEffect(() => {
		if (error) {
			toast.error(getApiErrorMessage(error, "Không thể tải danh sách lá bài"));
		}
	}, [error]);

	useEffect(() => {
		if (initialCardId && cards.length > 0) {
			const card = cards.find(
				(c: CardTemplateWithContent) =>
					c.cardTemplateId === Number(initialCardId),
			);
			if (card) setSelectedCard(card);
		}
	}, [initialCardId, cards]);

	const currentFramework = frameworks.find(
		(f) => String(f.frameworkId) === String(frameworkId),
	);
	const frameworkDisplayName =
		currentFramework?.name ??
		frameworkId
			.split("-")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

	// Stats derived from current page for panel
	const legendaryCount = cards.filter(
		(c: CardTemplateWithContent) => c.rarity === "LEGENDARY",
	).length;
	const rareCount = cards.filter(
		(c: CardTemplateWithContent) => c.rarity === "RARE",
	).length;

	return (
		<div className="min-h-screen">
			{/* Global CSS for rarity animations */}
			<style jsx global>{`
        @keyframes legendaryRainbow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .legendary-rainbow-overlay {
          background: linear-gradient(
            135deg,
            rgba(255,215,0,0.18) 0%,
            rgba(255,128,0,0.12) 14%,
            rgba(220,60,255,0.16) 28%,
            rgba(80,180,255,0.14) 42%,
            rgba(60,255,140,0.12) 57%,
            rgba(255,240,60,0.18) 71%,
            rgba(255,100,120,0.14) 85%,
            rgba(255,215,0,0.18) 100%
          );
          background-size: 300% 300%;
          animation: legendaryRainbow 3s ease infinite;
          mix-blend-mode: screen;
        }

        .rare-shimmer-overlay {
          background: linear-gradient(
            135deg,
            rgba(168,85,247,0.0) 0%,
            rgba(200,140,255,0.22) 40%,
            rgba(140,80,230,0.20) 60%,
            rgba(168,85,247,0.0) 100%
          );
          background-size: 200% 200%;
          animation: legendaryRainbow 2.5s ease infinite;
          mix-blend-mode: screen;
        }

        /* Legendary card: ambient golden glow border on hover */
        .legendary-card-wrap:hover {
          box-shadow:
            0 0 12px rgba(250,204,21,0.35),
            0 0 40px rgba(250,204,21,0.18),
            0 0 80px rgba(250,204,21,0.08),
            inset 0 0 20px rgba(250,204,21,0.05);
        }
      `}</style>

			{/* ── Set Header Banner ── */}
			<div className="container mx-auto px-4 mb-6">
				<div className="flex items-center gap-2 text-xs text-white/40 mb-4">
					<Link href="/" className="hover:text-white transition-colors">
						Trang chủ
					</Link>
					<span>/</span>
					<Link
						href="/card-gallery"
						className="hover:text-white transition-colors"
					>
						Card Gallery
					</Link>
					<span>/</span>
					<span className="text-white/70">{frameworkDisplayName}</span>
				</div>

				<div className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
					{/* Set icon */}
					<div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex-shrink-0">
						{currentFramework?.imageUrl ? (
							<Image
								src={currentFramework.imageUrl}
								alt={frameworkDisplayName}
								fill
								className="object-cover"
							/>
						) : (
							<div className="flex items-center justify-center h-full">
								<Star className="h-8 w-8 text-amber-400/60" />
							</div>
						)}
					</div>

					{/* Info */}
					<div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">
								Tên bộ
							</p>
							<p className="text-white font-bold text-sm">
								{frameworkDisplayName}
							</p>
						</div>
						<div>
							<p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">
								Ngày tạo
							</p>
							<p className="text-white text-sm">
								{currentFramework?.createdAt
									? new Date(currentFramework.createdAt).toLocaleDateString(
											"vi-VN",
											{
												day: "numeric",
												month: "long",
												year: "numeric",
											},
										)
									: "N/A"}
							</p>
						</div>
						<div>
							<p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">
								Tổng thẻ
							</p>
							<p className="text-white font-bold text-sm">
								{currentFramework?.totalCards ?? totalElements}
							</p>
						</div>
						<div>
							<p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">
								Đang hiển thị
							</p>
							<p className="text-amber-400 font-bold text-sm">
								{isLoading ? "..." : `${totalElements} lá bài`}
							</p>
						</div>
					</div>

					{/* Back */}
					<Link href="/card-gallery">
						<Button
							variant="outline"
							size="sm"
							className="gap-2 border-white/10 hover:border-amber-500/40 text-white/70 hover:text-white"
						>
							<ArrowLeft className="h-4 w-4" />
							Quay lại
						</Button>
					</Link>
				</div>
			</div>

			{/* ── Filters Row ── */}
			<div className="container mx-auto px-4 mb-4">
				<div className="flex flex-wrap items-center gap-3">
					{/* Search */}
					<div className="relative flex-1 min-w-45 max-w-xs">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
						<Input
							placeholder="Tìm kiếm theo tên..."
							value={filters.search}
							onChange={(e) =>
								setFilters((prev) => ({ ...prev, search: e.target.value }))
							}
							className="pl-9 bg-[#1a1730]/80 border-white/15 text-white placeholder:text-white/30 focus:border-amber-500/50 h-9 text-sm backdrop-blur-sm"
							style={{ colorScheme: "dark" }}
						/>
					</div>

					{/* Framework switcher */}
					{frameworks.length > 0 && (
						<FrameworkSwitcher
							frameworks={frameworks}
							currentFrameworkId={frameworkId}
						/>
					)}

					{/* Sort By field */}
					<div className="flex items-center gap-2">
						<span className="text-xs text-white/40 whitespace-nowrap hidden sm:inline">
							Sắp xếp theo:
						</span>
						<DarkSelect
							value={filters.sortBy ?? "name"}
							onChange={(val) =>
								setFilters((prev) => ({
									...prev,
									sortBy: val as CardGalleryFilters["sortBy"],
								}))
							}
							options={[
								{ value: "name", label: "Tên" },
								{ value: "rarity", label: "Độ hiếm" },
								{ value: "dropRate", label: "Drop rate" },
								{ value: "createdAt", label: "Mới nhất" },
							]}
							className="min-w-30"
						/>
					</div>

					{/* Sort Order */}
					<div className="flex items-center gap-2">
						<span className="text-xs text-white/40 whitespace-nowrap hidden sm:inline">
							Thứ tự:
						</span>
						<DarkSelect
							value={filters.sortOrder ?? "asc"}
							onChange={(val) =>
								setFilters((prev) => ({
									...prev,
									sortOrder: val as "asc" | "desc",
								}))
							}
							options={[
								{ value: "asc", label: "↑ Tăng dần" },
								{ value: "desc", label: "↓ Giảm dần" },
							]}
							className="min-w-30"
						/>
					</div>
				</div>
			</div>

			{/* ── Rarity Tab Bar ── */}
			<div className="container mx-auto px-4 mb-6">
				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
					{RARITY_TABS.map((tab) => {
						const isActive = filters.rarity === tab.value;
						const tabStyle = {
							ALL: isActive
								? "bg-amber-500 border-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]"
								: "bg-white/5 border-white/15 text-white/60 hover:border-white/30 hover:text-white",
							COMMON: isActive
								? "bg-blue-500 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
								: "bg-white/5 border-white/15 text-white/60 hover:border-blue-400/40 hover:text-blue-300",
							RARE: isActive
								? "bg-purple-500 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
								: "bg-white/5 border-white/15 text-white/60 hover:border-purple-400/40 hover:text-purple-300",
							LEGENDARY: isActive
								? "bg-yellow-500 border-yellow-500 text-black shadow-[0_0_14px_rgba(234,179,8,0.6)]"
								: "bg-white/5 border-white/15 text-white/60 hover:border-yellow-400/40 hover:text-yellow-300",
						}[tab.value];

						return (
							<button
								key={tab.value}
								onClick={() =>
									setFilters((prev) => ({ ...prev, rarity: tab.value }))
								}
								className={`
                  shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border transition-all
                  ${tabStyle}
                `}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* ── Results count ── */}
			<div className="container mx-auto px-4 mb-4">
				<p className="text-white/40 text-sm">
					{isLoading
						? "Đang tải..."
						: `${totalElements.toLocaleString()} lá bài${filters.rarity !== "ALL" ? ` · ${filters.rarity}` : ""} — Trang ${page + 1} / ${Math.max(1, totalPages)}`}
				</p>
			</div>

			{/* ── Cards Grid ── */}
			<div className="container mx-auto px-4 pb-12">
				{isLoading ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
						{Array.from({ length: PAGE_SIZE }).map((_, i) => (
							<CardSkeleton key={i} />
						))}
					</div>
				) : cards.length === 0 ? (
					<div className="text-center py-24">
						<Sparkles className="mx-auto h-14 w-14 text-white/20 mb-4" />
						<h3 className="text-lg font-semibold text-white/60 mb-2">
							Không tìm thấy lá bài nào
						</h3>
						<p className="text-white/30 text-sm">
							Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
						</p>
					</div>
				) : (
					<AnimatePresence mode="popLayout">
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
							{cards.map((card: CardTemplateWithContent) => (
								<CardItem
									key={card.cardTemplateId}
									card={card}
									onClick={() => setSelectedCard(card)}
								/>
							))}
						</div>
					</AnimatePresence>
				)}

				<Pagination
					currentPage={page}
					totalPages={totalPages}
					onPageChange={(newPage) => {
						setPage(newPage);
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
				/>
			</div>

			<EnhancedCardDetailModal
				card={selectedCard}
				open={!!selectedCard}
				onClose={() => setSelectedCard(null)}
				isAuthenticated={isAuthenticated}
				frameworkName={frameworkDisplayName}
			/>
		</div>
	);
}

export function CardFrameworkPageClient() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto px-4 py-12">
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
						{Array.from({ length: 12 }).map((_, i) => (
							<CardSkeleton key={i} />
						))}
					</div>
				</div>
			}
		>
			<CardFrameworkContent />
		</Suspense>
	);
}
