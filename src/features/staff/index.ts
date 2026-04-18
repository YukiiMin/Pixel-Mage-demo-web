/**
 * 🌟 PUBLIC API CỦA FEATURE STAFF
 * Chỉ export các Page Components và Shell dùng cho page.tsx ở tầng app/.
 * ❌ TUYỆT ĐỐI KHÔNG deep import: import X from '@/features/staff/components/...'
 */

// ── Layout Shell ─────────────────────────────────────────────────────────────

// ── Admin Pages ───────────────────────────────────────────────────────────────
export { AdminDashboard } from "./components/admin-dashboard";
export { AdminAccountsPage } from "./components/admin-accounts-page";
export { AdminCardsPage } from "./components/admin-cards-page";
export { AdminAchievementsPage } from "./components/admin-achievements-page";
export { AdminAnalytics } from "./components/admin-analytics";
export { AdminCollectionsPage } from "./components/admin-collections-page";
export { AdminPhysicalCardsPage } from "./components/admin-physical-cards-page";
export { AdminVouchersPage } from "./components/admin-vouchers-page";
export { AdminWalletPage } from "./components/admin-wallet-page";
export { AdminPackMonitoring } from "./components/admin-pack-monitoring";
export { AdminPackCategoriesPage } from "./components/admin-pack-categories-page";
export { AdminProductPackHub } from "./components/admin-product-pack-hub";

// ── Staff Pages ───────────────────────────────────────────────────────────────
export { GachaPoolManagement } from "./components/gacha-pool-management";
export { UnlinkRequestsPageClient } from "./components/unlink-requests-page";
