"use client";

import { Clock3, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useTarotReadingHistory } from "@/hooks/ui/use-tarot-reading-history";
import { useTarotSessionStore } from "@/stores/useTarotSessionStore";

const TOPIC_LABELS = {
	love: "Tình Yêu",
	career: "Sự Nghiệp",
	general: "Tổng Quát",
	finance: "Tài Chính",
} as const;

const SPREAD_LABELS = {
	"1-card": "1 Lá",
	"3-cards": "3 Lá",
	"celtic-cross": "Celtic Cross",
} as const;

export function ReadingHistory() {
	const { history, removeReading, clearHistory } = useTarotReadingHistory();
	const setTopic = useTarotSessionStore((state) => state.setTopic);
	const setQuestion = useTarotSessionStore((state) => state.setQuestion);
	const setSpreadType = useTarotSessionStore((state) => state.setSpreadType);
	const setDeckMode = useTarotSessionStore((state) => state.setDeckMode);

	if (history.length === 0) {
		return (
			<div className="mt-16">
				<h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
					<History className="h-5 w-5 text-primary" /> Lịch Sử Đọc Bài
				</h3>
				<div className="glass-card rounded-xl p-8 text-center">
					<p className="text-sm text-muted-foreground">
						Chưa có lịch sử đọc bài. Bắt đầu trải bài đầu tiên nào!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mt-16 space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
					<History className="h-5 w-5 text-primary" /> Lịch Sử Đọc Bài
				</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						clearHistory();
						toast.success("Đã xóa toàn bộ lịch sử đọc bài");
					}}
					className="border-destructive/40 text-destructive hover:bg-destructive/10"
				>
					<Trash2 className="mr-1 h-4 w-4" /> Xóa hết
				</Button>
			</div>
			<div className="space-y-3">
				{history.slice(0, 5).map((item) => (
					<div key={item.id} className="glass-card rounded-xl p-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div>
								<p className="text-sm font-semibold text-foreground">
									{item.topic ? TOPIC_LABELS[item.topic] : "Không chọn chủ đề"}{" "}
									• {SPREAD_LABELS[item.spreadType]}
								</p>
								<p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
									<Clock3 className="h-3.5 w-3.5" />
									{new Date(item.createdAt).toLocaleString("vi-VN")}
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setTopic(item.topic ?? "general");
										setQuestion(item.question);
										setSpreadType(item.spreadType);
										setDeckMode(item.deckMode);
										toast.success("Đã nạp lại cấu hình phiên đọc");
									}}
								>
									Dùng lại
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										removeReading(item.id);
										toast.success("Đã xóa mục lịch sử");
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
						{item.question && (
							<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
								“{item.question}”
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
