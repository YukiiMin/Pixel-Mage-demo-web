/**
 * 🌟 PUBLIC API CỦA FEATURE NOTIFICATIONS
 * Chỉ export các Components dùng bên ngoài feature này (ví dụ: trong Header).
 * ❌ TUYỆT ĐỐI KHÔNG deep import: import X from '@/features/notifications/components/...'
 */

// ── Shared Components (dùng trong layout/header) ──────────────────────────────
export { NotificationBell } from "./components/notification-bell";
