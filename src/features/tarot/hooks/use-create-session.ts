import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { useTarotSessionStore } from "@/stores/use-tarot-session-store";
import type { ApiHttpError } from "@/types/api";
import type { CreateSessionRequest, ReadingSession } from "@/types/tarot";

export function useCreateSession(userId: number | null) {
	const queryClient = useQueryClient();
	const setActiveSession = useTarotSessionStore((s) => s.setActiveSession);
	const setPhase = useTarotSessionStore((s) => s.setPhase);

	return useMutation({
		mutationFn: (req: CreateSessionRequest) =>
			apiRequest<ReadingSession>(API_ENDPOINTS.tarotReadings.createSession, {
				method: "POST",
				body: JSON.stringify(req),
			}).then((r) => r.data),

		onSuccess: (session) => {
			// Set store + navigate (handled by component via router.push)
			setActiveSession(
				session.sessionId,
				session.spreadId,
				session.mode as "EXPLORE" | "YOUR_DECK",
				session.mainQuestion,
			);
			setPhase("SHUFFLING");
			// Invalidate account để refresh guestReadingUsedAt
			queryClient.invalidateQueries({ queryKey: ["account", userId] });
		},

		onError: (error: ApiHttpError) => {
			// 409 handling — path đúng là: error.response.data.data.activeSessionId
			if (error.status !== 409) {
				toast.error(error.message ?? "Không thể tạo reading, thử lại sau.");
			}
		},
	});
}
