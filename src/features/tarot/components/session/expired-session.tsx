"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ExpiredSession() {
	const router = useRouter();

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className="glass-card mx-auto max-w-md rounded-2xl p-8 text-center"
			data-testid="expired-session"
		>
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
				<AlertTriangle className="h-8 w-8 text-destructive" />
			</div>
			<h2 className="mb-2 font-(--font-heading) text-2xl   text-foreground">
				Phiên Đọc Đã Hết Hạn
			</h2>
			<p className="mb-8 text-muted-foreground">
				Phiên đọc bài này đã quá thời gian hoặc không còn tồn tại. Vui lòng bắt
				đầu một phiên đọc mới.
			</p>
			<Button
				onClick={() => router.push("/tarot")}
				className="w-full text-primary-foreground"
				data-testid="back-to-tarot-button"
			>
				<ArrowLeft className="mr-2 h-4 w-4" /> Về trang Tarot
			</Button>
		</motion.div>
	);
}
