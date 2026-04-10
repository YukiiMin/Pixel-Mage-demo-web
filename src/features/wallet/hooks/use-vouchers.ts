import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type {
	ValidateVoucherRequest,
	ValidateVoucherResponse,
	Voucher,
} from "@/features/profile/types/wallet";

export function useVouchers(userId: number | null) {
	return useQuery({
		queryKey: ["vouchers", userId],
		queryFn: () =>
			apiRequest<Voucher[]>(API_ENDPOINTS.vouchers.my).then((r) => r.data),
		enabled: !!userId,
	});
}

export function useValidateVoucher() {
	return useMutation({
		mutationFn: (data: ValidateVoucherRequest) =>
			apiRequest<ValidateVoucherResponse>(API_ENDPOINTS.vouchers.validate, {
				method: "POST",
				body: JSON.stringify(data),
			}).then((r) => r.data),
	});
}
