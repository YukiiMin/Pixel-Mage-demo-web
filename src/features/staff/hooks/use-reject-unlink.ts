import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { ApiHttpError } from "@/types/api";
import type { RejectUnlinkPayload } from "@/features/staff/types/unlink";

interface RejectUnlinkArgs {
	id: number;
	staffNote: string;
}

export function useRejectUnlink(): UseMutationResult<
	void,
	ApiHttpError,
	RejectUnlinkArgs
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, staffNote }: RejectUnlinkArgs) =>
			apiRequest<void>(API_ENDPOINTS.staffUnlinkRequests.reject(id), {
				method: "POST",
				body: JSON.stringify({ staffNote } satisfies RejectUnlinkPayload),
			}).then(() => undefined),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["unlink-requests"] });
			toast.success("Đã từ chối yêu cầu unlink.");
		},
		onError: (error: ApiHttpError) => {
			toast.error(error.message ?? "Không thể từ chối. Thử lại sau.");
		},
	});
}
