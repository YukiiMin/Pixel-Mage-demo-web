"use client";

import {
	AlertCircle,
	Check,
	KeyRound,
	LoaderCircle,
	LogOut,
	Pencil,
	UserRound,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	useAuth,
	useChangePassword,
	useProfile,
	useUpdateProfile,
} from "@/features/auth/hooks/use-auth";
import { ReadingHistory } from "@/features/tarot/components/reading-history";
import { getStoredUserId } from "@/lib/api-config";

export function ProfilePage() {
	const router = useRouter();
	const { logout } = useAuth();

	const [userId, setUserId] = useState<number | null>(null);
	useEffect(() => {
		setUserId(getStoredUserId());
	}, []);

	const {
		data: profile,
		isLoading: isProfileLoading,
		isError,
	} = useProfile(userId);

	let status: "loading" | "ready" | "unavailable" | "error" = "loading";
	let statusMessage = "";

	if (isProfileLoading) {
		status = "loading";
		statusMessage = "Đang tải hồ sơ người dùng...";
	} else if (isError) {
		status = "error";
		statusMessage = "Không thể tải hồ sơ từ BE. Chức năng chưa cập nhật.";
	} else if (profile) {
		status = "ready";
	} else if (!userId) {
		status = "unavailable";
		statusMessage =
			"Chưa xác định được tài khoản hiện tại. Chức năng Profile chưa cập nhật cho phiên này.";
	}
	const {
		updateProfile,
		loading: saving,
		errorMessage: saveError,
	} = useUpdateProfile();
	const {
		changePassword,
		loading: changingPwd,
		errorMessage: changePwdError,
	} = useChangePassword();
	const [editing, setEditing] = useState(false);
	const [editName, setEditName] = useState("");
	const [editPhone, setEditPhone] = useState("");
	const [localProfile, setLocalProfile] = useState(profile);
	const [pwdEditing, setPwdEditing] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pwdSuccess, setPwdSuccess] = useState("");
	const [localPwdError, setLocalPwdError] = useState("");

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	const startEdit = () => {
		const p = localProfile ?? profile;
		setEditName(p?.name ?? "");
		setEditPhone(p?.phoneNumber ?? "");
		setEditing(true);
	};

	const cancelEdit = () => setEditing(false);

	const saveEdit = async () => {
		try {
			const updated = await updateProfile({
				name: editName.trim() || undefined,
				phoneNumber: editPhone.trim() || undefined,
			});
			if (updated) setLocalProfile(updated);
			setEditing(false);
		} catch {
			// saveError already set by hook
		}
	};

	const startPwdEdit = () => {
		setPwdEditing(true);
		setPwdSuccess("");
		setLocalPwdError("");
		setOldPassword("");
		setNewPassword("");
		setConfirmPassword("");
	};

	const cancelPwdEdit = () => {
		setPwdEditing(false);
		setLocalPwdError("");
	};

	const savePassword = async () => {
		setLocalPwdError("");
		if (!oldPassword || !newPassword || !confirmPassword) {
			setLocalPwdError("Vui lòng nhập đầy đủ thông tin.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setLocalPwdError("Mật khẩu mới và xác nhận không khớp.");
			return;
		}
		try {
			const success = await changePassword({ oldPassword, newPassword });
			if (success) {
				setPwdSuccess("Đổi mật khẩu thành công!");
				setPwdEditing(false);
				setOldPassword("");
				setNewPassword("");
				setConfirmPassword("");
				setTimeout(() => setPwdSuccess(""), 3000);
			}
		} catch {
			// changePwdError already set by hook
		}
	};

	const displayProfile = localProfile ?? profile;
	if (status === "loading") {
		return (
			<div className="container mx-auto max-w-4xl px-6 pb-20">
				<div className="glass-card rounded-2xl border border-border/50 p-8 text-center">
					<LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
					<p className="mt-2 text-sm text-muted-foreground">
						Đang tải hồ sơ...
					</p>
				</div>
			</div>
		);
	}

	if (status !== "ready" || !profile) {
		return (
			<div className="container mx-auto max-w-4xl px-6 pb-20">
				<div className="glass-card rounded-2xl border border-amber-300/30 bg-amber-300/5 p-6">
					<p className="text-sm font-semibold text-amber-200">
						{statusMessage || "Chức năng Profile chưa cập nhật."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl px-6 pb-20">
			<section className="mb-6 rounded-3xl border border-border/40 bg-linear-to-r from-card/80 via-card/60 to-card/40 p-6 md:p-8">
				<p className="badge-mystic mb-3 inline-flex">Identity</p>
				<h1
					className="text-4xl leading-tight text-foreground md:text-5xl"
					style={{ fontFamily: "Fruktur, var(--font-heading)" }}
				>
					Profile
				</h1>
				<p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
					Thông tin tài khoản đồng bộ trực tiếp từ backend.
				</p>
			</section>

			<div className="glass-card rounded-2xl border border-border/50 p-6">
				<div className="mb-4 flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 text-foreground">
						<UserRound className="h-5 w-5 text-primary" />
						<p className="text-lg font-semibold">{displayProfile?.name}</p>
					</div>
					{!editing && (
						<button
							type="button"
							onClick={startEdit}
							className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
						>
							<Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
						</button>
					)}
				</div>

				{editing ? (
					<div className="space-y-4">
						<div className="grid gap-3 md:grid-cols-2">
							<div className="space-y-1">
								<label
									htmlFor="edit-name"
									className="text-xs font-medium text-muted-foreground"
								>
									Họ và tên
								</label>
								<Input
									id="edit-name"
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									placeholder="Nhập tên của bạn"
									className="bg-card/60"
								/>
							</div>
							<div className="space-y-1">
								<label
									htmlFor="edit-phone"
									className="text-xs font-medium text-muted-foreground"
								>
									Số điện thoại
								</label>
								<Input
									id="edit-phone"
									value={editPhone}
									onChange={(e) => setEditPhone(e.target.value)}
									placeholder="Nhập số điện thoại"
									className="bg-card/60"
								/>
							</div>
						</div>
						{saveError && (
							<p className="text-xs text-destructive">{saveError}</p>
						)}
						<div className="flex items-center gap-2">
							<Button
								type="button"
								size="sm"
								onClick={saveEdit}
								disabled={saving}
								className="gradient-gold-purple-bg rounded-full px-5 text-xs font-semibold text-primary-foreground glow-gold"
							>
								{saving ? (
									<LoaderCircle className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Check className="h-3.5 w-3.5" />
								)}
								Lưu thay đổi
							</Button>
							<Button
								type="button"
								size="sm"
								variant="ghost"
								onClick={cancelEdit}
								disabled={saving}
								className="rounded-full px-5 text-xs"
							>
								<X className="h-3.5 w-3.5" /> Hủy
							</Button>
						</div>
					</div>
				) : (
					<div className="grid gap-3 text-sm md:grid-cols-2">
						<p className="text-muted-foreground">
							Email:{" "}
							<span className="text-foreground">{displayProfile?.email}</span>
						</p>
						<p className="text-muted-foreground">
							Số điện thoại:{" "}
							<span className="text-foreground">
								{displayProfile?.phoneNumber || "Chưa cập nhật"}
							</span>
						</p>
						<p className="text-muted-foreground">
							Role ID:{" "}
							<span className="text-foreground">
								{displayProfile?.role?.roleName ?? "N/A"}
							</span>
						</p>
						<p className="text-muted-foreground">
							Provider:{" "}
							<span className="text-foreground">
								{displayProfile?.authProvider || "LOCAL"}
							</span>
						</p>
					</div>
				)}
			</div>

			{/* CHANGE PASSWORD SECTION (Only for LOCAL provider) */}
			{(!displayProfile?.authProvider ||
				displayProfile?.authProvider === "LOCAL") && (
				<div className="glass-card mt-6 rounded-2xl border border-border/50 p-6">
					<div className="mb-4 flex items-start justify-between gap-2">
						<div className="flex items-center gap-2 text-foreground">
							<KeyRound className="h-5 w-5 text-primary" />
							<p className="text-lg font-semibold">Mật khẩu và Bảo mật</p>
						</div>
						{!pwdEditing && (
							<button
								type="button"
								onClick={startPwdEdit}
								className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
							>
								<Pencil className="h-3.5 w-3.5" /> Đổi mật khẩu
							</button>
						)}
					</div>

					{pwdSuccess && (
						<div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-500 border border-green-500/20">
							{pwdSuccess}
						</div>
					)}

					{pwdEditing ? (
						<div className="space-y-4">
							<div className="space-y-3 max-w-sm">
								<div className="space-y-1">
									<label className="text-xs font-medium text-muted-foreground">
										Mật khẩu hiện tại
									</label>
									<Input
										type="password"
										value={oldPassword}
										onChange={(e) => setOldPassword(e.target.value)}
										placeholder="Nhập mật khẩu cũ"
										className="bg-card/60"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-xs font-medium text-muted-foreground">
										Mật khẩu mới
									</label>
									<Input
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="Nhập mật khẩu mới"
										className="bg-card/60"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-xs font-medium text-muted-foreground">
										Xác nhận mật khẩu mới
									</label>
									<Input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="Nhập lại mật khẩu mới"
										className="bg-card/60"
									/>
								</div>
							</div>
							{(localPwdError || changePwdError) && (
								<div className="flex items-center gap-2 text-xs text-destructive">
									<AlertCircle className="h-4 w-4" />
									<p>{localPwdError || changePwdError}</p>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Button
									type="button"
									size="sm"
									onClick={savePassword}
									disabled={changingPwd}
									className="gradient-gold-purple-bg rounded-full px-5 text-xs font-semibold text-primary-foreground glow-gold"
								>
									{changingPwd ? (
										<LoaderCircle className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Check className="h-3.5 w-3.5" />
									)}
									Lưu mật khẩu
								</Button>
								<Button
									type="button"
									size="sm"
									variant="ghost"
									onClick={cancelPwdEdit}
									disabled={changingPwd}
									className="rounded-full px-5 text-xs"
								>
									<X className="h-3.5 w-3.5" /> Hủy
								</Button>
							</div>
						</div>
					) : (
						<div className="text-sm text-muted-foreground">
							<p>Sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
							<p className="mt-1 text-xs">Cập nhật lần cuối: Chưa rõ</p>
						</div>
					)}
				</div>
			)}

			<div className="mt-8 flex justify-end">
				<Button
					onClick={handleLogout}
					variant="outline"
					className="mt-6 border-destructive/40 text-destructive hover:bg-destructive/10"
				>
					<LogOut className="h-4 w-4" /> Đăng xuất
				</Button>
			</div>

			<ReadingHistory />
		</div>
	);
}
