"use client";

import Link from "next/link";
import { publicNavLinks, resolveSectionHref } from "./_config";

interface DesktopNavProps {
	pathname: string;
}

const DesktopNav = ({ pathname }: DesktopNavProps) => (
	<nav className="hidden md:flex items-center gap-8">
		{publicNavLinks.map((item) => (
			<Link
				key={item.href}
				href={item.href}
				className={`text-sm font-medium transition-colors ${
					pathname.startsWith(item.href)
						? "text-primary"
						: "text-muted-foreground hover:text-primary"
				}`}
			>
				{item.label}
			</Link>
		))}
	</nav>
);

export default DesktopNav;
