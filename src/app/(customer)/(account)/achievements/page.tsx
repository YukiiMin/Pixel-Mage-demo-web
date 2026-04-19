import Header from "@/components/layout/header";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Trophy } from "lucide-react";

export const metadata = {
	title: "Thành Tựu — Sắp ra mắt",
};

export default function AchievementsPage() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<Header />
			<main className="relative z-10 pt-20">
				<ComingSoon
					featureName="Thành Tựu"
					description="Hệ thống thành tựu đang được khắc tạc. Hãy chuẩn bị để nhận những phần thưởng huyền thoại cho hành trình của bạn."
					eta="Dự kiến trong tương lai gần"
					icon={<Trophy className="h-10 w-10 text-primary" />}
					backHref="/dashboard"
					backLabel="Về Dashboard"
				/>
			</main>
		</div>
	);
}
