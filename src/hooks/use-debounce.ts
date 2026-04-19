import { useEffect, useState } from "react";

/**
 * Delays updating the returned value until `delay` ms have elapsed
 * since the last change — prevents API flooding on key-press.
 */
export function useDebounce<T>(value: T, delay = 350): T {
	const [debounced, setDebounced] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}
