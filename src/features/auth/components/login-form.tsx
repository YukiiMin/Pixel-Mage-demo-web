"use client";

import { motion, type Variants } from "framer-motion";
import { Eye, EyeOff, LoaderCircle, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/use-auth";

// Khai báo Variants chuẩn TypeScript cho Framer Motion
const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			delayChildren: 0.1,
			staggerChildren: 0.1,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login, loading, errorMessage } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const justRegistered = searchParams.get("registered") === "1";

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			await login({ email, password });
			router.replace("/");
		} catch {
			// useAuth already sets a user-facing error message.
		}
	};

	return (
		<div className="group relative w-full overflow-hidden rounded-[20px] p-1px">
			{/* Hiệu ứng viền chạy tông Vàng - Tím */}
			<div className="absolute -inset-full animate-[spin_4s_linear_infinite] bg-linear-to-r from-transparent via-border/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			<motion.form
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				onSubmit={handleSubmit}
				className="relative z-10 flex h-full w-full flex-col rounded-[19px] bg-background/90 p-8 backdrop-blur-xl glass-card border border-border/50"
			>
				{/* Icon header */}
				<motion.div
					variants={itemVariants}
					className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl gradient-gold-purple-bg shadow-[0_0_20px_rgba(234,179,8,0.25)]"
				>
					<Sparkles className="h-7 w-7 text-primary-foreground" />
				</motion.div>

				<motion.h1
					variants={itemVariants}
					className="text-mystic-gradient text-4xl"
					style={{ fontFamily: "Fruktur, var(--font-heading)" }}
				>
					Đăng Nhập
				</motion.h1>
				<motion.p
					variants={itemVariants}
					className="mt-2 text-sm text-muted-foreground"
				>
					Dùng tài khoản PixelMage để đồng bộ dữ liệu.
				</motion.p>

				<div className="mt-8 space-y-4">
					<motion.div variants={itemVariants}>
						<Input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							className="h-12 bg-background/50 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-yellow-500/50"
						/>
					</motion.div>
					<motion.div variants={itemVariants} className="relative">
						<Input
							type={showPassword ? "text" : "password"}
							placeholder="Mật khẩu"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className="h-12 pr-11 bg-background/50 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-yellow-500/50"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword((v) => !v)}
							aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-yellow-400"
						>
							{showPassword ? (
								<EyeOff className="h-5 w-5" />
							) : (
								<Eye className="h-5 w-5" />
							)}
						</button>
					</motion.div>

					<motion.div variants={itemVariants} className="flex justify-end px-1">
						<Link
							href="/forgot-password"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-yellow-400"
						>
							Quên mật khẩu?
						</Link>
					</motion.div>
				</div>

				{justRegistered ? (
					<motion.p
						variants={itemVariants}
						className="mt-4 text-sm font-medium text-emerald-400"
					>
						Đăng ký thành công. Vui lòng đăng nhập để vào hệ thống.
					</motion.p>
				) : null}

				{errorMessage ? (
					<motion.p
						variants={itemVariants}
						className="mt-4 text-sm font-medium text-destructive"
					>
						{errorMessage}
					</motion.p>
				) : null}

				<motion.div
					variants={itemVariants}
					whileHover={{ scale: 1.01 }}
					whileTap={{ scale: 0.98 }}
					className="mt-8"
				>
					<Button
						type="submit"
						disabled={loading}
						className="h-12 w-full gradient-gold-purple-bg text-primary-foreground shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-shadow duration-300 hover:shadow-[0_0_25px_rgba(234,179,8,0.4)]"
					>
						{loading ? (
							<LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
						) : (
							<LogIn className="mr-2 h-5 w-5" />
						)}
						Đăng nhập
					</Button>
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="divider-mystic mt-6 flex items-center justify-center space-x-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
				>
					<span className="h-1px w-full bg-linear-to-r from-transparent via-border/60 to-transparent" />
					<span>hoặc</span>
					<span className="h-1px w-full bg-linear-to-l from-transparent via-border/60 to-transparent" />
				</motion.div>

				<motion.div
					variants={itemVariants}
					whileHover={{ scale: 1.01 }}
					whileTap={{ scale: 0.98 }}
					className="mt-6"
				>
					<Button
						type="button"
						variant="outline"
						className="h-12 w-full border-border/40 glass-card transition-colors duration-300 hover:bg-white/5"
						onClick={() => {
							const baseUrl =
								process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
							window.location.href = `${baseUrl}/api/accounts/auth/google`;
						}}
					>
						<svg
							className="mr-2 h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Tiếp tục với Google
					</Button>
				</motion.div>

				<motion.p
					variants={itemVariants}
					className="mt-8 text-center text-sm text-muted-foreground"
				>
					Chưa có tài khoản?{" "}
					<Link
						href="/register"
						className="font-semibold text-yellow-500 underline-offset-4 transition-all duration-300 hover:text-yellow-400 hover:underline"
					>
						Đăng ký ngay
					</Link>
				</motion.p>
			</motion.form>
		</div>
	);
}
