"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTarotInterpret } from "@/features/tarot/hooks/use-tarot-interpret";

interface InterpretPanelProps {
	sessionId: number;
	status: string;
	onComplete: () => void;
}

const MAX_RETRIES = 2;
const TIMEOUT_MS = 60_000;

export function InterpretPanel({
	sessionId,
	status,
	onComplete,
}: InterpretPanelProps) {
	const router = useRouter();
	const [retryCount, setRetryCount] = useState(0);
	const [showTimeout, setShowTimeout] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { data, isError } = useTarotInterpret(sessionId);
	const aiInterpretation = data?.aiInterpretation;

	useEffect(() => {
		// Clear existing timer on any change to dependencies
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		if (status === "INTERPRETING") {
			if (!showTimeout) {
				timerRef.current = setTimeout(() => {
					setShowTimeout(true);
				}, TIMEOUT_MS);
			}
		} else if (status === "COMPLETED") {
			onComplete();
		}

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [status, showTimeout, retryCount, onComplete]);

	const handleRetry = () => {
		setShowTimeout(false);
		setRetryCount((c) => c + 1);
	};

	if (status === "COMPLETED" || aiInterpretation) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0 }}
				className="space-y-6"
				data-testid="interpret-panel"
			>
				<h2
					className="text-center font-(--font-heading) text-2xl"
					style={{ color: "hsl(270 40% 80%)" }}
				>
					<Sparkles
						className="mr-2 inline h-5 w-5"
						style={{ color: "hsl(270 40% 80%)" }}
					/>
					Thông Điệp Từ Vũ Trụ
				</h2>
				<div className="glass-card mx-auto min-h-50 max-w-2xl rounded-2xl p-6 md:p-8">
					<pre
						className="whitespace-pre-wrap font-(--font-body) text-sm leading-relaxed"
						style={{ color: "hsl(270 40% 80%)" }}
					>
						{aiInterpretation}
					</pre>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex min-h-100 flex-col items-center justify-center space-y-6 text-center"
			data-testid="interpret-panel"
		>
			{showTimeout && retryCount < MAX_RETRIES ? (
				<div className="glass-card max-w-md rounded-2xl p-8">
					<AlertCircle className="mx-auto mb-4 h-12 w-12 text-secondary" />
					<h3 className="mb-2 font-(--font-heading) text-xl  ">
						Việc giải bài đang mất thời gian
					</h3>
					<p className="mb-6 text-sm text-muted-foreground">
						Vũ trụ đang gửi thông điệp đôi chút khó khăn. Bạn có muốn thử lại?
					</p>
					<Button
						onClick={handleRetry}
						variant="outline"
						className="border-secondary/50 text-secondary hover:bg-secondary/10"
						data-testid="retry-button"
					>
						<RefreshCcw className="mr-2 h-4 w-4" /> Thử lại
					</Button>
				</div>
			) : showTimeout && retryCount >= MAX_RETRIES ? (
				<div className="glass-card max-w-md rounded-2xl p-8">
					<AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
					<h3 className="mb-2 font-(--font-heading) text-xl   text-destructive">
						Hệ thống đang gặp vấn đề
					</h3>
					<p className="mb-6 text-sm text-muted-foreground">
						Chúng tôi không thể giải mã các lá bài lúc này. Vui lòng thử lại
						sau.
					</p>
					<Button
						onClick={() => router.push("/tarot")}
						className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						data-testid="back-to-tarot-button"
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Về trang Tarot
					</Button>
				</div>
			) : (
				<>
					<div
						className="relative flex h-24 w-24 items-center justify-center"
						data-testid="spinner"
					>
						<motion.div
							animate={{ rotate: 360 }}
							transition={{
								duration: 8,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
							className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/50"
						/>
						<motion.div
							animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
							className="absolute inset-2 rounded-full border border-secondary glow-purple"
						/>
						<Sparkles className="h-8 w-8 text-secondary" />
					</div>
					<div className="space-y-2">
						<h3
							className="font-(--font-heading) text-2xl"
							style={{ color: "hsl(270 40% 80%)" }}
						>
							Vũ Trụ Đang Giải Mã...
						</h3>
						<p style={{ color: "hsl(270 40% 80% / 0.8)" }}>
							Xin hãy kiên nhẫn chờ đợi thông điệp
						</p>
					</div>
				</>
			)}
		</motion.div>
	);
}
