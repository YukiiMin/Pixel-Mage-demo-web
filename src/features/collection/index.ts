/**
 * 🌟 PUBLIC API CỦA FEATURE COLLECTION
 * Chỉ export các Page Components dùng cho page.tsx ở tầng app/.
 * ❌ TUYỆT ĐỐI KHÔNG deep import: import X from '@/features/collection/components/...'
 */

// ── Page Components ───────────────────────────────────────────────────────────
export { AchievementsPageClient } from "./components/achievements-page";
export { StoriesPageClient } from "./components/stories-page";
export { StoryDetailPageClient } from "./components/story-detail-page";
