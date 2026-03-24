export interface WalletBalance {
	id?: number;
	customerId?: number;
	pmPoint: number;
	userId?: number;
}

export interface Voucher {
	id: number;
	code: string;
	discountAmount?: number;
	discountPercentage?: number;
	minOrderTotal?: number;
	description?: string;
	validUntil?: string;
	status?: "ACTIVE" | "USED" | "EXPIRED";
}

export interface ValidateVoucherRequest {
	code: string;
	orderTotal: number;
}

export interface ValidateVoucherResponse {
	isValid: boolean;
	discountAmount: number;
	finalTotal: number;
	message?: string;
}
