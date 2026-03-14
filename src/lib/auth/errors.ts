import { ApiError } from "@/lib/api/http";

export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof ApiError) {
		const payload = error.data;

		if (payload && typeof payload === "object") {
			if ("message" in payload && typeof payload.message === "string") {
				return payload.message;
			}

			if ("error" in payload && typeof payload.error === "string") {
				return payload.error;
			}
		}

		if (typeof payload === "string" && payload.trim().length > 0) {
			return payload;
		}

		if (error.status === 401) {
			return "Session is invalid or expired. Please sign in again.";
		}
	}

	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message;
	}

	return fallback;
}
