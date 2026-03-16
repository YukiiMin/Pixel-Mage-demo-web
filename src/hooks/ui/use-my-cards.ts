"use client";

import { useEffect, useMemo, useState } from "react";
import {
	API_ENDPOINTS,
	apiRequest,
	ensureStoredUserId,
} from "@/lib/api-config";
import { getApiErrorMessage, isApiHttpError } from "@/types/api";
import type { CollectionProgressItem, MyCardItem } from "@/types/commerce";

export type MyCardsStatus =
	| "idle"
	| "loading"
	| "ready"
	| "unavailable"
	| "error";

function normalizeRarity(value: unknown): MyCardItem["rarity"] {
	if (
		value === "common" ||
		value === "rare" ||
		value === "epic" ||
		value === "legendary"
	) {
		return value;
	}
	return "common";
}

function normalizeMyCards(payload: unknown): MyCardItem[] {
	const source = Array.isArray(payload)
		? payload
		: payload && typeof payload === "object"
			? ((payload as { data?: unknown; items?: unknown }).data ??
				(payload as { data?: unknown; items?: unknown }).items)
			: undefined;

	if (!Array.isArray(source)) {
		return [];
	}

	return source
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}

			const raw = item as Record<string, unknown>;
			const id = String(raw.id ?? raw.cardId ?? raw.templateId ?? "").trim();
			const name = String(
				raw.name ?? raw.cardName ?? raw.templateName ?? "",
			).trim();
			if (!id || !name) {
				return null;
			}

			return {
				id,
				name,
				description: String(raw.description ?? raw.summary ?? ""),
				quantity: Math.max(
					0,
					Number(raw.quantity ?? raw.ownedQuantity ?? 0) || 0,
				),
				rarity: normalizeRarity(raw.rarity),
				status: String(raw.status ?? raw.cardStatus ?? "UNKNOWN"),
				updatedAt: String(
					raw.updatedAt ?? raw.lastChecked ?? new Date().toISOString(),
				),
			};
		})
		.filter((item): item is MyCardItem => item !== null);
}

function normalizeCollectionProgress(
	payload: unknown,
): CollectionProgressItem[] {
	const source = Array.isArray(payload)
		? payload
		: payload && typeof payload === "object"
			? ((payload as { data?: unknown; items?: unknown }).data ??
				(payload as { data?: unknown; items?: unknown }).items)
			: undefined;

	if (!Array.isArray(source)) {
		return [];
	}

	return source
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}

			const raw = item as Record<string, unknown>;
			const collectionId = String(raw.collectionId ?? raw.id ?? "").trim();
			const collectionName = String(
				raw.collectionName ?? raw.name ?? "",
			).trim();
			if (!collectionId || !collectionName) {
				return null;
			}

			const completedItems =
				Number(raw.completedItems ?? raw.completed ?? 0) || 0;
			const totalItems = Number(raw.totalItems ?? raw.total ?? 0) || 0;
			const completionRate =
				totalItems > 0
					? Math.round((completedItems / totalItems) * 100)
					: Number(raw.completionRate ?? 0) || 0;

			return {
				collectionId,
				collectionName,
				completedItems,
				totalItems,
				completionRate,
			};
		})
		.filter((item): item is CollectionProgressItem => item !== null);
}

export function useMyCards() {
	const [cards, setCards] = useState<MyCardItem[]>([]);
	const [progress, setProgress] = useState<CollectionProgressItem[]>([]);
	const [status, setStatus] = useState<MyCardsStatus>("idle");
	const [statusMessage, setStatusMessage] = useState("");

	useEffect(() => {
		let active = true;

		const loadData = async () => {
			setStatus("loading");
			setStatusMessage("Đang tải bộ sưu tập từ hệ thống...");

			const userId = await ensureStoredUserId();
			if (!userId) {
				if (!active) {
					return;
				}
				setCards([]);
				setProgress([]);
				setStatus("unavailable");
				setStatusMessage(
					"Chưa xác định được user hiện tại. Chức năng My Cards chưa cập nhật cho phiên này.",
				);
				return;
			}

			const cardsPath = `${API_ENDPOINTS.inventoryManagement.myCards}?userId=${userId}`;
			const progressPath = `${API_ENDPOINTS.collectionProgress.list}?customerId=${userId}`;

			try {
				const [cardsResponse, progressResponse] = await Promise.all([
					apiRequest<unknown>(cardsPath, {
						method: "GET",
						cache: "no-store",
					}),
					apiRequest<unknown>(progressPath, {
						method: "GET",
						cache: "no-store",
					}),
				]);

				if (!active) {
					return;
				}

				const normalizedCards = normalizeMyCards(cardsResponse.data);
				const normalizedProgress = normalizeCollectionProgress(
					progressResponse.data,
				);

				if (normalizedCards.length === 0 && normalizedProgress.length === 0) {
					setCards([]);
					setProgress([]);
					setStatus("unavailable");
					setStatusMessage(
						"BE đã phản hồi nhưng chưa có dữ liệu My Cards/Collection Progress. Chức năng chưa cập nhật.",
					);
					return;
				}

				setCards(normalizedCards);
				setProgress(normalizedProgress);
				setStatus("ready");
				setStatusMessage("");
			} catch (error) {
				if (!active) {
					return;
				}

				setCards([]);
				setProgress([]);
				setStatus("unavailable");

				if (isApiHttpError(error) && error.status === 401) {
					setStatusMessage(
						"Bạn cần đăng nhập để truy cập dữ liệu My Cards. Chức năng chưa cập nhật cho khách chưa đăng nhập.",
					);
					return;
				}

				setStatusMessage(
					`${getApiErrorMessage(error, "Không thể tải dữ liệu My Cards từ BE.")} Chức năng chưa cập nhật.`,
				);
			}
		};

		loadData().catch(() => {
			if (!active) {
				return;
			}
			setCards([]);
			setProgress([]);
			setStatus("error");
			setStatusMessage("Không thể tải dữ liệu My Cards từ BE.");
		});

		return () => {
			active = false;
		};
	}, []);

	const stats = useMemo(() => {
		const totalCards = cards.reduce((sum, item) => sum + item.quantity, 0);
		const uniqueCards = cards.length;
		const completedCollections = progress.filter(
			(item) => item.totalItems > 0 && item.completedItems >= item.totalItems,
		).length;

		return {
			totalCards,
			uniqueCards,
			completedCollections,
		};
	}, [cards, progress]);

	return {
		cards,
		progress,
		status,
		statusMessage,
		stats,
	};
}
