import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type {
	InitiatePaymentRequest,
	InitiatePaymentResponse,
} from "@/features/orders/types";

// Bước 2 của checkout: lấy paymentUrl từ SEPay
export function useInitiatePayment() {
	return useMutation({
		mutationFn: (req: InitiatePaymentRequest) =>
			apiRequest<InitiatePaymentResponse>(
				`${API_ENDPOINTS.paymentManagement.initiate}?gateway=sepay`,
				{ method: "POST", body: JSON.stringify(req) },
			).then((r) => r.data),
	});
}
