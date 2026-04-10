"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import Link from "next/link";
import {
	authDropdownLinks,
	publicNavLinks,
	resolveSectionHref,
	staffNavLinks,
} from "./_config";

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
	pathname: string;
	isAuth: boolean;
	userRole: string | null;
	displayName: string;
	userEmail: string;
	initials: string;
	avatarUrl: string | null;
	mappedSectionLinks: Array<{ label: string; hash: string; href: string }>;
	onLogout: () => void;
}

const MobileMenu = ({
	isOpen,
	onClose,
	pathname,
	isAuth,
	userRole,
	displayName,
	userEmail,
	initials,
	avatarUrl,
	mappedSectionLinks,
	onLogout,
}: MobileMenuProps) => (
	<AnimatePresence>
		{isOpen && (
			<motion.div
				id="mobile-menu"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl"
				onClick={(event) => {
					if (event.target === event.currentTarget) onClose();
				}}
			>
				<div
					className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 overflow-y-auto py-20"
					role="dialog"
					aria-modal="true"
					aria-label="Mobile navigation"
				>
					<button
						type="button"
						onClick={onClose}
						className="absolute right-6 top-6 rounded-lg border border-border/60 p-2 text-foreground"
						aria-label="Đóng menu"
					>
						<X size={20} />
					</button>

					{/* User info when logged in */}
					{isAuth && (
						<div className="flex flex-col items-center gap-1 mb-2">
							{avatarUrl ? (
								<img
									src={avatarUrl}
									alt={displayName}
									className="w-12 h-12 rounded-full object-cover"
								/>
							) : (
								<span className="flex items-center justify-center w-12 h-12 rounded-full gradient-gold-purple-bg text-lg font-bold text-primary-foreground select-none">
									{initials}
								</span>
							)}
							<span className="text-base font-semibold text-foreground">
								{displayName}
							</span>
							{userEmail && (
								<span className="text-xs text-muted-foreground">
									{userEmail}
								</span>
							)}
						</div>
					)}

					{/* Section links */}
					{mappedSectionLinks.map((item) => (
						<Link
							key={item.hash}
							href={item.href}
							onClick={onClose}
							className="text-2xl font-heading text-foreground hover:text-primary transition-colors"
						>
							{item.label}
						</Link>
					))}

					{/* Public nav links (Marketplace) */}
					<div className="h-px w-32 bg-border/50" />
					{publicNavLinks.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							onClick={onClose}
							className={`text-2xl font-heading transition-colors hover:text-primary ${
								pathname.startsWith(item.href)
									? "text-primary"
									: "text-foreground"
							}`}
						>
							{item.label}
						</Link>
					))}

					{/* Auth links or login/register */}
					{isAuth ? (
						<>
							<div className="h-px w-32 bg-border/50" />
							{(userRole === "STAFF" || userRole === "ADMIN") && (
								<>
									{staffNavLinks.map((item) => (
										<Link
											key={item.href}
											href={item.href}
											onClick={onClose}
											className={`text-2xl font-heading transition-colors hover:text-primary ${
												pathname === item.href
													? "text-primary"
													: "text-foreground"
											}`}
										>
											{item.label}
										</Link>
									))}
									<div className="h-px w-32 bg-border/50" />
								</>
							)}
							{authDropdownLinks.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={onClose}
									className={`text-2xl font-heading transition-colors hover:text-primary ${
										pathname === item.href ? "text-primary" : "text-foreground"
									}`}
								>
									{item.label}
								</Link>
							))}
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<button
										type="button"
										className="text-xl font-heading text-destructive hover:opacity-80 transition-opacity flex items-center gap-2"
									>
										<LogOut size={18} />
										Đăng xuất
									</button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Xác nhận đăng xuất?</AlertDialogTitle>
										<AlertDialogDescription>
											Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel onClick={onClose}>Hủy</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => {
												onClose();
												onLogout();
											}}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										>
											Đăng xuất
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</>
					) : (
						<>
							<Link
								href="/login"
								onClick={onClose}
								className="text-2xl font-heading text-foreground hover:text-primary transition-colors"
							>
								Đăng Nhập
							</Link>
							<Link
								href="/register"
								onClick={onClose}
								className="text-2xl font-heading text-foreground hover:text-primary transition-colors"
							>
								Đăng Ký
							</Link>
						</>
					)}

					<Link
						href={resolveSectionHref(pathname, "#download")}
						onClick={onClose}
						className="rounded-full bg-linear-to-r from-yellow-400 to-amber-500 px-8 py-3 font-semibold text-black"
					>
						🔮 Tải Ngay
					</Link>
				</div>
			</motion.div>
		)}
	</AnimatePresence>
);

export default MobileMenu;
