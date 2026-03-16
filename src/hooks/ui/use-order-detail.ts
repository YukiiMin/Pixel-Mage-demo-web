"use client";

import { useEffect, useState } from "react";
import {
	API_ENDPOINTS,
	apiRequest,
	getStoredAccessToken,
} from "@/lib/api-config";
import { getApiErrorMessage } from "@/types/api";
import type { OrderDetail, OrderItem } from "@/types/order";

export type OrderDetailStatus = "idle" | "loading" | "ready" | "unavailable" | "error";

function normalizeItem(raw: Record<string, unknown>): OrderItem | null {
	const id = String(raw.id ?? raw.orderItemId ?? "").trim();
	if (!id) return null;
	return {
		id,
		packId: String(raw.packId ?? "").trim() || undefined,
		packName: String(raw.packName ?? raw.name ?? "").trim() || undefined,
		quantity: Number(raw.quantity ?? 1) || 1,
		unitPrice: Number(raw.unitPrice ?? raw.price ?? 0) || 0,
		subtotal: Number(raw.subtotal ?? raw.total ?? 0) || 0,
	};
}

function normalizeOrderDetail(payload: unknown, orderId: string): OrderDetail | null {
	const raw = (
		payload && typeof payload === "object"
			? (payload as Record<string, unknown>).data ?? payload
			: null
	) as Record<string, unknown> | null;

	if (!raw) return null;

	const id = String(raw.id ?? raw.orderId ?? orderId).trim();
	const itemsRaw = Array.isArray(raw.items)
		? raw.items
		: Array.isArray(raw.orderItems)
			? raw.orderItems
			: [];

	const items: OrderItem[] = (itemsRaw as unknown[])
		.map((i) => (i && typeof i === "object" ? normalizeItem(i as Record<string, unknown>) : null))
		.filter((i): i is OrderItem => i !== null);

	return {
		id,
		status: String(raw.status ?? "UNKNOWN"),
		paymentStatus: String(raw.paymentStatus ?? "UNKNOWN"),
		paymentMethod: String(raw.paymentMethod ?? "UNKNOWN"),
		totalAmount: Number(raw.totalAmount ?? 0) || 0,
		orderDate: String(raw.orderDate ?? raw.createdAt ?? new Date().toISOString()),
		shippingAddress: String(raw.shippingAddress ?? "").trim() || undefined,
		notes: String(raw.notes ?? "").trim() || undefined,
		updatedAt: String(raw.updatedAt ?? "").trim() || undefined,
		customerId: String(raw.customerId ?? raw.accountId ?? "").trim() || undefined,
		items,
	};
}

export function useOrderDetail(orderId: string) {
	const [order, setOrder] = useState<OrderDetail | null>(null);
	const [status, setStatus] = useState<OrderDetailStatus>("idle");
	const [statusMessage, setStatusMessage] = useState("");

	useEffect(() => {
		if (!orderId) return;
		let active = true;

		const load = async () => {
			setStatus("loading");
			setStatusMessage("Đang tải chi tiết đơn hàng...");

			try {
				const token = getStoredAccessToken() ?? undefined;
				const response = await apiRequest<unknown>(
					API_ENDPOINTS.orderManagement.byId(orderId),
					{ method: "GET", cache: "no-store", token },
				);
				if (!active) return;

				const normalized = normalizeOrderDetail(response.data, orderId);
				if (!normalized) {
					setOrder(null);
					setStatus("unavailable");
					setStatusMessage("BE đã phản hồi nhưng dữ liệu đơn hàng chưa đầy đủ. Chức năng chưa cập nhật.");
					return;
				}

				setOrder(normalized);
				setStatus("ready");
				setStatusMessage("");
			} catch (error) {
				if (!active) return;
				setOrder(null);
				setStatus("unavailable");
				setStatusMessage(`${getApiErrorMessage(error, "Không thể tải đơn hàng từ BE.")} Chức năng chưa cập nhật.`);
			}
		};

		load().catch(() => {
			if (!active) return;
			setStatus("error");
			setStatusMessage("Không thể tải chi tiết đơn hàng.");
		});

		return () => {
			active = false;
		};
	}, [orderId]);

	return { order, status, statusMessage };
}
