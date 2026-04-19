"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	CardContent as CardContentData,
	CardContentType,
	CardTemplateWithContent,
	ContentAccessLevel,
} from "@/features/card-gallery/types";
import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	Crown,
	Droplets,
	Eye,
	FileText,
	Flame,
	Heart,
	ImageIcon,
	Lock,
	Mountain,
	Percent,
	Play,
	ShoppingBag,
	Sparkles,
	Users,
	Wind,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoContentPlayer } from "./video-content-player";
import { LoreContentViewer } from "./lore-content-viewer";

// ─────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────
interface CardDetailModalProps {
	card: CardTemplateWithContent | null;
	open: boolean;
	onClose: () => void;
	isAuthenticated: boolean;
	frameworkName?: string;
	onNext?: () => void;
	onPrev?: () => void;
}

// ─────────────────────────────────────────────
// Animation Variants
// ─────────────────────────────────────────────
const overlayVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.3 } },
	exit: { opacity: 0, transition: { duration: 0.2 } },
};

const contentVariants = {
	hidden: { opacity: 0, y: 20, scale: 0.95 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.4, ease: "easeOut" as const },
	},
	exit: {
		opacity: 0,
		y: 20,
		scale: 0.95,
		transition: { duration: 0.2 },
	},
};

const cardImageVariants = {
	initial: { scale: 1, rotateY: 0 },
	hover: {
		scale: 1.05,
		rotateY: 5,
		transition: { duration: 0.4, ease: "easeOut" as const },
	},
};

const glowVariants = {
	initial: { opacity: 0.5, scale: 1 },
	animate: {
		opacity: [0.5, 0.8, 0.5],
		scale: [1, 1.1, 1],
		transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
	},
};

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────
const getRarityConfig = (rarity?: string) => {
	const normalizedRarity = (rarity || "COMMON").toUpperCase();
	const configs: Record<
		string,
		{
			color: string;
			bg: string;
			border: string;
			glow: string;
			icon: React.ReactNode;
		}
	> = {
		LEGENDARY: {
			color: "text-yellow-300",
			bg: "bg-gradient-to-br from-yellow-500/25 via-amber-500/15 to-yellow-500/20",
			border: "border-yellow-500/50",
			glow: "shadow-[0_0_30px_rgba(250,204,21,0.25)]",
			icon: <Crown className="h-4 w-4" />,
		},
		RARE: {
			color: "text-purple-300",
			bg: "bg-gradient-to-br from-purple-500/25 via-violet-500/15 to-purple-500/20",
			border: "border-purple-500/50",
			glow: "shadow-[0_0_30px_rgba(168,85,247,0.25)]",
			icon: <Sparkles className="h-4 w-4" />,
		},
		COMMON: {
			color: "text-blue-300",
			bg: "bg-gradient-to-br from-blue-500/15 via-slate-500/10 to-blue-500/10",
			border: "border-blue-500/30",
			glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
			icon: <Zap className="h-4 w-4" />,
		},
	};
	return configs[normalizedRarity] || configs.COMMON;
};

const getElementIcon = (element?: string) => {
	switch (element?.toLowerCase()) {
		case "fire":
			return <Flame className="h-4 w-4 text-red-400" />;
		case "water":
			return <Droplets className="h-4 w-4 text-blue-400" />;
		case "earth":
			return <Mountain className="h-4 w-4 text-green-400" />;
		case "air":
			return <Wind className="h-4 w-4 text-cyan-400" />;
		default:
			return <Sparkles className="h-4 w-4 text-purple-400" />;
	}
};

const getContentTypeConfig = (type: CardContentType) => {
	const configs: Record<
		CardContentType,
		{ icon: React.ReactNode; label: string; color: string }
	> = {
		TEXT: {
			icon: <FileText className="h-4 w-4" />,
			label: "Văn bản",
			color: "text-blue-400",
		},
		IMAGE: {
			icon: <ImageIcon className="h-4 w-4" />,
			label: "Hình ảnh",
			color: "text-green-400",
		},
		VIDEO: {
			icon: <Play className="h-4 w-4" />,
			label: "Video",
			color: "text-red-400",
		},
		GIF: {
			icon: <ImageIcon className="h-4 w-4" />,
			label: "GIF",
			color: "text-purple-400",
		},
		AUDIO: {
			icon: <Zap className="h-4 w-4" />,
			label: "Audio",
			color: "text-yellow-400",
		},
		STORY: {
			icon: <BookOpen className="h-4 w-4" />,
			label: "Câu chuyện",
			color: "text-violet-400",
		},
	};
	return configs[type] ?? {
		icon: <FileText className="h-4 w-4" />,
		label: type ?? "Khác",
		color: "text-muted-foreground",
	};
};

