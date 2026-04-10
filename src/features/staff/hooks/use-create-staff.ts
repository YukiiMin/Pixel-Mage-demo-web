"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { toast } from "sonner";

export interface CreateStaffInput {
	email: string;
	name: string;
	password: string;
	phoneNumber?: string;
}

async function createStaff(input: CreateStaffInput): Promise<void> {
	await apiRequest(API_ENDPOINTS.accountManagement.createStaff, {
		method: "POST",
		body: JSON.stringify({
			email: input.email.trim(),
			name: input.name.trim() || "Staff Member",
			password: input.password,
			phoneNumber: input.phoneNumber?.trim() || undefined,
		}),
	});
}

export function useCreateStaff() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createStaff,
		onSuccess: () => {
			toast.success("Tạo tài khoản Staff thành công");
			// Invalidate accounts list to refresh
			queryClient.invalidateQueries({ queryKey: ["accounts", "list"] });
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error
					? error.message
					: "Không thể tạo tài khoản staff";
			toast.error(message);
		},
	});
}
