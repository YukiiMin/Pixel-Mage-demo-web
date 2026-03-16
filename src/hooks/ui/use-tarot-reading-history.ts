"use client";

import { useCallback, useEffect, useState } from "react";
import type {
	SaveTarotReadingInput,
	TarotReadingHistoryItem,
} from "@/types/tarot-history";

const STORAGE_KEY = "pixelmage.tarot.reading-history";
const MAX_HISTORY_ITEMS = 20;

function parseHistory(rawValue: string | null): TarotReadingHistoryItem[] {
	if (!rawValue) {
		return [];
	}
	try {
		const parsed = JSON.parse(rawValue);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function useTarotReadingHistory() {
	const [history, setHistory] = useState<TarotReadingHistoryItem[]>([]);

	const loadHistory = useCallback(() => {
		if (typeof window === "undefined") {
			return;
		}
		const nextHistory = parseHistory(window.localStorage.getItem(STORAGE_KEY));
		setHistory(nextHistory);
	}, []);

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	const persistHistory = useCallback(
		(nextHistory: TarotReadingHistoryItem[]) => {
			if (typeof window === "undefined") {
				return;
			}
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
			setHistory(nextHistory);
		},
		[],
	);

	const addReading = useCallback(
		(input: SaveTarotReadingInput) => {
			const reading: TarotReadingHistoryItem = {
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				createdAt: new Date().toISOString(),
				...input,
			};
			const nextHistory = [reading, ...history].slice(0, MAX_HISTORY_ITEMS);
			persistHistory(nextHistory);
			return reading;
		},
		[history, persistHistory],
	);

	const removeReading = useCallback(
		(readingId: string) => {
			const nextHistory = history.filter((item) => item.id !== readingId);
			persistHistory(nextHistory);
		},
		[history, persistHistory],
	);

	const clearHistory = useCallback(() => {
		persistHistory([]);
	}, [persistHistory]);

	return {
		history,
		addReading,
		removeReading,
		clearHistory,
		refreshHistory: loadHistory,
	};
}
