"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, LoaderCircle, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/ui/use-auth";

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
		<motion.form
			onSubmit={handleSubmit}
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: "easeOut" }}
			className="glass-card glow-gold rounded-2xl border border-border/50 p-8"
		>
			{/* Icon header */}
			<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-gold-purple-bg">
				<Sparkles className="h-6 w-6 text-primary-foreground" />
			</div>

			<h1
				className="text-mystic-gradient text-3xl"
				style={{ fontFamily: "Fruktur, var(--font-heading)" }}
			>
				Đăng Nhập
			</h1>
			<p className="mt-1 text-sm text-muted-foreground">
				Dùng tài khoản PixelMage để đồng bộ dữ liệu.
			</p>

			<div className="mt-6 space-y-3">
				<Input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
				/>
				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						placeholder="Mật khẩu"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="pr-10"
						required
					/>
					<button
						type="button"
						onClick={() => setShowPassword((v) => !v)}
						aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					>
						{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</button>
				</div>
			</div>

			{justRegistered ? (
				<p className="mt-3 text-sm text-emerald-300">
					Đăng ký thành công. Vui lòng đăng nhập để vào hệ thống.
				</p>
			) : null}

			{errorMessage ? (
				<p className="mt-3 text-sm text-destructive">{errorMessage}</p>
			) : null}

			<Button
				type="submit"
				disabled={loading}
				className="mt-6 w-full gradient-gold-purple-bg text-primary-foreground"
			>
				{loading ? (
					<LoaderCircle className="h-4 w-4 animate-spin" />
				) : (
					<LogIn className="h-4 w-4" />
				)}{" "}
				Đăng nhập
			</Button>

			<div className="divider-mystic mt-6">hoặc</div>

			<p className="mt-4 text-center text-sm text-muted-foreground">
				Chưa có tài khoản?{" "}
				<Link
					href="/register"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Đăng ký ngay
				</Link>
			</p>
		</motion.form>
	);
}
