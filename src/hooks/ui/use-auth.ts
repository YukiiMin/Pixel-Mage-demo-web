"use client";

import { useCallback, useEffect, useState } from "react";
import {
  API_ENDPOINTS,
  apiRequest,
  clearStoredAuthSession,
  ensureStoredUserId,
  setStoredAuthSession,
} from "@/lib/api-config";
import { getApiErrorMessage } from "@/types/api";
import type { LoginPayload, RegisterPayload, UserProfile } from "@/types/user";

function normalizeUser(payload: unknown): UserProfile | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const raw = payload as Record<string, unknown>;
  const id = Number(
    raw.id ?? raw.accountId ?? raw.userId ?? raw.customerId ?? 0,
  );
  const email = String(raw.email ?? "").trim();
  const name = String(raw.name ?? raw.fullName ?? "").trim();
  if (!id || !email || !name) {
    return null;
  }
  return {
    id,
    email,
    name,
    phoneNumber: String(raw.phoneNumber ?? "") || undefined,
    roleId: Number(raw.roleId ?? 0) || undefined,
    provider: String(raw.provider ?? raw.authProvider ?? "") || undefined,
  };
}

function normalizeLoginResult(payload: unknown): {
  token: string | null;
  user: UserProfile | null;
  userId: number | null;
} | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const raw = payload as Record<string, unknown>;
  const data =
    raw.data && typeof raw.data === "object"
      ? (raw.data as Record<string, unknown>)
      : null;
  const tokenCandidate =
    raw.token ?? raw.accessToken ?? data?.token ?? data?.accessToken;
  const token = String(tokenCandidate ?? "").trim() || null;

  const user =
    normalizeUser(raw.user) ??
    normalizeUser(raw.account) ??
    normalizeUser(raw.profile) ??
    normalizeUser(raw.data);

  const userIdCandidate =
    user?.id ??
    Number(
      raw.userId ??
        raw.accountId ??
        raw.id ??
        data?.userId ??
        data?.accountId ??
        data?.id ??
        0,
    );
  const userId =
    Number.isInteger(userIdCandidate) && userIdCandidate > 0
      ? userIdCandidate
      : null;

  return { token, user, userId };
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setErrorMessage("");
    const normalizedPayload: LoginPayload = {
      ...payload,
      email: String(payload.email ?? "").trim().toLowerCase(),
      password: String(payload.password ?? ""),
    };
    try {
      const response = await apiRequest<unknown>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(normalizedPayload),
      });
      const result = normalizeLoginResult(response.data);
      const fallbackUserId = Number(
        (response.data as Record<string, unknown>)?.userId ?? 0,
      );
      const userIdFromSession =
        result?.user?.id ??
        result?.userId ??
        (Number.isInteger(fallbackUserId) && fallbackUserId > 0
          ? fallbackUserId
          : null);
      const emailFromSession =
        result?.user?.email ??
        (String(
          (response.data as Record<string, unknown>)?.email ?? "",
        ).trim() ||
          normalizedPayload.email);
      const nameFromSession =
        result?.user?.name ??
        (String(
          (response.data as Record<string, unknown>)?.name ?? "",
        ).trim() ||
          normalizedPayload.email);

      setStoredAuthSession({
        userId: userIdFromSession,
        email: emailFromSession,
        name: nameFromSession,
      });

      return result;
    } catch (error) {
      const rawMessage = getApiErrorMessage(error, "Không thể đăng nhập.");
      const message = /exceptionSupplier|Cannot invoke\s+"java\.util\.function\.Supplier\.get\(\)"/i.test(
        rawMessage,
      )
        ? "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập."
        : rawMessage;
      setErrorMessage(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await apiRequest<unknown>(API_ENDPOINTS.accountManagement.registration, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          roleId: 3,
        }),
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Không thể đăng ký tài khoản.");
      setErrorMessage(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest<unknown>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      clearStoredAuthSession();
    }
  }, []);

  return {
    loading,
    errorMessage,
    login,
    register,
    logout,
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "unavailable" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setStatus("loading");
      setStatusMessage("Đang tải hồ sơ người dùng...");

      const userId = await ensureStoredUserId();
      if (!userId) {
        if (!active) return;
        setProfile(null);
        setStatus("unavailable");
        setStatusMessage(
          "Chưa xác định được tài khoản hiện tại. Chức năng Profile chưa cập nhật cho phiên này.",
        );
        return;
      }

      try {
        const response = await apiRequest<unknown>(
          API_ENDPOINTS.accountManagement.byId(userId),
          {
            method: "GET",
            cache: "no-store",
          },
        );
        if (!active) return;

        const normalized = normalizeUser(response.data);
        if (!normalized) {
          setProfile(null);
          setStatus("unavailable");
          setStatusMessage(
            "BE đã phản hồi nhưng dữ liệu hồ sơ chưa đầy đủ. Chức năng chưa cập nhật.",
          );
          return;
        }

        setProfile(normalized);
        setStatus("ready");
        setStatusMessage("");
      } catch (error) {
        if (!active) return;
        setProfile(null);
        setStatus("unavailable");
        setStatusMessage(
          `${getApiErrorMessage(error, "Không thể tải hồ sơ từ BE.")} Chức năng chưa cập nhật.`,
        );
      }
    };

    loadProfile().catch(() => {
      if (!active) return;
      setProfile(null);
      setStatus("error");
      setStatusMessage("Không thể tải hồ sơ từ BE.");
    });

    return () => {
      active = false;
    };
  }, []);

  return {
    profile,
    status,
    statusMessage,
  };
}

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<UserProfile | null> => {
      setLoading(true);
      setErrorMessage("");
      const userId = await ensureStoredUserId();
      if (!userId) {
        setErrorMessage("Chưa xác định được tài khoản hiện tại.");
        setLoading(false);
        return null;
      }
      try {
        const response = await apiRequest<unknown>(
          API_ENDPOINTS.accountManagement.byId(userId),
          { method: "PUT", body: JSON.stringify(payload) },
        );
        const normalized = normalizeUser(response.data);
        return normalized;
      } catch (error) {
        const message = getApiErrorMessage(error, "Không thể cập nhật hồ sơ.");
        setErrorMessage(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { updateProfile, loading, errorMessage };
}
