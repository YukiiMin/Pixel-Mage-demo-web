"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, type Variants } from "framer-motion";
import {
	AlertCircle,
	Eye,
	EyeOff,
	LoaderCircle,
	Sparkles,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PrivacyPolicyDialog, TermsOfServiceDialog } from "@/components/shared/legal-modals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
	type RegisterFormValues,
	registerSchema,
} from "@/features/auth/register-schema";

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { delayChildren: 0.1, staggerChildren: 0.08 },
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function RegisterForm() {
	const router = useRouter();
	const { register: registerUser, loading, errorMessage } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: { name: "", email: "", phoneNumber: "", password: "", agreeTerms: false },
	});

	const agreeTerms = watch("agreeTerms");

	const onSubmit = async (values: RegisterFormValues) => {
		try {
			await registerUser({
				name: values.name,
				email: values.email,
				phoneNumber: values.phoneNumber ?? "",
				password: values.password,
				roleName: "USER",
			});
			router.replace("/login?registered=1");
		} catch {
			// useAuth already handles error display
		}
	};

	return (
		<div className="group relative w-full overflow-hidden rounded-[20px] p-px">
			{/* Animated border on hover */}
			<div className="absolute -inset-full animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			<motion.form
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				onSubmit={handleSubmit(onSubmit)}
				className="relative z-10 flex h-full w-full flex-col rounded-[19px] bg-background/90 p-6 backdrop-blur-xl glass-card border border-border/50"
			>
				{/* Header */}
				<motion.div variants={itemVariants} className="mb-4 flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-gold-purple-bg shadow-[0_0_16px_rgba(168,85,247,0.3)]">
						<Sparkles className="h-5 w-5 text-primary-foreground" />
					</div>
					<div>
						<h1
							className="text-mystic-gradient text-3xl leading-none"
							style={{ fontFamily: "Fruktur, var(--font-heading)" }}
						>
							Đăng Ký
						</h1>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Tạo tài khoản PixelMage của bạn
						</p>
					</div>
				</motion.div>

				{/* Row 1: name + phone */}
				<motion.div variants={itemVariants} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="space-y-1">
						<Input
							{...register("name")}
							placeholder="Họ và tên *"
							autoComplete="name"
							className="h-11 bg-background/50 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-purple-500/50"
						/>
						{errors.name && (
							<p className="flex items-center gap-1 text-xs text-destructive">
								<AlertCircle className="h-3 w-3 shrink-0" />
								{errors.name.message}
							</p>
						)}
					</div>
					<div className="space-y-1">
						<Input
							{...register("phoneNumber")}
							placeholder="Số điện thoại (tuỳ chọn)"
							autoComplete="tel"
							className="h-11 bg-background/50 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-purple-500/50"
						/>
						{errors.phoneNumber && (
							<p className="flex items-center gap-1 text-xs text-destructive">
								<AlertCircle className="h-3 w-3 shrink-0" />
								{errors.phoneNumber.message}
							</p>
						)}
					</div>
				</motion.div>

				{/* Row 2: email */}
				<motion.div variants={itemVariants} className="mt-3 space-y-1">
					<Input
						{...register("email")}
						type="email"
						placeholder="Email *"
						autoComplete="email"
						className="h-11 bg-background/50 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-purple-500/50"
					/>
					{errors.email && (
						<p className="flex items-center gap-1 text-xs text-destructive">
							<AlertCircle className="h-3 w-3 shrink-0" />
							{errors.email.message}
						</p>
					)}
				</motion.div>

				{/* Row 3: password */}
				<motion.div variants={itemVariants} className="relative mt-3 space-y-1">
					<div className="relative">
						<Input
							{...register("password")}
							type={showPassword ? "text" : "password"}
							placeholder="Mật khẩu *"
							autoComplete="new-password"
							className="h-11 pr-11 bg-background/50 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-purple-500/50"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((v) => !v)}
							aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-purple-400"
						>
							{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
						</button>
					</div>
					{errors.password && (
						<p className="flex items-center gap-1 text-xs text-destructive">
							<AlertCircle className="h-3 w-3 shrink-0" />
							{errors.password.message}
						</p>
					)}
					<p className="text-[10px] text-muted-foreground/70">
						Tối thiểu 8 ký tự, có chữ hoa và số
					</p>
				</motion.div>

				{/* Terms checkbox */}
				<motion.div variants={itemVariants} className="mt-4 flex items-start gap-2.5">
					<button
						type="button"
						id="terms"
						role="checkbox"
						aria-checked={agreeTerms}
						onClick={() => setValue("agreeTerms", !agreeTerms, { shouldValidate: true })}
						className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
							agreeTerms
								? "gradient-gold-purple-bg border-primary"
								: "border-border/60 bg-background/50"
						}`}
					>
						{agreeTerms && (
							<svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-primary-foreground">
								<path d="M1 4l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						)}
					</button>
					<label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
						Tôi đồng ý với{" "}
						<TermsOfServiceDialog>
							<button type="button" className="text-primary hover:underline font-medium focus:outline-none">
								Điều khoản dịch vụ
							</button>
						</TermsOfServiceDialog>
						{" "}và{" "}
						<PrivacyPolicyDialog>
							<button type="button" className="text-primary hover:underline font-medium focus:outline-none">
								Chính sách bảo mật
							</button>
						</PrivacyPolicyDialog>{" "}
						của PixelMage.
					</label>
				</motion.div>
				{errors.agreeTerms && (
					<p className="mt-1 flex items-center gap-1 text-xs text-destructive">
						<AlertCircle className="h-3 w-3 shrink-0" />
						{errors.agreeTerms.message}
					</p>
				)}

				{/* API error */}
				{errorMessage ? (
					<motion.p variants={itemVariants} className="mt-3 text-xs font-medium text-destructive">
						{errorMessage}
					</motion.p>
				) : null}

				{/* Submit */}
				<motion.div
					variants={itemVariants}
					whileHover={{ scale: 1.01 }}
					whileTap={{ scale: 0.98 }}
					className="mt-4"
				>
					<Button
						type="submit"
						disabled={loading}
						className="h-11 w-full gradient-gold-purple-bg text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-shadow duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
					>
						{loading ? (
							<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<UserPlus className="mr-2 h-4 w-4" />
						)}
						Đăng ký ngay
					</Button>
				</motion.div>

				{/* Divider */}
				<motion.div
					variants={itemVariants}
					className="mt-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
				>
					<span className="h-px w-full bg-linear-to-r from-transparent via-border/60 to-transparent" />
					<span>hoặc</span>
					<span className="h-px w-full bg-linear-to-l from-transparent via-border/60 to-transparent" />
				</motion.div>

				{/* Google */}
				<motion.div
					variants={itemVariants}
					whileHover={{ scale: 1.01 }}
					whileTap={{ scale: 0.98 }}
					className="mt-4"
				>
					<Button
						type="button"
						variant="outline"
						className="h-11 w-full border-border/40 glass-card transition-colors duration-300 hover:bg-white/5"
						onClick={() => {
							const baseUrl =
								process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8080";
							window.location.href = `${baseUrl}/api/accounts/auth/google`;
						}}
					>
						<svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
							<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
							<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
							<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
						</svg>
						Tiếp tục với Google
					</Button>
				</motion.div>

				<motion.p variants={itemVariants} className="mt-5 text-center text-xs text-muted-foreground">
					Đã có tài khoản?{" "}
					<Link
						href="/login"
						className="font-semibold text-purple-400 underline-offset-4 transition-all duration-300 hover:text-purple-300 hover:underline"
					>
						Đăng nhập
					</Link>
				</motion.p>
			</motion.form>
		</div>
	);
}
