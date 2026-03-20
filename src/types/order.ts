export interface OrderListItem {
	id: string;
	status: string;
	paymentStatus: string;
	paymentMethod: string;
	totalAmount: number;
	orderDate: string;
	shippingAddress?: string;
	notes?: string;
}

export interface OrderItem {
	id: string;
	packId?: string;
	packName?: string;
	quantity: number;
	unitPrice: number;
	subtotal: number;
}

export interface OrderDetail extends OrderListItem {
	updatedAt?: string;
	customerId?: string;
	items: OrderItem[];
}
