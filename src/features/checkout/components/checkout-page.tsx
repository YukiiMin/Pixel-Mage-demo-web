"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, CheckCircle, XCircle, Loader2, Shield, ArrowLeft } from "lucide-react";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import { useCreateOrder } from "@/features/orders/hooks/use-create-order";
import { useInitiatePayment } from "@/features/orders/hooks/use-initiate-payment";
import { useOrderStatusPoll } from "@/features/orders/hooks/use-order-status-poll";
import type { Pack } from "@/types/commerce";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifyCtResponse {
  email: string;
  userId: number;
  roles: string[];
}

type CheckoutStep =
  | "verifying"     // Verifying the checkout token with BE
  | "loading_pack"  // Fetching pack details
  | "confirmed"     // Showing pack + "Confirm & Pay" CTA
  | "ordering"      // Creating the order
  | "polling"       // Showing QR / waiting for SEPay IPN
  | "success"       // Payment confirmed
  | "failed"        // Error state
  | "invalid_token"; // Token expired or already used

// ─── Deep link redirect helpers ───────────────────────────────────────────────

const MOBILE_SCHEME = "pixelmage://marketplace";

function redirectToMobile(payment: "success" | "failed", extra?: Record<string, string>) {
  const params = new URLSearchParams({ payment, ...extra });
  // Use window.location.href — Next.js router does not handle custom schemes
  window.location.href = `${MOBILE_SCHEME}?${params.toString()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  packId: number;
}

export function CheckoutPage({ packId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const ct = searchParams.get("ct") ?? "";

  const [step, setStep] = useState<CheckoutStep>("verifying");
  const [userInfo, setUserInfo] = useState<VerifyCtResponse | null>(null);
  const [pack, setPack] = useState<Pack | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();
  const { data: orderStatus } = useOrderStatusPoll(orderId);

  // Token is already used if this mounts more than once — use a ref guard
  const verifyCalledRef = useRef(false);

  // ─── Step 1: Verify checkout token ──────────────────────────────────────────
  useEffect(() => {
    if (verifyCalledRef.current) return;
    verifyCalledRef.current = true;

    if (!ct) {
      setStep("invalid_token");
      setErrorMessage("Không có checkout token. Vui lòng quay lại ứng dụng và thử lại.");
      return;
    }

    (async () => {
      try {
        const res = await apiRequest<VerifyCtResponse>(
          API_ENDPOINTS.accountManagement.verifyCheckoutToken(ct),
        );
        setUserInfo(res.data);
        setStep("loading_pack");
      } catch {
        setStep("invalid_token");
        setErrorMessage("Checkout token không hợp lệ hoặc đã hết hạn (5 phút). Vui lòng quay lại app và thử lại.");
      }
    })();
  }, [ct]);

  // ─── Step 2: Fetch pack details ──────────────────────────────────────────────
  useEffect(() => {
    if (step !== "loading_pack") return;
    (async () => {
      try {
        const res = await apiRequest<Pack>(API_ENDPOINTS.packManagement.byId(packId));
        setPack(res.data);
        setStep("confirmed");
      } catch {
        setStep("failed");
        setErrorMessage("Không thể tải thông tin pack. Vui lòng thử lại.");
      }
    })();
  }, [step, packId]);

  // ─── Step 4: Watch orderStatus for PAID/FAILED ───────────────────────────────
  useEffect(() => {
    if (!orderStatus || step !== "polling") return;

    if (orderStatus.paymentStatus === "PAID") {
      setStep("success");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Give user 2 seconds to see success state then bounce back
      setTimeout(() => redirectToMobile("success", { orderId: String(orderId) }), 2500);
    } else if (orderStatus.paymentStatus === "FAILED" || orderStatus.status === "CANCELLED") {
      setStep("failed");
      setErrorMessage("Thanh toán thất bại hoặc đã bị huỷ.");
    }
  }, [orderStatus, step, orderId, queryClient]);

  // ─── Step 3: Create order + initiate SEPay payment ──────────────────────────
  const handleConfirm = async () => {
    if (!pack || !userInfo) return;
    setStep("ordering");
    try {
      const order = await createOrder.mutateAsync({ packId: pack.packId, quantity: 1 });
      const payment = await initiatePayment.mutateAsync({
        orderId: order.orderId,
        amount: pack.price,
        currency: "VND",
      });
      setOrderId(order.orderId);
      // SEPay returns paymentUrl which is the VietQR image URL or a redirect URL
      setQrUrl(payment.paymentUrl);
      setStep("polling");
    } catch (e) {
      setStep("failed");
      setErrorMessage(e instanceof Error ? e.message : "Không thể khởi tạo thanh toán. Vui lòng thử lại.");
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => redirectToMobile("failed", { reason: "user_cancelled" })}
          className="rounded-full p-2 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
          aria-label="Quay lại ứng dụng"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Thanh toán Pack</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3 text-green-400" />
            Phiên được mã hoá · Thanh toán qua SEPay
          </p>
        </div>
      </div>

      {/* ── States ── */}
      {(step === "verifying" || step === "loading_pack") && (
        <StateCard>
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            {step === "verifying" ? "Đang xác thực phiên..." : "Đang tải thông tin pack..."}
          </p>
        </StateCard>
      )}

      {step === "invalid_token" && (
        <StateCard error>
          <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-center text-lg font-semibold text-foreground">Phiên không hợp lệ</h2>
          <p className="text-center text-sm text-muted-foreground">{errorMessage}</p>
          <button
            type="button"
            onClick={() => redirectToMobile("failed", { reason: "invalid_token" })}
            className="btn-primary mt-6 w-full"
          >
            Quay lại App
          </button>
        </StateCard>
      )}

      {step === "confirmed" && pack && (
        <div className="space-y-6">
          {/* Pack summary card */}
          <div className="glass-card rounded-2xl border border-border/40 p-6">
            {pack.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pack.imageUrl}
                alt={pack.name}
                className="mb-4 h-48 w-full rounded-xl object-cover"
              />
            )}
            <h2 className="text-xl font-bold text-foreground">{pack.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{pack.description}</p>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border/30 bg-card/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">Tổng thanh toán</span>
              <span className="font-stats text-xl font-bold text-primary">
                {new Intl.NumberFormat("vi-VN").format(pack.price)} ₫
              </span>
            </div>
            {userInfo && (
              <p className="mt-3 text-xs text-muted-foreground">
                Đăng nhập với: <span className="text-foreground">{userInfo.email}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary flex w-full items-center justify-center gap-2 py-4"
          >
            <ShoppingCart className="h-5 w-5" />
            Xác nhận & Thanh toán qua SEPay
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Bạn sẽ thấy mã QR VietQR sau khi xác nhận. Quét bằng ứng dụng ngân hàng.
          </p>
        </div>
      )}

      {step === "ordering" && (
        <StateCard>
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">Đang tạo đơn hàng...</p>
        </StateCard>
      )}

      {step === "polling" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-border/40 p-6 text-center">
            <p className="mb-4 text-sm font-medium text-foreground">Quét mã QR để thanh toán</p>
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt="SEPay VietQR"
                className="mx-auto h-64 w-64 rounded-xl border border-border/40 bg-white p-2"
              />
            ) : (
              <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border border-border/40 bg-card/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Trang này sẽ tự động cập nhật sau khi nhận được xác nhận thanh toán.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Đang chờ xác nhận từ ngân hàng...
            </div>
          </div>
          <button
            type="button"
            onClick={() => redirectToMobile("failed", { reason: "user_cancelled" })}
            className="w-full rounded-xl border border-border/40 py-3 text-sm text-muted-foreground hover:bg-card transition-colors"
          >
            Huỷ và quay lại App
          </button>
        </div>
      )}

      {step === "success" && (
        <StateCard>
          <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-400" />
          <h2 className="mb-2 text-center text-lg font-semibold text-foreground">Thanh toán thành công!</h2>
          <p className="text-center text-sm text-muted-foreground">
            Pack đang được xử lý. Đang chuyển hướng về ứng dụng...
          </p>
        </StateCard>
      )}

      {step === "failed" && (
        <StateCard error>
          <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-center text-lg font-semibold text-foreground">Có lỗi xảy ra</h2>
          <p className="text-center text-sm text-muted-foreground">{errorMessage}</p>
          <button
            type="button"
            onClick={() => redirectToMobile("failed", { reason: encodeURIComponent(errorMessage) })}
            className="btn-primary mt-6 w-full"
          >
            Quay lại App
          </button>
        </StateCard>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StateCard({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`glass-card rounded-2xl border p-8 ${
        error ? "border-destructive/30 bg-destructive/5" : "border-border/40"
      }`}
    >
      {children}
    </div>
  );
}
