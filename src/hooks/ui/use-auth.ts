"use client";

import { useCallback, useEffect, useState } from "react";
import {
	API_ENDPOINTS,
	apiRequest,
	clearStoredAuthSession,
	getStoredAccessToken,
	getStoredUserId,
	setStoredAuthSession,
} from "@/lib/api-config";
import { getApiErrorMessage } from "@/types/api";
import type { LoginPayload, RegisterPayload, UserProfile } from "@/types/user";

function normalizeUser(payload: unknown): UserProfile | null {
	if (!payload || typeof payload !== "object") {
		return null;
	}
	const raw = payload as Record<string, unknown>;
	const id = Number(raw.id ?? raw.accountId ?? raw.userId ?? 0);
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

function normalizeLoginResult(payload: unknown): { token: string; user: UserProfile | null } | null {
	if (!payload || typeof payload !== "object") {
		return null;
	}
	const raw = payload as Record<string, unknown>;
	const tokenCandidate =
		raw.token ?? raw.accessToken ?? (raw.data && (raw.data as Record<string, unknown>).token);
	const token = String(tokenCandidate ?? "").trim();
	if (!token) {
		return null;
	}

	const user =
		normalizeUser(raw.user) ??
		normalizeUser(raw.account) ??
		normalizeUser(raw.profile) ??
		normalizeUser(raw.data);

	return { token, user };
}

export function useAuth() {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const login = useCallback(async (payload: LoginPayload) => {
		setLoading(true);
		setErrorMessage("");
		try {
			const response = await apiRequest<unknown>(API_ENDPOINTS.accountManagement.login, {
				method: "POST",
				body: JSON.stringify(payload),
			});
			const result = normalizeLoginResult(response.data);
			if (!result) {
				throw new Error("Đăng nhập thành công nhưng không nhận được token hợp lệ.");
			}

			setStoredAuthSession({
				token: result.token,
				userId: result.user?.id ?? null,
				email: result.user?.email ?? null,
				name: result.user?.name ?? null,
			});

			return result;
		} catch (error) {
			const message = getApiErrorMessage(error, "Không thể đăng nhập.");
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
					roleId: payload.roleId ?? 1,
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
		const token = getStoredAccessToken() ?? undefined;
		try {
			if (token) {
				await apiRequest<unknown>(API_ENDPOINTS.accountManagement.logout, {
					method: "POST",
					token,
				});
			}
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
	const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unavailable" | "error">("idle");
	const [statusMessage, setStatusMessage] = useState("");

	useEffect(() => {
		let active = true;

		const loadProfile = async () => {
			setStatus("loading");
			setStatusMessage("Đang tải hồ sơ người dùng...");

			const userId = getStoredUserId();
			if (!userId) {
				if (!active) return;
				setProfile(null);
				setStatus("unavailable");
				setStatusMessage("Chưa xác định được tài khoản hiện tại. Chức năng Profile chưa cập nhật cho phiên này.");
				return;
			}

			try {
				const token = getStoredAccessToken() ?? undefined;
				const response = await apiRequest<unknown>(API_ENDPOINTS.accountManagement.byId(userId), {
					method: "GET",
					cache: "no-store",
					token,
				});
				if (!active) return;

				const normalized = normalizeUser(response.data);
				if (!normalized) {
					setProfile(null);
					setStatus("unavailable");
					setStatusMessage("BE đã phản hồi nhưng dữ liệu hồ sơ chưa đầy đủ. Chức năng chưa cập nhật.");
					return;
				}

				setProfile(normalized);
				setStatus("ready");
				setStatusMessage("");
			} catch (error) {
				if (!active) return;
				setProfile(null);
				setStatus("unavailable");
				setStatusMessage(`${getApiErrorMessage(error, "Không thể tải hồ sơ từ BE.")} Chức năng chưa cập nhật.`);
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

	const updateProfile = useCallback(async (payload: UpdateProfilePayload): Promise<UserProfile | null> => {
		setLoading(true);
		setErrorMessage("");
		const userId = getStoredUserId();
		if (!userId) {
			setErrorMessage("Chưa xác định được tài khoản hiện tại.");
			setLoading(false);
			return null;
		}
		try {
			const token = getStoredAccessToken() ?? undefined;
			const response = await apiRequest<unknown>(
				API_ENDPOINTS.accountManagement.byId(userId),
				{ method: "PUT", body: JSON.stringify(payload), token },
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
	}, []);

	return { updateProfile, loading, errorMessage };
}
