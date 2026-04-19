import Header from "@/components/layout/header";
import { ComingSoon } from "@/components/ui/coming-soon";
import { BookOpen } from "lucide-react";

export const metadata = {
	title: "Hành Trình Bí Ẩn — Sắp ra mắt",
};

export default function StoriesPage() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<Header />
			<main className="relative z-10 pt-20">
				<ComingSoon
					featureName="Hành Trình Bí Ẩn"
					description="Kho tàng truyện kể huyền bí đang chờ được khám phá. Mỗi lá bài ẩn chứa một câu chuyện riêng sẽ sớm được tiết lộ."
					eta="Dự kiến trong tương lai gần"
					icon={<BookOpen className="h-10 w-10 text-primary" />}
					backHref="/dashboard"
					backLabel="Về Dashboard"
				/>
			</main>
		</div>
	);
}
