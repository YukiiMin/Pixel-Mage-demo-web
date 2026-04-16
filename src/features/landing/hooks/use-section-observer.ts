"use client";

import { useEffect, useState } from "react";

/**
 * useSectionObserver
 * ──────────────────
 * Tracks which section is currently visible in the viewport.
 * Re-triggers on every scroll in/out (no `once` behavior).
 *
 * @param sectionIds  Array of element IDs to observe (without '#')
 * @param threshold   Intersection ratio to consider "visible" (0–1)
 */
export function useSectionObserver(
	sectionIds: string[],
	threshold = 0.3,
): string {
	const [activeSection, setActiveSection] = useState<string>(
		sectionIds[0] ?? "",
	);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const observers: IntersectionObserver[] = [];

		const observerCallback =
			(id: string) =>
			(entries: IntersectionObserverEntry[]) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveSection(id);
					}
				}
			};

		for (const id of sectionIds) {
			const el = document.getElementById(id);
			if (!el) continue;

			const observer = new IntersectionObserver(observerCallback(id), {
				root: null,
				rootMargin: "-10% 0px -40% 0px",
				threshold,
			});
			observer.observe(el);
			observers.push(observer);
		}

		return () => {
			for (const obs of observers) obs.disconnect();
		};
	}, [sectionIds, threshold]);

	return activeSection;
}
