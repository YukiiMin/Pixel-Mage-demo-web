"use client";

import { useState } from "react";
import { LoaderCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useForgotPassword } from "@/hooks/ui/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, errorMessage } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const res = await forgotPassword({ email });
    if (res) {
      setSuccess(true);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-2xl border border-border/50 p-6 shadow-xl relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
        
        <div className="relative text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-2xl font-bold font-heading">Quên mật khẩu?</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Nhập email của bạn và chúng tôi sẽ gửi liên kết khôi phục.
          </p>
        </div>

        {success ? (
          <div className="relative text-center space-y-4">
            <div className="rounded-lg bg-green-500/10 p-4 text-green-500 border border-green-500/20 text-sm">
              Nếu email hợp lệ, hệ thống sẽ gửi liên kết khôi phục. Vui lòng kiểm tra hộp thư của bạn.
            </div>
            <Link href="/login" className="text-sm font-medium text-primary hover:underline block">
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-4">
            <div className="space-y-1 text-left">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Ex. hello@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card/60"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive text-center">{errorMessage}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="gradient-gold-purple-bg w-full rounded-full text-primary-foreground glow-gold font-semibold"
            >
              {loading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Đang gửi..." : "Gửi liên kết"}
            </Button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
