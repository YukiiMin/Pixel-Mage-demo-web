import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export function LockedStory() {
	return (
		<div
			className="container mx-auto max-w-4xl px-4 py-12 md:px-6"
			data-testid="locked-story-state"
		>
			<Link
				href="/stories"
				className="mb-8 inline-flex items-center text-sm text-white/60 transition-colors hover:text-white"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Quay lại
			</Link>

			<div
				className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-8 text-center"
				style={{
					backdropFilter: "blur(16px)",
					WebkitBackdropFilter: "blur(16px)",
				}}
			>
				<div className="mb-6 rounded-full bg-white/5 p-6">
					<Lock className="h-16 w-16 text-white/50" />
				</div>
				<h2
					className="mb-4 text-3xl text-white"
					style={{ fontFamily: "var(--font-heading)" }}
				>
					Nội dung bị khóa
				</h2>
				<p className="mb-8 text-lg text-white/70">
					Hoàn thành bộ thẻ để truy cập nội dung này
				</p>
				<Link
					href="/my-cards"
					className="rounded-full bg-white px-8 py-3 font-medium text-black transition-transform hover:scale-105"
				>
					Xem bộ thẻ của tôi
				</Link>
			</div>
		</div>
	);
}
