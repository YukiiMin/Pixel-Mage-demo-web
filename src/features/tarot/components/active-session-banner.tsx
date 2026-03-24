"use client";

import { useReducedMotion } from "framer-motion";
import { AlertCircle, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
	sessionId: number;
}

export function ActiveSessionBanner({ sessionId }: Props) {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();

	return (
		<div
			className={`mt-8 rounded-xl border border-primary/50 bg-primary/10 p-6 glass-card backdrop-blur-md ${!shouldReduceMotion && "transition-transform hover:scale-[1.01]"}`}
		>
			<div className="flex flex-col items-center justify-center text-center">
				<AlertCircle className="mb-4 h-10 w-10 text-primary" />
				<h3 className="mb-2 text-xl font-bold text-foreground">
					Bạn đang có trải bài dở dang
				</h3>
				<p className="mb-6 text-sm text-muted-foreground">
					Bạn vẫn còn một trải bài chưa hoàn thành. Hãy tiếp tục hoặc xem lịch
					sử trước khi tạo trải bài mới.
				</p>
				<div className="flex justify-center gap-4">
					<Button
						onClick={() => router.push(`/tarot/session/${sessionId}`)}
						className="gradient-gold-purple-bg text-primary-foreground font-semibold px-6"
					>
						Tiếp tục
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							document
								.getElementById("reading-history")
								?.scrollIntoView({ behavior: "smooth" });
						}}
						className="border-primary/50 text-foreground"
					>
						<History className="mr-2 h-4 w-4" />
						Xem lịch sử
					</Button>
				</div>
			</div>
		</div>
	);
}
