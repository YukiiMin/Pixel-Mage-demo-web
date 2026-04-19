"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent } from "../types";

interface LoreContentViewerProps {
	content: CardContent;
}

export function LoreContentViewer({ content }: LoreContentViewerProps) {
	// Split content into paragraphs for staggered animation
	// Strictly prioritize textData, then contentUrl (if it contains raw text), then fallback
	const rawText = content.textData || content.contentUrl;
	const paragraphs = rawText
		? rawText.split("\n\n")
		: ["Huyền tích về linh hồn này đang chờ được giải mã từ những văn bản cổ đại..."];

	return (
		<div className="space-y-8 py-4">
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true }}
				className="divider-mystic"
			>
				{content.title || "Huyền Tích Cổ Đại"}
			</motion.div>

			<div className="space-y-6">
				{paragraphs.map((p, index) => (
					<motion.p
						key={`${content.contentId}-p-${index}`}
						initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
						whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
						viewport={{ once: true }}
						transition={{
							duration: 1.2,
							delay: index * 0.15,
							ease: [0.16, 1, 0.3, 1],
						}}
						className={`text-lg leading-relaxed text-foreground/90 font-light ${
							index === 0
								? "first-letter:text-5xl first-letter:font-heading first-letter:mr-3 first-letter:float-left first-letter:text-primary first-letter:leading-none"
								: ""
						}`}
						style={{ fontFamily: "var(--font-body)" }}
					>
						{p}
					</motion.p>
				))}
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 0.6 }}
				viewport={{ once: true }}
				transition={{ delay: 1 }}
				className="flex justify-center pt-4"
			>
				<div className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
			</motion.div>
		</div>
	);
}

