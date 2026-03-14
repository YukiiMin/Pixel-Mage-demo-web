"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api/accounts";
import { getApiErrorMessage } from "@/lib/auth/errors";
import { setSession } from "@/lib/auth/session";

const loginSchema = z.object({
	email: z.email("Please enter a valid email address."),
	password: z
		.string()
		.min(6, "Password must contain at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const redirectTo = searchParams.get("redirect") || "/";

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (values: LoginFormValues) => {
		startTransition(async () => {
			try {
				const auth = await login(values);
				setSession(auth.token, auth.account ?? null);

				toast.success("Signed in successfully.");
				router.replace(redirectTo);
				router.refresh();
			} catch (error) {
				toast.error(
					getApiErrorMessage(error, "Unable to sign in. Please try again."),
				);
			}
		});
	};

	return (
		<div className="min-h-screen bg-background px-4 py-20">
			<div className="mx-auto max-w-md">
				<Card className="border-border/60 bg-card/80 backdrop-blur">
					<CardHeader>
						<CardTitle className="text-2xl">Sign in to PixelMage</CardTitle>
						<CardDescription>
							Use your account to continue to admin and customer features.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="you@pixelmage.vn"
									{...form.register("email")}
								/>
								{form.formState.errors.email ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.email.message}
									</p>
								) : null}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									autoComplete="current-password"
									placeholder="••••••••"
									{...form.register("password")}
								/>
								{form.formState.errors.password ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.password.message}
									</p>
								) : null}
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isPending || form.formState.isSubmitting}
							>
								{isPending || form.formState.isSubmitting
									? "Signing in..."
									: "Sign in"}
							</Button>
						</form>

						<p className="mt-4 text-center text-sm text-muted-foreground">
							No account yet?{" "}
							<Link href="/register" className="text-primary hover:underline">
								Create one
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
