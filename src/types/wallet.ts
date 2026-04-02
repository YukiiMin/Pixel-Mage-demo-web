export interface WalletBalance {
	id?: number;
	customerId?: number;
	balance: number;
	canRedeemVoucher: boolean;
	pointsToNextVoucher: number;
	userId?: number;
}

export interface Voucher {
	voucherId: number;
	code: string;
	discountPct: number;
	maxDiscountVnd: number;
	expiresAt: string;
	isUsed: boolean;
	isExpired: boolean;
	daysUntilExpiry: number;
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
