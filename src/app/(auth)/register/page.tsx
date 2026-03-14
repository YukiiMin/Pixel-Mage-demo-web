"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { registerAccount } from "@/lib/api/accounts";
import { getApiErrorMessage } from "@/lib/auth/errors";

const registerSchema = z
	.object({
		name: z.string().min(2, "Name must contain at least 2 characters."),
		email: z.email("Please enter a valid email address."),
		phoneNumber: z.string().min(8, "Phone number is too short."),
		password: z
			.string()
			.min(8, "Password must contain at least 8 characters."),
		confirmPassword: z
			.string()
			.min(8, "Confirm password must contain at least 8 characters."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match.",
	});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			phoneNumber: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = (values: RegisterFormValues) => {
		startTransition(async () => {
			try {
				await registerAccount({
					name: values.name,
					email: values.email,
					phoneNumber: values.phoneNumber,
					password: values.password,
					roleId: 3,
				});

				toast.success("Account created successfully. Please sign in.");
				router.replace("/login");
			} catch (error) {
				toast.error(
					getApiErrorMessage(error, "Unable to create account right now."),
				);
			}
		});
	};

	return (
		<div className="min-h-screen bg-background px-4 py-20">
			<div className="mx-auto max-w-md">
				<Card className="border-border/60 bg-card/80 backdrop-blur">
					<CardHeader>
						<CardTitle className="text-2xl">Create your account</CardTitle>
						<CardDescription>
							Register first to start using PixelMage features.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input id="name" placeholder="Your name" {...form.register("name")} />
								{form.formState.errors.name ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.name.message}
									</p>
								) : null}
							</div>

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
								<Label htmlFor="phoneNumber">Phone Number</Label>
								<Input
									id="phoneNumber"
									type="tel"
									autoComplete="tel"
									placeholder="0901234567"
									{...form.register("phoneNumber")}
								/>
								{form.formState.errors.phoneNumber ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.phoneNumber.message}
									</p>
								) : null}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									autoComplete="new-password"
									placeholder="••••••••"
									{...form.register("password")}
								/>
								{form.formState.errors.password ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.password.message}
									</p>
								) : null}
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									autoComplete="new-password"
									placeholder="••••••••"
									{...form.register("confirmPassword")}
								/>
								{form.formState.errors.confirmPassword ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.confirmPassword.message}
									</p>
								) : null}
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isPending || form.formState.isSubmitting}
							>
								{isPending || form.formState.isSubmitting
									? "Creating account..."
									: "Create account"}
							</Button>
						</form>

						<p className="mt-4 text-center text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link href="/login" className="text-primary hover:underline">
								Sign in
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
