"use client";

import { ArrowLeft, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const StarBackground = dynamic(
	() => import("@/components/ui/star-background"),
	{ ssr: false },
);

function AuthErrorContent() {
	const searchParams = useSearchParams();
	const errorTitle =
		searchParams.get("error") === "email_not_verified"
			? "Email chưa được xác thực"
			: "Lỗi đăng nhập";
	const errorMessage =
		searchParams.get("message") ||
		"Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.";

	return (
		<div className="glass-card rounded-2xl border border-border/50 p-8 space-y-4 text-center">
			<XCircle className="mx-auto h-12 w-12 text-destructive" />
			<h2 className="text-xl font-bold text-destructive">{errorTitle}</h2>
			<p className="text-muted-foreground">{errorMessage}</p>

			<Link
				href="/login"
				className="mt-6 inline-block w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium transition-colors hover:bg-primary/90"
			>
				Trở về trang đăng nhập
			</Link>
		</div>
	);
}

export default function AuthErrorPage() {
	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			<StarBackground />
			<Link
				href="/"
				className="absolute left-6 top-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary"
			>
				<ArrowLeft className="h-4 w-4" />
				Về trang chủ
			</Link>

			<div className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
			<div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-[100px]" />

			<div className="relative z-10 w-full max-w-md px-6 py-24 text-center">
				<Suspense
					fallback={
						<div className="text-muted-foreground">
							Đang tải chi tiết lỗi...
						</div>
					}
				>
					<AuthErrorContent />
				</Suspense>
			</div>
		</div>
	);
}
