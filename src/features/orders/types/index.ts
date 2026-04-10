import type { Pack } from "@/types/commerce";

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

/**
 * PaymentStatus — phải khớp đúng với enum BE PaymentStatus.
 * ⚠️ BE dùng "CANCELLED" (2 chữ L), không phải "CANCELED" (1 chữ L).
 */
export type PaymentStatus =
	| "PENDING"
	| "SUCCEEDED"
	| "FAILED"
	| "CANCELLED"
	| "REQUIRES_ACTION";

/**
 * List view summary returned from GET /api/orders or GET /api/orders/customer/{id}.
 * Maps to BE OrderResponse shape.
 */
export interface OrderResponse {
	orderId: number;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	paymentMethod?: string;
	totalAmount: number;
	discountAmount?: number;
	finalAmount: number;
	shippingAddress?: string;
	notes?: string;
	createdAt?: string;
	orderDate?: string;
}

/**
 * Request body cho POST /api/orders.
 * BE `OrderRequestDTO` nhận `orderItems: List<OrderItemRequestDTO>` — không có `packIds`.
 * customerId được inject từ JWT token bởi BE (Principal), FE không cần gửi.
 */
export interface OrderItemRequest {
	/** Product to purchase — BE will assign a physical Pack after payment succeeds */
	productId: number;
	quantity: number;
	/** unitPrice: giá của product lấy từ ProductResponse.price */
	unitPrice: number;
	/** subtotal = unitPrice * quantity */
	subtotal: number;
	customText?: string;
}

export interface CreateOrderRequest {
	/** Danh sách items — mỗi pack là 1 item với quantity=1 */
	orderItems: OrderItemRequest[];
	/** Tổng tiền trước voucher  */
	totalAmount: number;
	shippingAddress: string;
	/** Phải khớp với enum BE: SEPAY, STRIPE, VNPAY */
	paymentMethod: "SEPAY" | "STRIPE" | "VNPAY";
	voucherCode?: string;
	notes?: string;
}

/**
 * Response từ POST /api/orders — maps to BE OrderResponse.
 */
export interface CreateOrderResponse {
	orderId: number;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	totalAmount: number;
	finalAmount: number;
	discountAmount?: number;
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
	orderItemId: number;
	quantity: number;
	unitPrice: number;
	subtotal: number;
	customText?: string;
	product: {
		productId: number;
		name: string;
		imageUrl: string;
	};
	pack?: {
		packId: number;
		status: string;
	};
}

/**
 * Full order detail từ GET /api/orders/{id} — dùng cho polling payment status.
 * Maps to BE OrderResponse.
 */
export interface OrderDetail {
	orderId: number;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	totalAmount: number;
	finalAmount: number;
	orderItems: OrderItem[];
	createdAt: string;
	notes?: string;
}
