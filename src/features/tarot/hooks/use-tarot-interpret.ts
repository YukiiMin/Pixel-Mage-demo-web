import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { InterpretResponse } from "@/types/tarot";

export function useTarotInterpret(sessionId: number | null) {
	return useQuery({
		queryKey: ["tarot-interpret", sessionId],
		queryFn: () =>
			apiRequest<InterpretResponse>(
				API_ENDPOINTS.tarotReadings.interpret(sessionId!),
			).then((r) => r.data),
		enabled: !!sessionId,
	});
}
