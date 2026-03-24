import type { Pack } from "./commerce";

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface CreateOrderRequest {
	packId: number;
	quantity: number;
	note?: string;
}

export interface CreateOrderResponse {
	orderId: number;
	status: OrderStatus;
	totalAmount: number;
}

export interface InitiatePaymentRequest {
	orderId: number;
	amount: number;
	currency: string;
}

export interface InitiatePaymentResponse {
	paymentUrl: string;
	isRedirect: boolean;
}

export interface OrderItem {
	id: number;
	pack: Pack;
	quantity: number;
	unitPrice: number;
}

export interface OrderDetail {
	orderId: number;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	totalAmount: number;
	orderItems: OrderItem[];
	createdAt: string;
	note?: string;
}
