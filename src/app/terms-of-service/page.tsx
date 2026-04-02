import React from "react";
import Link from "next/link";
import { TermsOfServiceContent } from "@/components/shared/legal-modals";

export const metadata = {
	title: "Điều khoản dịch vụ | Pixel Mage",
	description: "Terms of Service cho nền tảng Pixel Mage.",
};

export default function TermsOfServicePage() {
	return (
		<div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
			<div className="glass-card p-8 md:p-12 rounded-3xl border border-border/50 shadow-xl relative overflow-hidden">
				{/* Decorative glow */}
				<div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

				<div className="relative z-10">
					<h1 className="text-4xl font-heading font-bold text-foreground mb-8 pb-4 border-b border-border/50">
						Điều Khoản Dịch Vụ Pixel Mage
					</h1>
					<TermsOfServiceContent />
				</div>
				
				<div className="mt-12 pt-8 border-t border-border/50 text-center relative z-10">
					<Link href="/" className="btn-primary inline-flex">
						Trở về trang chủ
					</Link>
				</div>
			</div>
		</div>
	);
}
