"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { AlertCircle, BookOpen, Clock, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useTarotReadingHistory } from "@/features/tarot/hooks/use-tarot-reading-history";
import { getStoredUserId } from "@/lib/api-config";

const SPREAD_NAMES: Record<number, string> = {
	1: "Rút 1 Lá (Trong Ngày)",
	2: "Quá Khứ - Hiện Tại - Tương Lai",
	3: "Mối Quan Hệ (3 Lá)",
	4: "Công Việc - Tài Chính (3 Lá)",
	5: "Trải Bài Celtic Cross (10 Lá)",
};

export function ReadingHistory() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isMounted, setIsMounted] = useState(false);
	const userId = getStoredUserId();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const {
		data: history,
		isLoading,
		isError,
	} = useTarotReadingHistory(userId || 0);

	const filteredHistory =
		history?.filter((item) =>
			item.mainQuestion?.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	return (
		<div className="space-y-6" data-testid="reading-history-unique-v1">
			{/* Header & Search */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="font-(--font-heading) text-2xl  text-foreground">
						Lịch Sử Đọc Bài
					</h2>
					<p className="text-sm text-muted-foreground">
						Xem lại những thông điệp vũ trụ đã gửi cho bạn
					</p>
				</div>

				<div className="relative w-full md:w-72">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Tìm kiếm theo câu hỏi..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="border-primary/20 bg-background/50 pl-9 focus-visible:ring-primary/50"
					/>
				</div>
			</div>

			{isError && (
				<div className="glass-card rounded-xl p-8 text-center border-destructive/20 bg-destructive/5">
					<AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
					<p className="text-destructive font-medium">
						Không thể tải lịch sử đọc bài
					</p>
					<p className="text-sm text-muted-foreground">Vui lòng thử lại sau</p>
				</div>
			)}

			{/* List */}
			<div className="space-y-4">
				{!isMounted || isLoading ? (
					Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="glass-card h-32 animate-pulse rounded-xl border-primary/10 bg-card/40"
						/>
					))
				) : history?.length === 0 ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="glass-card flex flex-col items-center justify-center rounded-xl p-12 text-center"
					>
						<div className="mb-4 rounded-full bg-primary/10 p-4">
							<BookOpen className="h-8 w-8 text-primary" />
						</div>
						<h3 className="mb-2 font-(--font-heading) text-xl  text-foreground">
							Trống
						</h3>
						<p className="text-muted-foreground max-w-sm">
							Bạn chưa có lịch sử đọc bài nào được hoàn thành. Đọc bài ngay để
							lưu lại những thông điệp giá trị.
						</p>
					</motion.div>
				) : filteredHistory.length === 0 ? (
					<div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
						Không tìm thấy kết quả phù hợp với "{searchTerm}"
					</div>
				) : (
					filteredHistory.map((item, index) => (
						<motion.div
							key={item.sessionId}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							className="glass-card group relative overflow-hidden rounded-xl border border-primary/10 bg-card/40 p-5 transition-all hover:border-primary/30 hover:bg-card/60"
							data-testid={`history-item-${item.sessionId}`}
						>
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary inline-flex">
											{SPREAD_NAMES[item.spreadId] || `Spread ${item.spreadId}`}
										</span>
									</div>
									<p className="font-medium text-foreground line-clamp-1">
										"{item.mainQuestion || "Không có câu hỏi cụ thể"}"
									</p>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Clock className="h-3 w-3" />
										<span>
											{format(new Date(item.createdAt), "HH:mm - dd/MM/yyyy", {
												locale: vi,
											})}
										</span>
									</div>
								</div>

								<div className="flex items-center sm:self-center">
									{/* The old 'read again' button has been removed per specs, just showing the mode as decorative */}
									<span className="text-xs text-secondary bg-secondary/10 px-2 py-1 rounded">
										{item.mode === "EXPLORE" ? "Khám Phá" : "Bộ Của Bạn"}
									</span>
								</div>
							</div>
						</motion.div>
					))
				)}
			</div>
		</div>
	);
}
