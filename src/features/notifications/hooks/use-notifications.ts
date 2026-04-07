import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPusher } from "@/lib/pusher";
import type { Channel } from "pusher-js";

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

    const pusher = getPusher();
    const channels: Channel[] = [];

    const handleEvent = (eventType: string, data: any) => {
      const payload = data?.payload ?? {};
      const messageMap: Record<string, { title: string; message: string }> = {
        NEW_USER_REGISTERED: {
          title: "Người dùng mới",
          message: `${payload.name ?? "Ai đó"} (${payload.email ?? ""}) vừa đăng ký.`,
        },
        ORDER_PAID: {
          title: "Đơn hàng mới",
          message: `Đơn #${payload.orderId} — ${payload.amount} VNĐ vừa thanh toán thành công.`,
        },
        ORDER_STATUS_CHANGED: {
          title: "Cập nhật đơn hàng",
          message: `Đơn #${payload.orderId} chuyển: ${payload.status ?? ""}`,
        },
        PAYMENT_CONFIRMED: {
          title: "Thanh toán thành công ✅",
          message: `Đơn #${payload.orderId} đã được xác nhận.`,
        },
        TAROT_SESSION_STARTED: {
          title: "Phiên Tarot bắt đầu",
          message: `Phiên #${payload.sessionId} — ${payload.spreadName ?? ""}`,
        },
        TAROT_SESSION_COMPLETED: {
          title: "Phiên Tarot hoàn thành",
          message: `Phiên #${payload.sessionId} đã xong.`,
        },
      };

      const display = messageMap[eventType] ?? {
        title: data?.title ?? "Thông báo mới",
        message: data?.message ?? "Bạn có thông báo từ hệ thống",
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
    };

    // Subscribe to admin channel
    if (role === "ADMIN" || role === "STAFF") {
      const adminCh = pusher.subscribe("admin.notifications");
      // Listen to all event types we care about
      const adminEvents = [
        "NEW_USER_REGISTERED", "ORDER_PAID", "TAROT_SESSION_STARTED", "TAROT_SESSION_COMPLETED"
      ];
      adminEvents.forEach((evt) => adminCh.bind(evt, (data: any) => handleEvent(evt, data)));
      channels.push(adminCh);
    }

    // Subscribe to public user channel (simplest without auth endpoint)
    if (userId) {
      const userCh = pusher.subscribe(`user.${userId}`);
      const userEvents = ["PAYMENT_CONFIRMED", "ORDER_STATUS_CHANGED", "NFC_LINKED", "NFC_UNLINKED"];
      userEvents.forEach((evt) => userCh.bind(evt, (data: any) => handleEvent(evt, data)));
      channels.push(userCh);
    }

    return () => {
      channels.forEach((ch) => ch.unbind_all());
      channels.forEach((ch) => pusher.unsubscribe(ch.name));
    };
  }, [role, userId]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
