/**
 * 🌟 PUBLIC API CỦA FEATURE AUTH
 * Chỉ export các Page Components và Hooks dùng cho page.tsx ở tầng app/.
 * ❌ TUYỆT ĐỐI KHÔNG deep import: import X from '@/features/auth/components/...'
 */

// ── Page Components ───────────────────────────────────────────────────────────
export { LoginForm } from "./components/login-form";
export { RegisterForm } from "./components/register-form";

// ── Hooks (dùng trong page.tsx cho forgot/reset password flows) ───────────────
export { useForgotPassword, useResetPassword } from "./hooks/use-auth";
