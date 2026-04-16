"use client";

import { motion } from "framer-motion";
import { Brain, Grid3X3, Hand, Link, Smartphone, Sparkles } from "lucide-react";
import { useState } from "react";
import {
	ScrollSectionItem,
	ScrollSectionWrapper,
} from "./scroll-section-wrapper";

const tabs = [
	{
		id: "online",
		label: "🔮 Đọc Bài Online",
		steps: [
			{
				icon: Sparkles,
				title: "Chọn chủ đề & trải bài",
				desc: "Chọn câu hỏi và kiểu trải bài phù hợp",
			},
			{
				icon: Hand,
				title: "Rút lá bài đặc biệt",
				desc: "Kết nối trực giác, chọn lá bài dành cho bạn",
			},
			{
				icon: Brain,
				title: "Nhận giải mã AI chi tiết",
				desc: "AI phân tích chuyên sâu ý nghĩa lá bài",
			},
		],
	},
	{
		id: "nfc",
		label: "📱 Quét NFC Thẻ Vật Lý",
		steps: [
			{
				icon: Smartphone,
				title: "Mở app, đặt thẻ gần điện thoại",
				desc: "Quét NFC tự động nhận diện thẻ bài",
			},
			{
				icon: Link,
				title: "Xác nhận liên kết thẻ",
				desc: "Xác minh quyền sở hữu lá bài vật lý",
			},
			{
				icon: Grid3X3,
				title: "Xem nội dung + sưu tập",
				desc: "Khám phá câu chuyện bí ẩn & bộ sưu tập",
			},
		],
	},
];

const HowItWorks = () => {
	const [active, setActive] = useState("online");
	const current = tabs.find((t) => t.id === active)!;

	return (
		<section id="how-it-works" className="py-24 relative overflow-hidden">
			{/* Ambient orbs */}
			<div className="absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
			<div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/5 blur-[100px] pointer-events-none" />

			<div className="container mx-auto px-6">
				<ScrollSectionWrapper direction="up" className="text-center mb-12">
					<div className="inline-flex items-center gap-2 badge-mystic mb-4">
						✦ Hành Trình Của Bạn ✦
					</div>
					<h2 className="text-3xl md:text-4xl font-bold mb-3 text-mystic-gradient">
						Làm sao hoạt động?
					</h2>
					<p className="text-muted-foreground">
						3 bước đơn giản để bắt đầu hành trình Tarot
					</p>
				</ScrollSectionWrapper>

				{/* Tabs */}
				<ScrollSectionWrapper direction="up" delay={0.1} className="flex justify-center gap-3 mb-12">
					{tabs.map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() => setActive(t.id)}
							className={`btn-shimmer rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
								active === t.id
									? "gradient-gold-purple-bg text-primary-foreground glow-gold shadow-lg"
									: "glass-card text-muted-foreground hover:text-foreground hover:border-primary/30"
							}`}
						>
							{t.label}
						</button>
					))}
				</ScrollSectionWrapper>

				{/* Steps */}
				<motion.div
					key={active}
					initial="hidden"
					animate="visible"
					transition={{ staggerChildren: 0.12 }}
					className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
				>
					{current.steps.map((step, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
							className="glass-card rounded-2xl p-6 text-center group hover:glow-gold transition-all duration-300 border border-white/5 hover:border-primary/20 relative overflow-hidden"
						>
							{/* Hover shimmer sweep */}
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-2xl">
								<div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:left-full transition-[left] duration-700 ease-in-out" />
							</div>

							<div className="relative z-10">
								<div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-gold-purple-bg flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform duration-300">
									{i + 1}
								</div>
								<step.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
								<h3 className="font-heading font-semibold mb-2">{step.title}</h3>
								<p className="text-sm text-muted-foreground">{step.desc}</p>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
			
		</section>
	);
};

export default HowItWorks;
