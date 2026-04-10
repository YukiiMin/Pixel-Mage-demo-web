"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { toast } from "sonner";

interface ToggleStatusInput {
	accountId: number | string;
	email: string;
	currentActive: boolean;
}

async function toggleStatus(input: ToggleStatusInput): Promise<void> {
	await apiRequest(
		API_ENDPOINTS.accountManagement.toggleStatus(input.accountId),
		{
			method: "PATCH",
		},
	);
}

export function useToggleAccountStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: toggleStatus,
		onSuccess: (_data, variables) => {
			const { currentActive, email } = variables;
			toast.success(
				currentActive ? `Đã vô hiệu hoá ${email}` : `Đã kích hoạt ${email}`,
			);
			// Invalidate accounts list to refresh
			queryClient.invalidateQueries({ queryKey: ["accounts", "list"] });
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error ? error.message : "Thao tác thất bại";
			toast.error(message);
		},
	});
}
