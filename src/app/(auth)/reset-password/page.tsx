"use client";

import {
	AlertCircle,
	CheckCircle2,
	KeyRound,
	LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/features/auth/hooks/use-auth";

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const { resetPassword, loading, errorMessage } = useResetPassword();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [localError, setLocalError] = useState("");
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (!token) {
			setLocalError("Liên kết không hợp lệ hoặc đã hết hạn.");
		}
	}, [token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError("");

		if (!token) {
			setLocalError("Liên kết không hợp lệ.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setLocalError("Mật khẩu và xác nhận không khớp.");
			return;
		}

		const res = await resetPassword({ token, newPassword });
		if (res) {
			setSuccess(true);
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		}
	};

	return (
		<div className="relative">
			<div className="text-center mb-6">
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
					<KeyRound className="h-6 w-6" />
				</div>
				<h1 className="mb-2 text-2xl font-bold font-heading">
					Tạo mật khẩu mới
				</h1>
				<p className="text-sm text-muted-foreground">
					Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
				</p>
			</div>

			{success ? (
				<div className="text-center space-y-4">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
						<CheckCircle2 className="h-6 w-6" />
					</div>
					<div className="rounded-lg bg-green-500/10 p-4 text-green-500 border border-green-500/20 text-sm">
						Đổi mật khẩu thành công. Đang chuyển hướng đến trang đăng nhập...
					</div>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-4 text-left">
					<div className="space-y-3">
						<div className="space-y-1">
							<label className="text-xs font-medium text-muted-foreground">
								Mật khẩu mới
							</label>
							<Input
								type="password"
								placeholder="Nhập mật khẩu mới"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								className="bg-card/60"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-xs font-medium text-muted-foreground">
								Xác nhận mật khẩu
							</label>
							<Input
								type="password"
								placeholder="Nhập lại mật khẩu"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="bg-card/60"
							/>
						</div>
					</div>

					{(localError || errorMessage) && (
						<div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
							<AlertCircle className="h-4 w-4 shrink-0" />
							<p>{localError || errorMessage}</p>
						</div>
					)}

					<Button
						type="submit"
						disabled={loading || !token || success}
						className="gradient-gold-purple-bg w-full rounded-full text-primary-foreground glow-gold font-semibold"
					>
						{loading ? (
							<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
						) : null}
						{loading ? "Đang xử lý..." : "Lưu mật khẩu"}
					</Button>

					<div className="text-center mt-4">
						<Link
							href="/login"
							className="text-sm font-medium text-primary hover:underline"
						>
							Quay lại đăng nhập
						</Link>
					</div>
				</form>
			)}
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
			<div className="glass-card w-full max-w-md rounded-2xl border border-border/50 p-6 shadow-xl relative overflow-hidden">
				{/* Background Gradients */}
				<div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />

				<Suspense
					fallback={
						<div className="flex items-center justify-center p-8 relative">
							<LoaderCircle className="h-8 w-8 animate-spin text-primary" />
						</div>
					}
				>
					<ResetPasswordForm />
				</Suspense>
			</div>
		</div>
	);
}
