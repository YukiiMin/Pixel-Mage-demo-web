"use client";

import { useReducedMotion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GuestReadingBanner() {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();

	return (
		<div
			className={`mt-8 rounded-xl border border-destructive/50 bg-destructive/10 p-6 glass-card backdrop-blur-md ${!shouldReduceMotion && "transition-transform hover:scale-[1.01]"}`}
		>
			<div className="flex flex-col items-center justify-center text-center">
				<AlertCircle className="mb-4 h-10 w-10 text-destructive" />
				<h3 className="mb-2 text-xl font-bold text-foreground">
					Hết lượt trải bài miễn phí
				</h3>
				<p className="mb-6 text-sm text-muted-foreground">
					Bạn đã sử dụng hết lượt trải bài miễn phí của khách cho hôm nay. Mua
					thêm bộ bài để tiếp tục trải nghiệm Tarot không giới hạn.
				</p>
				<Button
					onClick={() => router.push("/marketplace")}
					className="gradient-gold-purple-bg text-primary-foreground font-semibold px-8"
				>
					Mua Pack ngay
				</Button>
			</div>
		</div>
	);
}
