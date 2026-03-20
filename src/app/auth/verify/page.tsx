"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const StarBackground = dynamic(
  () => import("@/components/ui/star-background"),
  { ssr: false }
);

// Move core verification logic to a sub-component to wrap in Suspense
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Đang xác thực email của bạn...");

  useEffect(() => {
    const processVerification = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Link xác thực không hợp lệ. Không tìm thấy token.");
          return;
        }

        const res = await fetch(`/api/accounts/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Xác thực email thành công! Bạn có thể bắt đầu đăng nhập.");
        } else {
          setStatus("error");
          setMessage(data.message || "Xác thực email thất bại. Token có thể đã hết hạn.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Đã xảy ra sự cố trong quá trình xác thực. Vui lòng thử lại sau.");
      }
    };

    processVerification();
  }, [searchParams]);

  return (
    <div className="glass-card rounded-2xl border border-border/50 p-8 space-y-4">
      {status === "loading" && (
        <>
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h2 className="text-xl font-bold text-foreground">Đang xác thực...</h2>
          <p className="text-muted-foreground">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold text-foreground">Xác thực thành công</h2>
          <p className="text-muted-foreground">{message}</p>
          <Link 
            href="/login"
            className="mt-6 inline-block w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium transition-colors hover:bg-primary/90"
          >
            Đăng nhập ngay
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold text-destructive">Xác thực thất bại</h2>
          <p className="text-muted-foreground">{message}</p>
          <Link 
            href="/login"
            className="mt-6 inline-block w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium transition-colors hover:bg-secondary/90"
          >
            Về trang đăng nhập
          </Link>
        </>
      )}
    </div>
  );
}

export default function AuthVerifyPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <StarBackground />
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md px-6 py-24 text-center">
        <Suspense fallback={
          <div className="glass-card rounded-2xl border border-border/50 p-8 space-y-4">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h2 className="text-xl font-bold text-foreground">Đang tải...</h2>
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
