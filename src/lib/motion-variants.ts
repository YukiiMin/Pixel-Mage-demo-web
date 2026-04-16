"use client";
import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 40 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const fadeInLeft: Variants = {
	hidden: { opacity: 0, x: -60 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const fadeInRight: Variants = {
	hidden: { opacity: 0, x: 60 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.85 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const staggerContainer: Variants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.15 } },
};

export const staggerFast: Variants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.08 } },
};

export const blurIn: Variants = {
	hidden: { opacity: 0, filter: "blur(10px)" },
	visible: {
		opacity: 1,
		filter: "blur(0px)",
		transition: { duration: 0.8, ease: "easeOut" },
	},
};

export const slideUpFade: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

export const scaleUpFade: Variants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};
