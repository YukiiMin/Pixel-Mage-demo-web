"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
	fadeInLeft,
	fadeInRight,
	staggerContainer,
} from "@/lib/motion-variants";

// ✅ Ảnh nhóm thật từ Cloudinary (thay the-fool cũ)
const HERO_IMAGE_URL =
	"https://res.cloudinary.com/yukiimin-cloud/image/upload/v1775123777/00_e9wsbz.png";

// CounterStat — đếm lại mỗi lần scroll vào (once: false)
const CounterStat = ({ end, label }: { end: string; label: string }) => {
	const ref = useRef<HTMLDivElement>(null);
	// once: true → Chỉ đếm 1 lần khi vừa scroll tới để tối ưu performance
	const inView = useInView(ref, { once: true, amount: 0.5 });
	const [val, setVal] = useState("0");

	useEffect(() => {
		if (!inView) {
			// Reset về 0 khi ra khỏi viewport
			const raw = end.replace(/[^0-9.]/g, "");
			const suffix = end.replace(/[0-9.]/g, "");
			const num = parseFloat(raw) || 0;
			setVal(num < 10 ? `0.0${suffix}` : `0${suffix}`);
			return;
		}
		const raw = end.replace(/[^0-9.]/g, "");
		const num = parseFloat(raw) || 0;
		const suffix = end.replace(/[0-9.]/g, "");
		const duration = 1200;
		const start = performance.now();
		let raf: number;
		const tick = (now: number) => {
			const p = Math.min((now - start) / duration, 1);
			const eased = 1 - (1 - p) ** 3;
			const current =
				num < 10
					? (num * eased).toFixed(1)
					: Math.round(num * eased).toString();
			setVal(current + suffix);
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [inView, end]);

	return (
		<div ref={ref} className="text-center">
			<span className="text-2xl md:text-3xl font-bold font-stats text-primary">
				{val}
			</span>
			<p className="text-xs text-muted-foreground mt-1">{label}</p>
		</div>
	);
};

const FloatingBadge = ({
	children,
	className,
	delay = 0,
}: {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}) => (
	<motion.div
		initial={{ opacity: 0, scale: 0.7 }}
		animate={{ opacity: 1, scale: 1 }}
		transition={{ delay, duration: 0.5, ease: "easeOut" }}
		className={`glass-card rounded-xl px-3 py-2 text-xs font-medium text-foreground absolute z-20 animate-orbit whitespace-nowrap ${className}`}
		style={{ animationDelay: `${delay}s` }}
	>
		{children}
	</motion.div>
);

const HeroSection = () => {
	return (
		<section
			id="hero"
			className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
		>
			{/* Gold radial glow */}
			<div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
			{/* Purple left glow */}
			<div className="absolute left-[5%] bottom-1/4 w-96 h-96 rounded-full bg-purple-600/8 blur-[100px] pointer-events-none" />

			<div className="container mx-auto px-4 sm:px-6">
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid lg:grid-cols-[55%_45%] gap-10 items-center"
				>
					{/* LEFT */}
					<motion.div variants={fadeInLeft} className="space-y-6">
						{/* Badge */}
						<motion.div
							className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1.5 text-xs font-medium text-primary animate-pulse-glow"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							🔮 #1 AI Tarot Platform
						</motion.div>

						{/* Headline */}
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
							Khám Phá
							<br />
							<span className="text-mystic-gradient">Thế Giới Tarot</span>
							<br />
							<span className="text-mystic-gradient">Huyền Bí</span>
						</h1>

						<p className="text-muted-foreground text-base md:text-lg max-w-lg font-light">
							Đọc bài AI · Sưu tập thẻ NFC · Kết nối vũ trụ
						</p>

						{/* CTAs */}
						<div className="flex flex-wrap gap-4">
							<a
								href="/tarot"
								className="btn-shimmer gradient-gold-purple-bg text-primary-foreground font-semibold rounded-full px-7 py-3 glow-gold transition-transform hover:scale-105"
							>
								🔮 Bắt Đầu Đọc Bài
							</a>
							<a
								href="#how-it-works"
								className="btn-shimmer border border-primary/40 text-primary font-medium rounded-full px-7 py-3 hover:bg-primary/10 transition-colors"
							>
								{">"} Tìm Hiểu Thêm
							</a>
						</div>

						{/* Social proof */}
						<div className="flex items-center gap-3 pt-2">
							<div className="flex -space-x-2">
								{["M", "T", "B", "H"].map((l, i) => (
									<div
										key={i}
										className="w-8 h-8 rounded-full gradient-gold-purple-bg flex items-center justify-center text-xs font-bold text-primary-foreground ring-2 ring-background"
									>
										{l}
									</div>
								))}
							</div>
							<div className="text-sm">
								<span className="text-primary">★★★★★</span>{" "}
								<span className="text-muted-foreground">
									1,000+ Tarot Readers tin tưởng
								</span>
							</div>
						</div>

						{/* Stats — reset khi scroll ra, đếm lại khi scroll vào */}
						<div className="flex gap-8 pt-4">
							<CounterStat end="78" label="Lá Bài" />
							<div className="w-px bg-border" />
							<CounterStat end="2K+" label="Readings" />
							<div className="w-px bg-border" />
							<CounterStat end="4.9★" label="Đánh Giá" />
						</div>
					</motion.div>

					{/* RIGHT — Group image with floating badges */}
					<motion.div
						variants={fadeInRight}
						className="relative flex justify-center items-center"
					>
						{/* Glow behind image */}
						<div className="absolute inset-0 rounded-full bg-primary/15 blur-[80px] pointer-events-none" />

						{/* ✅ Ảnh thật của nhóm */}
						<motion.div
							className="relative z-10"
							whileHover={{ rotateY: 8, rotateX: -4 }}
							transition={{ type: "spring", stiffness: 200 }}
							style={{ perspective: 800, transformStyle: "preserve-3d" }}
						>
							<Image
								src={HERO_IMAGE_URL}
								alt="PixelMage — The Fool Card"
								width={320}
								height={480}
								className="w-56 sm:w-64 md:w-72 lg:w-80 rounded-2xl shadow-2xl h-auto object-cover"
								priority
								unoptimized
							/>
							{/* Gradient overlay bottom */}
							<div className="absolute inset-x-0 bottom-0 h-20 rounded-b-2xl bg-linear-to-t from-background/40 to-transparent pointer-events-none" />
						</motion.div>

						{/* ✅ Floating badges */}
						<FloatingBadge className="top-8 right-0 lg:-right-6" delay={2}>
							✨ +1 The Moon
						</FloatingBadge>
						<FloatingBadge className="bottom-20 left-0 lg:-left-6" delay={3}>
							🔮 AI Interpretation
						</FloatingBadge>
						<FloatingBadge className="top-1/3 left-0 lg:-left-8" delay={4}>
							📱 NFC Linked!
						</FloatingBadge>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};

export default HeroSection;
