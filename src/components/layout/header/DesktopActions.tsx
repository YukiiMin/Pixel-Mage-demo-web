"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authDropdownLinks, resolveSectionHref } from "./_config";

interface DesktopActionsProps {
	pathname: string;
	isAuth: boolean;
	displayName: string;
	userEmail: string;
	initials: string;
	onLogout: () => void;
}

const DesktopActions = ({
	pathname,
	isAuth,
	displayName,
	userEmail,
	initials,
	onLogout,
}: DesktopActionsProps) => (
	<div className="hidden md:flex items-center gap-3">
		{isAuth ? (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
					>
						<span className="flex items-center justify-center w-7 h-7 rounded-full gradient-gold-purple-bg text-xs font-bold text-primary-foreground select-none">
							{initials}
						</span>
						<span className="max-w-30 truncate">{displayName}</span>
						<ChevronDown size={14} className="text-muted-foreground" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-52">
					<DropdownMenuLabel className="flex flex-col gap-0.5">
						<span className="font-semibold truncate">{displayName}</span>
						{userEmail && (
							<span className="text-xs font-normal text-muted-foreground truncate">
								{userEmail}
							</span>
						)}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{authDropdownLinks.map((item) => (
						<DropdownMenuItem key={item.href} asChild>
							<Link
								href={item.href}
								className={`flex items-center gap-2 ${
									pathname === item.href ? "text-primary" : ""
								}`}
							>
								<item.icon size={15} />
								{item.label}
							</Link>
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive focus:text-destructive cursor-pointer"
						onClick={onLogout}
					>
						<LogOut size={15} className="mr-2" />
						Đăng xuất
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		) : (
			<>
				<Link
					href="/login"
					className="text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-5 py-2 transition-colors"
				>
					Đăng Nhập
				</Link>
				<Link
					href="/register"
					className="text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-5 py-2 transition-colors"
				>
					Đăng Ký
				</Link>
			</>
		)}
		<Link
			href={resolveSectionHref(pathname, "#download")}
			className="text-sm font-semibold gradient-gold-purple-bg text-primary-foreground rounded-full px-5 py-2 glow-gold transition-transform hover:scale-105"
		>
			🔮 Tải Ngay
		</Link>
	</div>
);

export default DesktopActions;
