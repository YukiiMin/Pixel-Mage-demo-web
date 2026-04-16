/**
 * 🌟 PUBLIC API CỦA FEATURE LANDING
 * Chỉ export các Section Components dùng cho app/page.tsx.
 * ❌ TUYỆT ĐỐI KHÔNG deep import: import X from '@/features/landing/components/...'
 */

// ── Landing Sections ──────────────────────────────────────────────────────────
export { default as HeroSection } from "./components/hero-section";
export { default as FeaturedSection } from "./components/featured-section";
export { default as HowItWorks } from "./components/how-it-works";
export { default as DownloadSection } from "./components/download-section";

// ── Landing UI Utilities ──────────────────────────────────────────────────────
export { default as LandingSidebarNav } from "./components/landing-sidebar-nav";
export {
	ScrollSectionWrapper,
	ScrollSectionItem,
} from "./components/scroll-section-wrapper";
