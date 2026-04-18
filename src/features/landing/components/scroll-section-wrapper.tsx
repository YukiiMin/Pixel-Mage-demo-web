"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "left" | "right" | "scale";

const variantMap: Record<Direction, Variants> = {
	up: {
		hidden: { opacity: 0, y: 50, filter: "blur(8px)" },
		visible: {
			opacity: 1,
			y: 0,
			filter: "blur(0px)",
			transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
		},
	},
	left: {
		hidden: { opacity: 0, x: -60, filter: "blur(6px)" },
		visible: {
			opacity: 1,
			x: 0,
			filter: "blur(0px)",
			transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
		},
	},
	right: {
		hidden: { opacity: 0, x: 60, filter: "blur(6px)" },
		visible: {
			opacity: 1,
			x: 0,
			filter: "blur(0px)",
			transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
		},
	},
	scale: {
		hidden: { opacity: 0, scale: 0.82, filter: "blur(10px)" },
		visible: {
			opacity: 1,
			scale: 1,
			filter: "blur(0px)",
			transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
		},
	},
};

interface ScrollSectionWrapperProps {
	children: ReactNode;
	direction?: Direction;
	delay?: number;
	/** margin offset — negative = trigger before element is fully in view */
	margin?: string;
	className?: string;
	/** Stagger children? Pass stagger delay in seconds */
	staggerChildren?: number;
}

/**
 * ScrollSectionWrapper
 * ────────────────────
 * Persistent scroll animation wrapper (no once:true).
 * Animates IN on scroll-enter, resets on scroll-exit.
 *
 * Usage:
 * ```tsx
 * <ScrollSectionWrapper direction="up" delay={0.1}>
 *   <MyCard />
 * </ScrollSectionWrapper>
 * ```
 */
export function ScrollSectionWrapper({
	children,
	direction = "up",
	delay = 0,
	margin = "-80px",
	className,
	staggerChildren,
}: ScrollSectionWrapperProps) {
	const variants: Variants = staggerChildren
		? {
				hidden: {},
				visible: {
					transition: { staggerChildren, delayChildren: delay },
				},
			}
		: {
				hidden: variantMap[direction].hidden,
				visible: {
					...(variantMap[direction].visible as any),
					transition: {
						...((variantMap[direction].visible as any).transition || {}),
						delay,
					},
				},
			};

	return (
		<motion.div
			className={className}
			variants={variants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.15, margin }}
		>
			{children}
		</motion.div>
	);
}

/** Child item for stagger containers */
export function ScrollSectionItem({
	children,
	direction = "up",
	className,
}: {
	children: ReactNode;
	direction?: Direction;
	className?: string;
}) {
	return (
		<motion.div className={className} variants={variantMap[direction]}>
			{children}
		</motion.div>
	);
}
