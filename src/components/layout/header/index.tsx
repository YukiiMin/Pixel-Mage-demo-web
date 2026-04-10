"use client";

import { useProfile } from "@/features/auth/hooks/use-auth";
import {
	clearStoredAuthSession,
	getStoredUserId,
	getStoredUserRole,
	hasStoredAuthSession,
	setStoredAuthSession,
} from "@/lib/api-config";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getInitials, resolveSectionHref, sectionLinks } from "./_config";
import DesktopActions from "./desktop-actions";
import DesktopNav from "./desktop-nav";
import HeaderLogo from "./header-logo";
import MobileMenu from "./mobile-menu";

const Header = () => {
	const pathname = usePathname();
	const router = useRouter();

	const [scrolled, setScrolled] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [activeHash, setActiveHash] = useState("");
	const [isAuth, setIsAuth] = useState(false);
	const [userRole, setUserRole] = useState<string | null>(null);
	const [userId, setUserId] = useState<number | null>(null);
	const lastYRef = useRef(0);

	// Fetch real profile for name/email display
	const { data: profileData } = useProfile(isAuth ? userId : null);

	// --- Auth sync ---
	const syncAuthState = useCallback(() => {
		const authed = hasStoredAuthSession();
		setIsAuth(authed);
		if (authed) {
			setUserRole(getStoredUserRole());
			setUserId(getStoredUserId());
		} else {
			setUserRole(null);
			setUserId(null);
		}
	}, []);

	const handleLogout = useCallback(() => {
		void fetch("/api/auth/logout", { method: "POST", cache: "no-store" })
			.catch(() => {
				// Ignore network errors; clear client auth state regardless.
			})
			.finally(() => {
				clearStoredAuthSession();
				syncAuthState();
				router.push("/");
			});
	}, [router, syncAuthState]);

	useEffect(() => {
		syncAuthState();
		window.addEventListener("storage", syncAuthState);
		return () => {
			window.removeEventListener("storage", syncAuthState);
		};
	}, [syncAuthState]);

	// --- Sync role/ID from profile when it lands ---
	useEffect(() => {
		if (profileData) {
			const profileRole = profileData.role || null;
			const profileId = profileData.customerId || null;

			if (profileRole && profileRole !== userRole) {
				setUserRole(profileRole);
			}
			if (profileId && profileId !== userId) {
				setUserId(profileId);
			}

			// Only sync back if values meaningfully differ from markers
			// (prevents redundant cookie writes and potential loops)
			if (profileId && (profileId !== userId || profileRole !== userRole)) {
				setStoredAuthSession(profileId, profileRole || undefined);
			}
		}
	}, [profileData, userRole, userId]);

	// --- Scroll hide ---
	useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY;
			const shouldHide = y > 100 && y > lastYRef.current;
			setScrolled(y > 60);
			setHidden(mobileOpen ? false : shouldHide);
			lastYRef.current = y;
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [mobileOpen]);

	// --- Hash tracking ---
	useEffect(() => {
		const syncHash = () => setActiveHash(window.location.hash || "");
		syncHash();
		window.addEventListener("hashchange", syncHash);
		return () => window.removeEventListener("hashchange", syncHash);
	}, []);

	// --- Mobile menu body lock + ESC ---
	useEffect(() => {
		if (!mobileOpen) {
			document.body.style.overflow = "";
			return;
		}
		document.body.style.overflow = "hidden";
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setMobileOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [mobileOpen]);

	const mappedSectionLinks = useMemo(
		() =>
			sectionLinks.map((item) => ({
				...item,
				href: resolveSectionHref(pathname, item.hash),
			})),
		[pathname],
	);

	// ✅ Dùng tên/email/avatar thật từ profile API
	const displayName = profileData?.name || profileData?.email || "";
	const userEmail = profileData?.email || "";
	const initials = displayName ? getInitials(displayName) : "??";
	const avatarUrl = profileData?.avatarUrl || null;

	return (
		<>
			<motion.header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					scrolled ? "glass-nav py-3" : "py-5"
				} ${hidden ? "-translate-y-full" : "translate-y-0"}`}
			>
				<div className="container mx-auto px-6 flex items-center justify-between">
					<HeaderLogo />

					<DesktopNav
						pathname={pathname}
						activeHash={activeHash}
						mappedSectionLinks={mappedSectionLinks}
					/>

					<DesktopActions
						pathname={pathname}
						isAuth={isAuth}
						userRole={userRole}
						displayName={displayName}
						userEmail={userEmail}
						initials={initials}
						avatarUrl={avatarUrl}
						onLogout={handleLogout}
					/>

					{/* Mobile hamburger */}
					<button
						type="button"
						className="md:hidden text-foreground rounded-lg border border-border/60 p-2"
						onClick={() => setMobileOpen((prev) => !prev)}
						aria-expanded={mobileOpen}
						aria-controls="mobile-menu"
						aria-label={
							mobileOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"
						}
					>
						{mobileOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</motion.header>

			<MobileMenu
				isOpen={mobileOpen}
				onClose={() => setMobileOpen(false)}
				pathname={pathname}
				isAuth={isAuth}
				userRole={userRole}
				displayName={displayName}
				userEmail={userEmail}
				initials={initials}
				avatarUrl={avatarUrl}
				mappedSectionLinks={mappedSectionLinks}
				onLogout={handleLogout}
			/>
		</>
	);
};

export default Header;
