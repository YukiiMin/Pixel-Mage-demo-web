import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { ApiHttpError } from "@/types/api";

export function useApproveUnlink(): UseMutationResult<
	void,
	ApiHttpError,
	number
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) =>
			apiRequest<void>(API_ENDPOINTS.staffUnlinkRequests.approve(id), {
				method: "POST",
			}).then(() => undefined),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["unlink-requests"] });
			toast.success("Đã phê duyệt yêu cầu unlink.");
		},
		onError: (error: ApiHttpError) => {
			toast.error(error.message ?? "Không thể phê duyệt. Thử lại sau.");
		},
	});
}
