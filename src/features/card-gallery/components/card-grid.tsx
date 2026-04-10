"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	CardTemplateWithContent,
	ContentAccessLevel,
} from "@/features/card-gallery/types";
import { Eye, FileText, Heart, Sparkles } from "lucide-react";
import Image from "next/image";

interface CardGridProps {
	cards: CardTemplateWithContent[];
	loading: boolean;
	isAuthenticated: boolean;
	onCardClick: (card: CardTemplateWithContent) => void;
	getAccessLevel: (card: CardTemplateWithContent) => ContentAccessLevel;
	getRarityColor: (rarity: string) => string;
}

export function CardGrid({
	cards,
	loading,
	isAuthenticated,
	onCardClick,
	getAccessLevel,
	getRarityColor,
}: CardGridProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{Array.from({ length: 20 }).map((_, i) => (
					<Card key={i} className="glass-card overflow-hidden group">
						<div className="h-64 bg-muted/20 animate-pulse" />
						<CardContent className="p-4">
							<div className="h-6 bg-muted/40 rounded mb-2 animate-pulse" />
							<div className="h-4 bg-muted/30 rounded mb-2 animate-pulse" />
							<div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
			{cards.map((card) => {
				const accessLevel = getAccessLevel(card);

				return (
					<Card
						key={card.cardTemplateId}
						className="glass-card overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
						onClick={() => onCardClick(card)}
					>
						{/* Card Image */}
						<div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
							{card.imagePath ? (
								<Image
									src={card.imagePath}
									alt={card.name}
									fill
									className="object-cover transition-transform duration-300 group-hover:scale-110"
								/>
							) : (
								<div className="flex items-center justify-center h-full">
									<Sparkles className="h-12 w-12 text-primary/30" />
								</div>
							)}

							{/* Overlay with badges */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<div className="absolute top-2 left-2 right-2">
									<div className="flex items-center gap-2">
										<Badge className={getRarityColor(card.rarity)}>
											{card.rarity}
										</Badge>
										{card.isOwned && (
											<Badge className="bg-green-500/10 text-green-400 border-green-500/25">
												<Heart className="h-3 w-3 mr-1" />
												Đã sở hữu
											</Badge>
										)}
									</div>
								</div>

								<div className="absolute bottom-2 left-2">
									<div className="flex items-center gap-1 text-white text-xs">
										<Eye className="h-3 w-3" />
										{card.ownerCount}
									</div>
								</div>
							</div>
						</div>

						<CardContent className="p-4">
							<CardHeader className="p-0 mb-2">
								<CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
									{card.name}
								</CardTitle>
							</CardHeader>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
										<FileText className="h-3 w-3 mr-1" />
										{card.totalContentPieces} nội dung
									</Badge>
									{card.dropRate && (
										<Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
											{card.dropRate}%
										</Badge>
									)}
								</div>

								<button className="text-xs text-muted-foreground hover:text-primary transition-colors">
									Chi tiết
								</button>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
