"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { CardDescriptionCellProps } from "@/types/admin-cards";
import type { CardTemplateResponse } from "@/types/admin-catalog";

export function CardDescriptionCell({ card }: CardDescriptionCellProps) {
	const hasDescription =
		!!card.description && card.description.trim().length > 0;
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "card-template-description", card.cardTemplateId],
		queryFn: () =>
			apiRequest<CardTemplateResponse>(
				API_ENDPOINTS.cardTemplates.byId(card.cardTemplateId),
			).then((res) => res.data),
		enabled: !hasDescription && !!card.cardTemplateId,
	});

	const description = hasDescription ? card.description : data?.description;

	if (!description && isLoading) {
		return (
			<span className="text-xs text-muted-foreground italic">
				Đang tải mô tả...
			</span>
		);
	}

	return (
		<p
			className="line-clamp-2 text-xs max-w-sm"
			title={description || undefined}
		>
			{description || (
				<span className="text-muted-foreground italic">Chưa có mô tả</span>
			)}
		</p>
	);
}
