"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	clearStoredAuthSession,
	getStoredAccessToken,
	getStoredUserId,
} from "@/lib/api-config";
import { getInitials, resolveSectionHref, sectionLinks } from "./_config";
import DesktopActions from "./DesktopActions";
import DesktopNav from "./DesktopNav";
import HeaderLogo from "./HeaderLogo";
import MobileMenu from "./MobileMenu";

const Header = () => {
	const pathname = usePathname();
	const router = useRouter();

	const [scrolled, setScrolled] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [activeHash, setActiveHash] = useState("");
	const [isAuth, setIsAuth] = useState(false);
	const [userName, setUserName] = useState("");
	const [userEmail, setUserEmail] = useState("");
	const lastYRef = useRef(0);

	// --- Auth sync ---
	const syncAuthState = useCallback(() => {
		const token = getStoredAccessToken();
		const userId = getStoredUserId();
		const authed = Boolean(token) && Boolean(userId);
		setIsAuth(authed);
		if (authed) {
			setUserName(window.localStorage.getItem("name") ?? "");
			setUserEmail(window.localStorage.getItem("email") ?? "");
		} else {
			setUserName("");
			setUserEmail("");
		}
	}, []);

	const handleLogout = useCallback(() => {
		clearStoredAuthSession();
		syncAuthState();
		router.push("/");
	}, [router, syncAuthState]);

	useEffect(() => {
		syncAuthState();
		window.addEventListener("storage", syncAuthState);
		return () => window.removeEventListener("storage", syncAuthState);
	}, [syncAuthState]);

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

	const displayName = userName || "Người dùng";
	const initials = getInitials(displayName);

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
						displayName={displayName}
						userEmail={userEmail}
						initials={initials}
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
				displayName={displayName}
				userEmail={userEmail}
				initials={initials}
				mappedSectionLinks={mappedSectionLinks}
				onLogout={handleLogout}
			/>
		</>
	);
};

export default Header;
