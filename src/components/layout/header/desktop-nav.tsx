"use client";

import Link from "next/link";
import { publicNavLinks, resolveSectionHref } from "./_config";

interface DesktopNavProps {
	pathname: string;
	activeHash: string;
	mappedSectionLinks: Array<{ label: string; hash: string; href: string }>;
}

const DesktopNav = ({
	pathname,
	activeHash,
	mappedSectionLinks,
}: DesktopNavProps) => (
	<nav className="hidden md:flex items-center gap-8">
		{mappedSectionLinks.map((item) => (
			<Link
				key={item.hash}
				href={item.href}
				className={`text-sm font-medium transition-colors ${
					activeHash === item.hash && pathname === "/"
						? "text-primary"
						: "text-muted-foreground hover:text-primary"
				}`}
			>
				{item.label}
			</Link>
		))}

		{/* Divider */}
		<span className="h-4 w-px bg-border/60" aria-hidden="true" />

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
