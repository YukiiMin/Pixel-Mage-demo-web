"use client";

import { Button } from "@/components/ui/button";
import StarBackground from "@/components/ui/star-background";
import { motion } from "framer-motion";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
	featureName: string;
	description?: string;
	backHref?: string;
	backLabel?: string;
	icon?: React.ReactNode;
	eta?: string;
}

export function ComingSoon({
	featureName,
	description,
	backHref = "/dashboard",
	backLabel = "Về trang chủ",
	icon,
	eta = "Sắp ra mắt",
}: ComingSoonProps) {
	return (
		<div className="min-h-screen relative overflow-hidden flex items-center justify-center">
			<StarBackground />

			{/* Ambient glows */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
			</div>

			<div className="relative z-10 text-center px-6 max-w-lg mx-auto">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-8"
				>
					{/* Icon */}
					<div className="flex items-center justify-center mb-6">
						<div className="relative">
							<div className="w-24 h-24 rounded-full glass-card border border-primary/30 flex items-center justify-center glow-gold">
								{icon ?? <Construction className="h-10 w-10 text-primary" />}
							</div>
							<motion.div
								className="absolute -top-1 -right-1"
								animate={{ rotate: 360 }}
								transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
							>
								<Sparkles className="h-5 w-5 text-primary" />
							</motion.div>
						</div>
					</div>

					{/* ETA badge */}
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-primary/20 mb-4">
						<div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
						<span className="text-xs text-amber-400 font-medium">{eta}</span>
					</div>

					{/* Title */}
					<h1
						className="text-4xl sm:text-5xl font-bold text-mystic-gradient animate-flicker mb-4"
						style={{ fontFamily: "var(--font-heading)" }}
					>
						{featureName}
					</h1>

					{/* Divider rune */}
					<div className="flex items-center gap-3 justify-center my-4">
						<div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/40" />
						<span className="text-primary/60 text-lg">✦</span>
						<div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/40" />
					</div>

					{/* Description */}
					<p className="text-muted-foreground text-lg mb-3">
						{description ?? "Tính năng này đang trong quá trình phát triển."}
					</p>
					<p className="text-sm text-muted-foreground/70">
						Chúng tôi đang dệt những bùa chú cuối cùng. 🔮 Hãy quay lại sớm!
					</p>
				</motion.div>

				{/* Back button */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					<Button asChild variant="outline" className="border-primary/30 hover:border-primary hover:glow-gold transition-all gap-2">
						<Link href={backHref}>
							<ArrowLeft className="h-4 w-4" />
							{backLabel}
						</Link>
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
