import { useEffect, useState } from "react";
import { toast } from "sonner";
import { webSocketService } from "@/lib/websocket";

export interface NotificationMsg {
	id: string;
	title: string;
	message: string;
	type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
	timestamp: string;
	read: boolean;
}

export function useNotifications(role?: string, userId?: number | null) {
	const [notifications, setNotifications] = useState<NotificationMsg[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (!role) return;

		webSocketService.connect(() => {
			let destination = "";
			if (role === "ADMIN" || role === "STAFF") {
				// BE Contract Part 3: Admin/Staff topic is /topic/admin/dashboard
				destination = "/topic/admin/dashboard";
			} else if (userId) {
				destination = `/user/${userId}/queue/notifications`;
			}

			if (destination) {
				webSocketService.subscribe(destination, (data: any) => {
					// BE Contract Part 3 — NotificationEvent shape:
					// { type: string, userId: number|null, payload: Record<string, any>, timestamp?: string }
					const eventType: string = data?.type ?? "INFO";
					const payload = data?.payload ?? {};

					// Map event types to human-readable Vietnamese messages
					const messageMap: Record<string, { title: string; message: string }> =
						{
							NEW_USER_REGISTERED: {
								title: "Người dùng mới",
								message: `${payload.name ?? "Ai đó"} (${payload.email ?? ""}) vừa đăng ký.`,
							},
							ORDER_STATUS_CHANGED: {
								title: "Cập nhật đơn hàng",
								message: `Đơn #${payload.orderId} chuyển trạng thái: ${payload.status ?? ""}`,
							},
							PAYMENT_CONFIRMED: {
								title: "Thanh toán thành công",
								message: `Đơn #${payload.orderId} đã được thanh toán.`,
							},
							TAROT_SESSION_STARTED: {
								title: "Phiên Tarot bắt đầu",
								message: `Phiên #${payload.sessionId} — ${payload.spreadName ?? ""} (${payload.mode ?? ""})`,
							},
							TAROT_SESSION_COMPLETED: {
								title: "Phiên Tarot hoàn thành",
								message: `Phiên #${payload.sessionId} đã hoàn thành.`,
							},
						};

					const display = messageMap[eventType] ?? {
						title: data?.title ?? "Thông báo mới",
						message: data?.message ?? "Bạn có một thông báo từ hệ thống",
					};

					const newNotif: NotificationMsg = {
						id: String(Date.now()),
						title: display.title,
						message: display.message,
						type: (["INFO", "SUCCESS", "WARNING", "ERROR"].includes(eventType)
							? eventType
							: "INFO") as NotificationMsg["type"],
						timestamp: data?.timestamp ?? new Date().toISOString(),
						read: false,
					};

					setNotifications((prev) => [newNotif, ...prev]);
					setUnreadCount((c) => c + 1);

					toast(newNotif.title, { description: newNotif.message });
				});
			}
		});

		return () => {
			webSocketService.disconnect();
		};
	}, [role, userId]);

	const markAsRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
		);
		setUnreadCount((c) => Math.max(0, c - 1));
	};

	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		setUnreadCount(0);
	};

	return { notifications, unreadCount, markAsRead, markAllAsRead };
}
