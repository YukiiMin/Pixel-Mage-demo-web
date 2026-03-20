"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RegisterForm } from "@/components/customer/auth/register-form";
import { useAuthGuard } from "@/hooks/ui/use-auth-guard";

const StarBackground = dynamic(
	() => import("@/components/ui/star-background"),
	{ ssr: false },
);

export default function RegisterRoute() {
	const { checking } = useAuthGuard("guest-only", "/");

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
			{/* Decorative radial glows */}
			<div className="pointer-events-none absolute right-1/4 top-1/3 h-96 w-96 -translate-y-1/2 rounded-full bg-secondary/10 blur-[100px]" />
			<div className="pointer-events-none absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />

			<div className="relative z-10 w-full max-w-md px-6 py-24">
				{checking ? (
					<div className="glass-card rounded-2xl border border-border/50 p-8 text-center">
						<LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
					</div>
				) : (
					<RegisterForm />
				)}
			</div>
		</div>
	);
}
