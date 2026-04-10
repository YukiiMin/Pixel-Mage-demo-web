import { getCardFrameworks } from "@/features/card-gallery/lib/card-gallery-simple";
import type { CardFramework } from "@/features/card-gallery/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCardFrameworks() {
	const [frameworks, setFrameworks] = useState<CardFramework[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchFrameworks = async () => {
			try {
				const data = await getCardFrameworks();
				setFrameworks(data);
			} catch (error) {
				toast.error("Không thể tải bộ sưu tập");
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchFrameworks();
	}, []);

	return { frameworks, loading };
}
