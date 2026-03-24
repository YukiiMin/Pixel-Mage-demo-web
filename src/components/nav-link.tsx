"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
	activeClassName?: string;
}

/**
 * NavLink — Next.js version của react-router-dom NavLink.
 * Tự detect active state qua usePathname().
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
	({ className, activeClassName, href, ...props }, ref) => {
		const pathname = usePathname();
		const isActive = pathname === href?.toString();

		return (
			<Link
				ref={ref}
				href={href}
				className={cn(className, isActive && activeClassName)}
				{...props}
			/>
		);
	},
);

NavLink.displayName = "NavLink";

export { NavLink };
