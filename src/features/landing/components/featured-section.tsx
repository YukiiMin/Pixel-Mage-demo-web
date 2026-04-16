"use client";
import { motion } from "framer-motion";
import { CreditCard, Sparkles, Zap } from "lucide-react";
import {
	ScrollSectionItem,
	ScrollSectionWrapper,
} from "./scroll-section-wrapper";

const features = [
	{
		icon: Sparkles,
		title: "Đọc Bài Tarot AI",
		desc: "AI phân tích chuyên sâu 78 lá bài với hơn 10 kiểu trải bài phổ biến.",
		color: "from-amber-500/20 to-purple-600/20",
		glow: "group-hover:shadow-[0_0_40px_-8px_hsl(45,65%,55%,0.5)]",
		iconColor: "text-amber-400",
	},
	{
		icon: CreditCard,
		title: "Sưu Tập Thẻ NFC",
		desc: "Thẻ bài vật lý tích hợp NFC — quét để mở khóa nội dung bí ẩn.",
		color: "from-purple-600/20 to-blue-600/20",
		glow: "group-hover:shadow-[0_0_40px_-8px_hsl(270,38%,50%,0.5)]",
		iconColor: "text-purple-400",
	},
	{
		icon: Zap,
		title: "Marketplace",
		desc: "Mua bán bộ bài nghệ thuật từ các nghệ sĩ hàng đầu trên nền tảng.",
		color: "from-blue-600/20 to-amber-500/20",
		glow: "group-hover:shadow-[0_0_40px_-8px_hsl(220,40%,55%,0.5)]",
		iconColor: "text-blue-400",
	},
];

const FeaturedSection = () => (
	<section id="features" className="py-24 relative overflow-hidden">
		{/* Ambient background orbs */}
		<div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
		<div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

		<div className="container mx-auto px-6">
			<ScrollSectionWrapper direction="up" className="text-center mb-14">
				<div className="inline-flex items-center gap-2 badge-mystic mb-4">
					✦ Tính Năng Nổi Bật ✦
				</div>
				<h2 className="text-3xl md:text-4xl font-bold mb-3 text-mystic-gradient">
					Khám Phá Thế Giới Bí Ẩn
				</h2>
				<p className="text-muted-foreground max-w-md mx-auto">
					Khám phá thế giới Tarot theo cách chưa từng có
				</p>
			</ScrollSectionWrapper>

			<ScrollSectionWrapper
				staggerChildren={0.15}
				className="grid md:grid-cols-3 gap-8"
			>
				{features.map((f, i) => (
					<ScrollSectionItem key={i} direction="up">
						<div
							className={`glass-card rounded-2xl p-8 group transition-all duration-500 cursor-default
								border border-white/5 hover:border-white/10
								${f.glow} relative overflow-hidden`}
						>
							{/* Card inner gradient */}
							<div
								className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
							/>
							{/* Shimmer overlay */}
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl overflow-hidden">
								<div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:left-full transition-[left] duration-700 ease-in-out" />
							</div>

							<div className="relative z-10">
								<div className="w-12 h-12 rounded-xl gradient-gold-purple-bg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
									<f.icon className="w-6 h-6 text-primary-foreground" />
								</div>
								<h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
									{f.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{f.desc}
								</p>
							</div>
						</div>
					</ScrollSectionItem>
				))}
			</ScrollSectionWrapper>
		</div>
	</section>
);

export default FeaturedSection;
