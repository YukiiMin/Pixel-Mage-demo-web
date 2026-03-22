"use client";

import { useEffect, useMemo, useState } from "react";
import {
	API_ENDPOINTS,
	apiRequest,
	ensureStoredUserId,
} from "@/lib/api-config";
import { getApiErrorMessage } from "@/types/api";
import type { OrderListItem } from "@/types/order";

export type OrdersStatus =
	| "idle"
	| "loading"
	| "ready"
	| "unavailable"
	| "error";

function normalizeOrders(payload: unknown): OrderListItem[] {
	const source = Array.isArray(payload)
		? payload
		: payload && typeof payload === "object"
			? ((payload as { data?: unknown; items?: unknown }).data ??
				(payload as { data?: unknown; items?: unknown }).items)
			: undefined;

	if (!Array.isArray(source)) {
		return [];
	}

	return source
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}
			const raw = item as Record<string, unknown>;
			const id = String(raw.id ?? raw.orderId ?? "").trim();
			if (!id) {
				return null;
			}

			const shippingAddress = String(raw.shippingAddress ?? "").trim();
			const notes = String(raw.notes ?? "").trim();

			const order: OrderListItem = {
				id,
				status: String(raw.status ?? "UNKNOWN"),
				paymentStatus: String(raw.paymentStatus ?? "UNKNOWN"),
				paymentMethod: String(raw.paymentMethod ?? "UNKNOWN"),
				totalAmount: Number(raw.totalAmount ?? 0) || 0,
				orderDate: String(
					raw.orderDate ?? raw.createdAt ?? new Date().toISOString(),
				),
			};

			if (shippingAddress) {
				order.shippingAddress = shippingAddress;
			}
			if (notes) {
				order.notes = notes;
			}

			return order;
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);
}

export function useOrders() {
	const [orders, setOrders] = useState<OrderListItem[]>([]);
	const [status, setStatus] = useState<OrdersStatus>("idle");
	const [statusMessage, setStatusMessage] = useState("");

	useEffect(() => {
		let active = true;

		const loadOrders = async () => {
			setStatus("loading");
			setStatusMessage("Đang tải đơn hàng từ hệ thống...");

			const userId = await ensureStoredUserId();
			if (!userId) {
				if (!active) return;
				setOrders([]);
				setStatus("unavailable");
				setStatusMessage(
					"Chưa xác định được user hiện tại. Chức năng Orders chưa cập nhật cho phiên này.",
				);
				return;
			}

			try {
				const response = await apiRequest<unknown>(
					API_ENDPOINTS.orderManagement.byCustomer(userId),
					{
						method: "GET",
						cache: "no-store",
					},
				);
				if (!active) return;

				const normalized = normalizeOrders(response.data);
				if (normalized.length === 0) {
					setOrders([]);
					setStatus("unavailable");
					setStatusMessage(
						"BE đã phản hồi nhưng chưa có dữ liệu đơn hàng. Chức năng chưa cập nhật.",
					);
					return;
				}

				setOrders(normalized);
				setStatus("ready");
				setStatusMessage("");
			} catch (error) {
				if (!active) return;
				setOrders([]);
				setStatus("unavailable");
				setStatusMessage(
					`${getApiErrorMessage(error, "Không thể tải Orders từ BE.")} Chức năng chưa cập nhật.`,
				);
			}
		};

		loadOrders().catch(() => {
			if (!active) return;
			setOrders([]);
			setStatus("error");
			setStatusMessage("Không thể tải Orders từ BE.");
		});

		return () => {
			active = false;
		};
	}, []);

	const totalPaid = useMemo(
		() =>
			orders
				.filter((order) => order.paymentStatus.toUpperCase() === "PAID")
				.reduce((sum, order) => sum + order.totalAmount, 0),
		[orders],
	);

	return {
		orders,
		status,
		statusMessage,
		stats: {
			totalOrders: orders.length,
			totalPaid,
		},
	};
}
