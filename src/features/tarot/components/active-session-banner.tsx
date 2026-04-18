"use client";

import { useReducedMotion } from "framer-motion";
import { AlertCircle, History, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCancelSession } from "@/features/tarot/hooks/use-cancel-session";
import { getStoredUserId } from "@/lib/api-config";
import { useState, useEffect } from "react";

interface Props {
	sessionId: number;
	onCanceled?: () => void;
}

export function ActiveSessionBanner({ sessionId, onCanceled }: Props) {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const [userId, setUserId] = useState<number | null>(null);

	useEffect(() => {
		setUserId(getStoredUserId());
	}, []);

	const cancelSession = useCancelSession(userId);

	const handleCancel = async () => {
		try {
			await cancelSession.mutateAsync(sessionId);
			onCanceled?.();
		} catch (e) {
			// error handled in hook
		}
	};

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
					Bạn vẫn còn một trải bài chưa hoàn thành. Hãy tiếp tục, hủy để tạo
					mới, hoặc xem lịch sử.
				</p>
				<div className="flex flex-wrap justify-center gap-3">
					<Button
						onClick={() => router.push(`/tarot/session/${sessionId}`)}
						className="gradient-gold-purple-bg text-primary-foreground font-semibold px-4"
					>
						Tiếp tục
					</Button>
					<Button
						variant="destructive"
						onClick={handleCancel}
						disabled={cancelSession.isPending}
						className="px-4 font-semibold"
					>
						<RotateCcw className="mr-2 h-4 w-4" />
						{cancelSession.isPending ? "Đang hủy..." : "Hủy & Tạo mới"}
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							document
								.getElementById("reading-history")
								?.scrollIntoView({ behavior: "smooth" });
						}}
						className="border-primary/50 text-foreground px-4"
					>
						<History className="mr-2 h-4 w-4" />
						Lịch sử
					</Button>
				</div>
			</div>
		</div>
	);
}
