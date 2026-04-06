"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
	API_ENDPOINTS,
	apiRequest,
	clearStoredAuthSession,
	getStoredUserId,
	setStoredAuthSession,
} from "@/lib/api-config";
import { getApiErrorMessage } from "@/types/api";
import type {
	ChangePasswordPayload,
	ForgotPasswordPayload,
	LoginPayload,
	RegisterPayload,
	ResetPasswordPayload,
	UpdateProfilePayload,
	UserProfile,
} from "@/types/user";

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

	const role = String(raw.role ?? "").trim() || undefined;

	return {
		customerId: id,
		email,
		name,
		phoneNumber: String(raw.phoneNumber ?? "") || undefined,
		role: role as "USER" | "STAFF" | "ADMIN" | undefined,
		authProvider: String(raw.authProvider ?? raw.provider ?? "") || undefined,
		avatarUrl: String(raw.avatarUrl ?? "") || undefined,
		emailVerified: Boolean(raw.emailVerified ?? false),
		createdAt: String(raw.createdAt ?? "") || undefined,
		updatedAt: String(raw.updatedAt ?? "") || undefined,
		isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : undefined,
	};
}

function pickRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object") {
		return null;
	}
	return value as Record<string, unknown>;
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
		user?.customerId ??
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
			email: String(payload.email ?? "")
				.trim()
				.toLowerCase(),
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
				result?.user?.customerId ??
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

			if (userIdFromSession) {
				setStoredAuthSession(userIdFromSession, result?.user?.role);
			}

			return result;
		} catch (error) {
			const rawMessage = getApiErrorMessage(error, "Không thể đăng nhập.");
			const message =
				/exceptionSupplier|Cannot invoke\s+"java\.util\.function\.Supplier\.get\(\)"/i.test(
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
					roleName: payload.roleName || "USER",
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

export function useProfile(userId: number | null) {
	return useQuery({
		queryKey: ["account", userId],
		queryFn: () =>
			apiRequest<unknown>(API_ENDPOINTS.accountManagement.byId(userId!), {
				method: "GET",
				cache: "no-store",
			}).then((r) => {
				const normalized = normalizeUser(r.data);
				if (!normalized) {
					throw new Error("Invalid user data");
				}
				return normalized;
			}),
		enabled: !!userId,
		staleTime: 60_000,
	});
}

export function useUpdateProfile() {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const updateProfile = useCallback(
		async (payload: UpdateProfilePayload): Promise<UserProfile | null> => {
			setLoading(true);
			setErrorMessage("");
			const userId = getStoredUserId();
			if (!userId) {
				setErrorMessage("Chưa xác định được tài khoản hiện tại.");
				setLoading(false);
				return null;
			}
			try {
				const response = await apiRequest<unknown>(
					API_ENDPOINTS.accountManagement.updateProfile(userId),
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

export function useChangePassword() {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const changePassword = useCallback(
		async (payload: ChangePasswordPayload): Promise<boolean> => {
			setLoading(true);
			setErrorMessage("");
			const userId = getStoredUserId();
			if (!userId) {
				setErrorMessage("Chưa xác định được tài khoản hiện tại.");
				setLoading(false);
				return false;
			}
			try {
				await apiRequest<unknown>(
					API_ENDPOINTS.accountManagement.changePassword(userId),
					{ method: "PUT", body: JSON.stringify(payload) },
				);
				return true;
			} catch (error) {
				const message = getApiErrorMessage(error, "Không thể đổi mật khẩu.");
				setErrorMessage(message);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	return { changePassword, loading, errorMessage };
}

export function useForgotPassword() {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const forgotPassword = useCallback(
		async (payload: ForgotPasswordPayload): Promise<boolean> => {
			setLoading(true);
			setErrorMessage("");
			try {
				await apiRequest<unknown>(
					API_ENDPOINTS.accountManagement.forgotPassword,
					{ method: "POST", body: JSON.stringify(payload) },
				);
				return true;
			} catch (error) {
				const message = getApiErrorMessage(
					error,
					"Không thể gửi yêu cầu đặt lại mật khẩu.",
				);
				setErrorMessage(message);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	return { forgotPassword, loading, errorMessage };
}

export function useResetPassword() {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const resetPassword = useCallback(
		async (payload: ResetPasswordPayload): Promise<boolean> => {
			setLoading(true);
			setErrorMessage("");
			try {
				await apiRequest<unknown>(
					API_ENDPOINTS.accountManagement.resetPassword,
					{ method: "POST", body: JSON.stringify(payload) },
				);
				return true;
			} catch (error) {
				const message = getApiErrorMessage(
					error,
					"Không thể đặt lại mật khẩu.",
				);
				setErrorMessage(message);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	return { resetPassword, loading, errorMessage };
}
