"use client";

import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { LoginForm } from "@/components/customer/auth/login-form";
import { useAuthGuard } from "@/hooks/ui/use-auth-guard";

const StarBackground = dynamic(
	() => import("@/components/ui/star-background"),
	{ ssr: false },
);

export default function LoginRoute() {
	const { checking } = useAuthGuard("guest-only", "/profile");

	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			<StarBackground />
			{/* Decorative radial glows */}
			<div className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
			<div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-[100px]" />

			<div className="relative z-10 w-full max-w-md px-6 py-24">
				{checking ? (
					<div className="glass-card rounded-2xl border border-border/50 p-8 text-center">
						<LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
					</div>
				) : (
					<LoginForm />
				)}
			</div>
		</div>
	);
}