// ─────────────────────────────────────────────
// Content Access Hook
// ─────────────────────────────────────────────
function useContentAccess(
	card: CardTemplateWithContent | null,
	isAuthenticated: boolean,
): ContentAccessLevel {
	if (!card) {
		return {
			canViewFullContent: false,
			canViewPartialContent: false,
			requiredAction: "LOGIN",
			blurredContent: [],
			visibleContent: [],
		};
	}

	if (isAuthenticated) {
		return {
			canViewFullContent: true,
			canViewPartialContent: true,
			requiredAction: "NONE",
			visibleContent: card.cardContents || [],
			blurredContent: [],
		};
	}

	const contents = card.cardContents || [];
	const publicContent = contents.filter((content) => content.isPublic);
	const privateContent = contents.filter((content) => !content.isPublic);

	return {
		canViewFullContent: false,
		canViewPartialContent: publicContent.length > 0,
		requiredAction: "LOGIN",
		blurredContent: privateContent,
		visibleContent: publicContent,
	};
}

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
function CardImageSection({
	card,
	rarityConfig,
}: {
	card: CardTemplateWithContent;
	rarityConfig: ReturnType<typeof getRarityConfig>;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const rarity = card.rarity ?? "COMMON";

	return (
		<div className="relative shrink-0">
			{/* Ambient glow blob behind card */}
			<motion.div
				className={`absolute -inset-4 rounded-3xl blur-3xl ${rarityConfig.bg} opacity-60`}
				variants={glowVariants}
				initial="initial"
				animate="animate"
			/>

			{/* Card Frame */}
			<motion.div
				className={`relative rounded-2xl overflow-hidden border-2 ${rarityConfig.border} shadow-2xl ${rarityConfig.glow}`}
				style={{ perspective: "1000px" }}
				variants={cardImageVariants}
				initial="initial"
				whileHover="hover"
				onHoverStart={() => setIsHovered(true)}
				onHoverEnd={() => setIsHovered(false)}
			>
				{/* Card Image */}
				<div className="relative w-full aspect-3/4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
					{card.imagePath ? (
						<Image
							src={card.imagePath}
							alt={card.name}
							fill
							className="object-cover transition-transform duration-500"
							style={{ transform: isHovered ? "scale(1.08)" : "scale(1)" }}
							priority
						/>
					) : (
						<div className="flex items-center justify-center h-full">
							<Sparkles className="h-24 w-24 text-primary/20" />
						</div>
					)}

					{/* Card Overlay Gradient */}
					<div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

					{/* Edition Badge — top right */}
					<div className="absolute top-3 right-3">
						<Badge className="bg-black/60 text-white/80 border-white/20 px-2 py-0.5 text-[10px] backdrop-blur-sm">
							1st Edition
						</Badge>
					</div>

					{/* Rarity Badge — bottom left (avoids PixelMage logo area top-left) */}
					<div className="absolute bottom-3 left-3">
						<Badge
							className={`${rarityConfig.bg} ${rarityConfig.color} border ${rarityConfig.border} px-2.5 py-0.5 text-[10px] backdrop-blur-sm`}
						>
							{rarityConfig.icon}
							<span className="ml-1 font-bold tracking-wider">
								{card.rarity}
							</span>
						</Badge>
					</div>

					{/* Card Number — bottom right */}
					<div className="absolute bottom-3 right-3">
						<span className="text-white/50 text-xs font-mono">
							#{String(card.cardTemplateId).padStart(3, "0")}
						</span>
					</div>

					{/* Legendary rainbow shimmer */}
					{rarity === "LEGENDARY" && isHovered && (
						<div
							className="absolute inset-0 pointer-events-none"
							style={{
								background:
									"linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,128,0,0.1) 15%, rgba(220,60,255,0.14) 30%, rgba(80,180,255,0.12) 45%, rgba(60,255,140,0.1) 60%, rgba(255,240,60,0.15) 75%, rgba(255,100,120,0.12) 90%, rgba(255,215,0,0.15) 100%)",
								backgroundSize: "300% 300%",
								animation: "legendaryRainbowModal 3s ease infinite",
								mixBlendMode: "screen",
							}}
						/>
					)}

					{/* Rare shimmer */}
					{rarity === "RARE" && isHovered && (
						<div
							className="absolute inset-0 pointer-events-none"
							style={{
								background:
									"linear-gradient(135deg, rgba(168,85,247,0) 0%, rgba(200,140,255,0.2) 40%, rgba(140,80,230,0.18) 60%, rgba(168,85,247,0) 100%)",
								backgroundSize: "200% 200%",
								animation: "legendaryRainbowModal 2.5s ease infinite",
								mixBlendMode: "screen",
							}}
						/>
					)}
				</div>
			</motion.div>

			{/* Inline keyframes for modal card shimmer */}
			<style jsx>{`
        @keyframes legendaryRainbowModal {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
		</div>
	);
}

function CardStats({ card }: { card: CardTemplateWithContent }) {
	return (
		<div className="grid grid-cols-2 gap-4">
			<div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-4 group/stat hover:border-primary/40 transition-all duration-500">
				<div className="flex items-center gap-3 mb-2">
					<div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover/stat:scale-110 transition-transform">
						<Users className="h-5 w-5 text-blue-400" />
					</div>
					<span className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold">Sở hữu</span>
				</div>
				<p className="text-2xl font-bold text-foreground font-stats">
					{card.ownerCount?.toLocaleString() || 0}
				</p>
			</div>

			<div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-4 group/stat hover:border-primary/40 transition-all duration-500">
				<div className="flex items-center gap-3 mb-2">
					<div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover/stat:scale-110 transition-transform">
						<Percent className="h-5 w-5 text-orange-400" />
					</div>
					<span className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold">Drop Rate</span>
				</div>
				<p className="text-2xl font-bold text-foreground font-stats">
					{card.dropRate || 0}%
				</p>
			</div>

			<div className="col-span-2 bg-card/20 border border-primary/10 rounded-2xl p-5 space-y-3 relative overflow-hidden group/progress">
				<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
				<div className="flex items-center justify-between relative z-10">
					<span className="text-xs text-primary/70 font-semibold uppercase tracking-widest">Rarity Progression</span>
					<span className="text-sm font-bold text-primary">{card.rarity}</span>
				</div>
				<div className="h-2 bg-muted/30 rounded-full overflow-hidden relative z-10 border border-white/5">
					<motion.div
						className="h-full bg-linear-to-r from-primary/40 via-primary to-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.5)]"
						initial={{ width: 0 }}
						animate={{
							width: `${Math.min((card.dropRate || 0) * 10, 100)}%`,
						}}
						transition={{ duration: 1.5, ease: "easeOut" }}
					/>
				</div>
			</div>
		</div>
	);
}

function ContentSection({
	card,
	accessLevel,
	isAuthenticated,
	onSelect,
}: {
	card: CardTemplateWithContent;
	accessLevel: ContentAccessLevel;
	isAuthenticated: boolean;
	onSelect: (contentId: string) => void;
}) {
	const [activeTab, setActiveTab] = useState("all");
	const contents = card.cardContents || [];

	const filteredContents = contents.filter((content) => {
		if (activeTab === "all") return true;
		return content.contentType.toLowerCase() === activeTab;
	});

	return (
		<div className="space-y-4">
			{/* Content Lock Banner for Guests */}
			{!isAuthenticated &&
				accessLevel.blurredContent &&
				accessLevel.blurredContent.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4"
					>
						<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjUxLCAxOTEsIDM2LCAwLjEpIi8+PC9zdmc+')] opacity-50" />

						<div className="relative flex items-start gap-4">
							<div className="p-3 rounded-full bg-amber-500/20">
								<Lock className="h-6 w-6 text-amber-400" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-amber-200 mb-1">
									Nội dung độc quyền đã bị khóa
								</h4>
								<p className="text-sm text-amber-100/70 mb-3">
									Đăng nhập để xem toàn bộ {accessLevel.blurredContent.length}{" "}
									nội dung độc quyền về lá bài này, bao gồm câu chuyện, hình ảnh
									hiếm và video đặc biệt.
								</p>
								<div className="flex gap-3">
									<Button
										size="sm"
										className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
										asChild
									>
										<Link
											href={`/login?returnUrl=${encodeURIComponent(`/card-gallery/${card.frameworkId}?card=${card.cardTemplateId}`)}`}
										>
											Đăng nhập
										</Link>
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
										asChild
									>
										<Link
											href={`/register?returnUrl=${encodeURIComponent(`/card-gallery/${card.frameworkId}?card=${card.cardTemplateId}`)}`}
										>
											Đăng ký
										</Link>
									</Button>
								</div>
							</div>
						</div>
					</motion.div>
				)}

			{/* Content Tabs */}
			{contents.length > 0 && (
				<Tabs defaultValue="all" onValueChange={setActiveTab}>
					<TabsList className="bg-card/50 border border-border/30">
						<TabsTrigger value="all">Tất cả</TabsTrigger>
						<TabsTrigger value="text">Lore</TabsTrigger>
						<TabsTrigger value="image">Hình ảnh</TabsTrigger>
						<TabsTrigger value="video">Video</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="mt-4">
						<ScrollArea className="h-[400px] pr-4">
							<div className="space-y-3">
								{filteredContents.map((content, index) => (
									<ContentItem
										key={content.contentId}
										content={content}
										isLocked={!isAuthenticated && !content.isPublic}
										delay={index * 0.05}
										onSelect={onSelect}
									/>
								))}
							</div>
						</ScrollArea>
					</TabsContent>

					<TabsContent value="text" className="mt-4">
						<ScrollArea className="h-[400px] pr-4">
							<div className="space-y-3">
								{filteredContents
									.filter((c) => c.contentType === "TEXT" || c.contentType === "STORY")
									.map((content, index) => (
										<ContentItem
											key={content.contentId}
											content={content}
											isLocked={!isAuthenticated && !content.isPublic}
											delay={index * 0.05}
											onSelect={onSelect}
										/>
									))}
							</div>
						</ScrollArea>
					</TabsContent>

					<TabsContent value="image" className="mt-4">
						<ScrollArea className="h-[400px] pr-4">
							<div className="space-y-3">
								{filteredContents
									.filter(
										(c) => c.contentType === "IMAGE" || c.contentType === "GIF",
									)
									.map((content, index) => (
										<ContentItem
											key={content.contentId}
											content={content}
											isLocked={!isAuthenticated && !content.isPublic}
											delay={index * 0.05}
											onSelect={onSelect}
										/>
									))}
							</div>
						</ScrollArea>
					</TabsContent>

					<TabsContent value="video" className="mt-4">
						<ScrollArea className="h-[400px] pr-4">
							<div className="space-y-3">
								{filteredContents
									.filter((c) => c.contentType === "VIDEO")
									.map((content, index) => (
										<ContentItem
											key={content.contentId}
											content={content}
											isLocked={!isAuthenticated && !content.isPublic}
											delay={index * 0.05}
											onSelect={onSelect}
										/>
									))}
							</div>
						</ScrollArea>
					</TabsContent>
				</Tabs>
			)}

			{contents.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					<BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
					<p>Chưa có nội dung cho lá bài này</p>
				</div>
			)}
		</div>
	);
}

function ContentItem({
	content,
	isLocked,
	delay = 0,
	onSelect,
}: {
	content: CardContentData;
	isLocked: boolean;
	delay?: number;
	onSelect: (contentId: string) => void;
}) {
	const config = getContentTypeConfig(content.contentType);

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.3, delay }}
			onClick={() => !isLocked && onSelect(content.contentId)}
			className={`relative rounded-xl border ${isLocked ? "border-amber-500/30" : "border-border/30"} bg-card/30 overflow-hidden group/item cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300`}
		>
			{isLocked && (
				<div className="absolute inset-0 backdrop-blur-md bg-background/80 z-10 flex items-center justify-center">
					<div className="text-center">
						<Lock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
						<p className="text-sm text-amber-200">Nội dung độc quyền</p>
						<p className="text-xs text-amber-100/60 font-jakarta">Đăng nhập để xem</p>
					</div>
				</div>
			)}

			<div className="p-4 flex items-center gap-4">
				{/* Type Icon */}
				<div className={`p-3 rounded-lg bg-muted/50 border border-border/20 group-hover/item:border-primary/30 transition-colors ${config?.color ?? "text-muted-foreground"}`}>
					{config?.icon}
				</div>
				
				{/* Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<h4 className="font-semibold text-foreground truncate group-hover/item:text-primary transition-colors">
							{content.title || "Không có tiêu đề"}
						</h4>
						{content.isPublic ? (
							<Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
								Public
							</Badge>
						) : (
							<Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
								Pro
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground line-clamp-1">
						<span className="capitalize">{config?.label || "Archive"}</span>
						<span>•</span>
						<span>{content.contentType === "TEXT" || content.contentType === "STORY" ? "Bản thảo cổ" : "Đa phương tiện"}</span>
					</div>
				</div>

				{/* Selection Arrow */}
				{!isLocked && (
					<div className="opacity-0 group-hover/item:opacity-100 translate-x-4 group-hover/item:translate-x-0 transition-all duration-300">
						<ChevronRight className="h-5 w-5 text-primary" />
					</div>
				)}
			</div>
		</motion.div>
	);
}

function ActionPanel({
	card,
	onClose,
}: {
	card: CardTemplateWithContent;
	onClose: () => void;
}) {
	return (
		<div className="space-y-4">
			{/* Buy Button */}
			<Button
				size="lg"
				className="w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg shadow-primary/25 btn-shimmer"
				asChild
			>
				<Link
					href={`/marketplace?cardTemplate=${card.cardTemplateId}`}
					onClick={onClose}
				>
					<ShoppingBag className="h-5 w-5 mr-2" />
					Mua lá bài này
				</Link>
			</Button>

			{/* View Packs Button */}
			<Button
				variant="outline"
				size="lg"
				className="w-full border-border/50 hover:bg-card/50"
				asChild
			>
				<Link
					href={`/marketplace?cardTemplate=${card.cardTemplateId}`}
					onClick={onClose}
				>
					<Eye className="h-5 w-5 mr-2" />
					Xem gói có chứa lá bài này
				</Link>
			</Button>

			{/* Secondary Actions */}
			<div className="flex gap-2 pt-2">
				<Button variant="ghost" size="sm" className="flex-1">
					<Heart className="h-4 w-4 mr-1" />
					Yêu thích
				</Button>
				<Button variant="ghost" size="sm" className="flex-1">
					<Sparkles className="h-4 w-4 mr-1" />
					Chia sẻ
				</Button>
			</div>

			{/* Additional Info */}
			<div className="pt-4 border-t border-border/30 space-y-2 text-xs text-muted-foreground">
				<div className="flex justify-between">
					<span>Mã lá bài:</span>
					<span className="font-mono text-white/70">
						{card.cardCode || `#${card.cardTemplateId}`}
					</span>
				</div>
				<div className="flex justify-between">
					<span>Bộ sưu tập:</span>
					<span className="text-white/70">
						{card.frameworkName || card.frameworkId}
					</span>
				</div>
				<div className="flex justify-between">
					<span>Độ hiếm:</span>
					<span className="text-white/70">{card.rarity}</span>
				</div>
				{card.dropRate !== undefined && (
					<div className="flex justify-between">
						<span>Tỷ lệ rơi:</span>
						<span className="text-white/70">{card.dropRate}%</span>
					</div>
				)}
				<div className="flex justify-between">
					<span>Nội dung:</span>
					<span className="text-white/70">
						{card.totalContentPieces || 0} mục ({card.publicContentCount || 0}{" "}
						công khai, {card.privateContentCount || 0} độc quyền)
					</span>
				</div>
				{card.createdAt && (
					<div className="flex justify-between">
						<span>Ngày phát hành:</span>
						<span className="text-white/70">
							{new Date(card.createdAt).toLocaleDateString("vi-VN")}
						</span>
					</div>
				)}
				<div className="flex justify-between">
					<span>Số người sở hữu:</span>
					<span className="text-white/70">
						{card.ownerCount?.toLocaleString() ?? 0}
					</span>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function EnhancedCardDetailModal({
	card,
	open,
	onClose,
	isAuthenticated,
	frameworkName,
	onNext,
	onPrev,
}: CardDetailModalProps) {
	const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
	const accessLevel = useContentAccess(card, isAuthenticated);

	if (!card) return null;

	const rarityConfig = getRarityConfig(card.rarity);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden bg-linear-to-br from-background via-background to-slate-900/50 border-border/50">
				<DialogHeader className="sr-only">
					<DialogTitle>{card.name}</DialogTitle>
				</DialogHeader>

				{/* Cinematic Starfield Background */}
				<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
					<div className="absolute inset-0 bg-[#0a0a0f]" />
					<div className="absolute top-0 left-0 w-full h-[30%] bg-linear-to-b from-primary/10 to-transparent" />
					<div className="absolute bottom-0 left-0 w-full h-[30%] bg-linear-to-t from-slate-900/50 to-transparent" />
					
					{/* Twinkling Stars */}
					{[...Array(20)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
							style={{
								top: `${Math.random() * 100}%`,
								left: `${Math.random() * 100}%`,
								opacity: Math.random() * 0.7,
								animationDelay: `${Math.random() * 5}s`,
								animationDuration: `${2 + Math.random() * 3}s`,
							}}
						/>
					))}
					
					{/* Floating particles */}
					{[...Array(8)].map((_, i) => (
						<motion.div
							key={`p-${i}`}
							className="absolute w-2 h-2 bg-primary/20 rounded-full blur-sm animate-float"
							style={{
								top: `${Math.random() * 100}%`,
								left: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 8}s`,
								animationDuration: `${10 + Math.random() * 10}s`,
							}}
						/>
					))}
				</div>

				<AnimatePresence mode="wait">
					<motion.div
						key={card.cardTemplateId}
						variants={contentVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10"
					>
						{/* Pane 1 (Left) - Card Image Visuals */}
						<div className="lg:col-span-4 p-6 lg:p-8 bg-linear-to-br from-slate-900/80 to-background/40 backdrop-blur-md border-r border-border/20">
							<CardImageSection card={card} rarityConfig={rarityConfig} />

							{/* Mobile-only Stats - Hidden on Desktop since it moves to Right pane */}
							<div className="mt-6 lg:hidden">
								<CardStats card={card} />
							</div>
						</div>

						{/* Pane 2 (Center) - Core Identity & Actions */}
						<div className={`lg:col-span-4 p-6 lg:p-8 space-y-6 flex flex-col transition-all duration-500 relative overflow-hidden ${selectedContentId ? "opacity-30 blur-xs pointer-events-none" : "opacity-100"}`}>
							{/* Premium Shimmer Overlay */}
							<div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
							
							{/* Header Info */}
							<div>
								<div className="flex items-center gap-2 mb-3">
									<Badge
										className={`${rarityConfig.bg} ${rarityConfig.color} border ${rarityConfig.border} px-3 py-1 shadow-lg animate-pulse-glow`}
									>
										{rarityConfig.icon}
										<span className="ml-1 tracking-[0.2em] font-bold">{card.rarity}</span>
									</Badge>
									{frameworkName && (
										<Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary/70 text-[10px] tracking-widest uppercase">
											{frameworkName}
										</Badge>
									)}
								</div>

								<h2 className="text-5xl font-bold font-heading text-mystic-gradient animate-flicker mb-4 leading-tight">
									{card.name}
								</h2>

								<div className="relative group/desc">
									<p className="text-base text-ethereal/90 leading-relaxed border-l-2 border-primary/20 pl-4 py-1 italic opacity-80 animate-fog-in">
										{card.description || "Huyền tích về lá bài này đang chờ được khám phá..."}
									</p>
									<div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary to-primary/50 group-hover:via-primary-foreground transition-all duration-300" />
								</div>
							</div>

							<div className="flex-1" />

							{/* Actions - Now in the Center Column */}
							<div className="pt-6 border-t border-border/20">
								<ActionPanel card={card} onClose={onClose} />
							</div>
						</div>

						{/* Pane 3 (Right) - The Archive (Library & Stats) */}
						<div className={`lg:col-span-4 p-6 lg:p-8 bg-black/20 backdrop-blur-sm border-l border-border/20 flex flex-col transition-all duration-500 ${selectedContentId ? "lg:translate-x-full lg:opacity-0" : "opacity-100"}`}>
							<div className="flex items-center gap-2 mb-6">
								<div className="p-1.5 rounded-full bg-primary/10 border border-primary/20">
									<Zap className="h-5 w-5 text-primary" />
								</div>
								<h3 className="text-xl font-heading font-semibold text-gold-shimmer">
									Chỉ Số Thẻ Bài
								</h3>
							</div>

							<CardStats card={card} />

							{/* Content Library */}
							<div className="mt-8 flex-1 flex flex-col">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-2">
										<BookOpen className="h-5 w-5 text-primary" />
										<h3 className="text-2xl font-heading font-semibold text-gold-shimmer">
											Kho Lưu Trữ
										</h3>
									</div>
									<Badge className="bg-primary/20 text-primary border-primary/40 font-stats">
										{card.cardContents?.length || 0}
									</Badge>
								</div>

								<ContentSection
									card={card}
									accessLevel={accessLevel}
									isAuthenticated={isAuthenticated}
									onSelect={(id) => setSelectedContentId(id)}
								/>
							</div>
						</div>

						{/* Archive Detail View - Interaction Solution */}
						<AnimatePresence>
							{selectedContentId && (
								<motion.div
									initial={{ opacity: 0, x: 200, filter: "blur(10px)" }}
									animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
									exit={{ opacity: 0, x: 200, filter: "blur(10px)" }}
									transition={{ type: "spring", damping: 25, stiffness: 200 }}
									className="absolute inset-y-0 right-0 w-full lg:w-[66.6%] z-[60] bg-background/98 backdrop-blur-2xl border-l border-primary/20 p-6 lg:p-10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
								>
									{/* Decorative Overlay background */}
									<div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
										<div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
										<div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full" />
									</div>

									<div className="flex items-center justify-between mb-8 relative z-10">
										<Button
											variant="ghost"
											onClick={() => setSelectedContentId(null)}
											className="text-primary hover:text-primary-foreground hover:bg-primary/20"
										>
											<ChevronLeft className="h-5 w-5 mr-2" />
											Quay lại Thư Viện
										</Button>
										
										{selectedContentId && card.cardContents?.find(c => c.contentId === selectedContentId)?.title && (
											<h4 className="text-lg font-heading text-primary font-bold">
												{card.cardContents.find(c => c.contentId === selectedContentId)?.title}
											</h4>
										)}
									</div>

									<ScrollArea className="flex-1 pr-4">
										{(() => {
											const activeContent = card.cardContents?.find(c => c.contentId === selectedContentId);
											if (!activeContent) return null;
											
											if (activeContent.contentType === "TEXT" || activeContent.contentType === "STORY") {
												return <LoreContentViewer content={activeContent} />;
											}
											if (activeContent.contentType === "VIDEO") {
												return <VideoContentPlayer content={activeContent} />;
											}
											if (activeContent.contentType === "IMAGE") {
												return (
													<div className="rounded-xl overflow-hidden border border-primary/20 shadow-2xl">
														<Image 
															src={activeContent.contentUrl || ""} 
															alt={activeContent.title || "Lore Image"} 
															width={800} 
															height={600} 
															className="w-full h-auto object-contain"
														/>
													</div>
												);
											}
											return null;
										})()}
									</ScrollArea>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Navigation Arrows - Premium Absolute Position Fix */}
						<div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
							{onPrev && (
								<div 
									className="absolute left-0 top-1/2 -translate-y-1/2 h-64 w-24 pointer-events-auto flex items-center justify-start group/nav-left cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										onPrev();
									}}
									aria-label="Lá bài trước"
								>
									<motion.div 
										initial={{ x: -60, opacity: 0 }}
										whileHover={{ x: 0, opacity: 1 }}
										transition={{ type: "spring", damping: 20, stiffness: 100 }}
										className="p-4 bg-linear-to-r from-primary/30 to-transparent backdrop-blur-md rounded-r-3xl border-y border-r border-primary/40 flex items-center justify-center shadow-[15px_0_30px_-15px_rgba(255,184,0,0.2)]"
									>
										<ChevronLeft className="h-10 w-10 text-primary" />
									</motion.div>
								</div>
							)}

							{onNext && (
								<div 
									className="absolute right-0 top-1/2 -translate-y-1/2 h-64 w-24 pointer-events-auto flex items-center justify-end group/nav-right cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										onNext();
									}}
									aria-label="Lá bài sau"
								>
									<motion.div 
										initial={{ x: 60, opacity: 0 }}
										whileHover={{ x: 0, opacity: 1 }}
										transition={{ type: "spring", damping: 20, stiffness: 100 }}
										className="p-4 bg-linear-to-l from-primary/30 to-transparent backdrop-blur-md rounded-l-3xl border-y border-l border-primary/40 flex items-center justify-center shadow-[-15px_0_30px_-15px_rgba(255,184,0,0.2)]"
									>
										<ChevronRight className="h-10 w-10 text-primary" />
									</motion.div>
								</div>
							)}
						</div>
					</motion.div>
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}

export default EnhancedCardDetailModal;
