import type { Pack } from "./commerce";

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REQUIRES_ACTION";

export interface OrderResponse {
    orderId: number;
    accountName?: string;
    customerName?: string; // in case BE uses it
    finalAmount: number;
    status: OrderStatus;
    createdAt?: string;
}

export interface CreateOrderRequest {
	packIds: number[];
	shippingAddress: string;
	paymentMethod: "SEPAY" | "STRIPE" | "VNPAY";
	voucherCode?: string;
	notes?: string;
}

export interface CreateOrderResponse {
	orderId: number;
	status: OrderStatus;
	totalAmount: number;
	paymentQrUrl?: string;
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
