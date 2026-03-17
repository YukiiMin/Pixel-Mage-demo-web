"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";

const StarBackground = dynamic(
  () => import("@/components/ui/star-background"),
  { ssr: false }
);

export default function AuthSuccessPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const email = params.get("email");
        const name = params.get("name");

        if (!accessToken) {
          setError("Không tìm thấy thông tin đăng nhập từ Google.");
          return;
        }

        const res = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken, refreshToken, email, name }),
        });

        if (res.ok) {
          router.replace("/");
          router.refresh();
        } else {
          setError("Đã xảy ra lỗi khi tạo phiên đăng nhập.");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi không xác định.");
      }
    };

    processCallback();
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <StarBackground />
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md px-6 py-24 text-center">
        <div className="glass-card rounded-2xl border border-border/50 p-8 space-y-4">
          {error ? (
            <>
              <h2 className="text-xl font-bold text-destructive">Lỗi đăng nhập</h2>
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={() => router.push("/login")}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
              >
                Quay lại đăng nhập
              </button>
            </>
          ) : (
            <>
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
              <h2 className="text-xl font-bold text-foreground">Đang xử lý đăng nhập...</h2>
              <p className="text-muted-foreground">Vui lòng đợi giây lát.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
