import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { useTarotSessionStore } from "@/features/tarot/stores/use-tarot-session-store";
import type { ApiHttpError } from "@/types/api";

export function useCancelSession(userId: number | null) {
	const queryClient = useQueryClient();
	const clearSession = useTarotSessionStore((s) => s.clearSession);

	return useMutation({
		mutationFn: (sessionId: number) =>
			apiRequest(API_ENDPOINTS.tarotReadings.cancelSession(sessionId), {
				method: "DELETE",
			}),

		onSuccess: () => {
			clearSession();
			// Optionally invalidate account query if needed
			if (userId) {
				queryClient.invalidateQueries({ queryKey: ["account", userId] });
			}
		},

		onError: (error: ApiHttpError) => {
			toast.error(error.message ?? "Không thể hủy trải bài, thử lại sau.");
		},
	});
}
