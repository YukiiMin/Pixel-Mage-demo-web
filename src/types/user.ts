export interface UserProfile {
	customerId: number;
	email: string;
	name: string;
	phoneNumber?: string;
	avatarUrl?: string;
	gender?: string;
	dateOfBirth?: string;
	address?: string;
	emailVerified?: boolean;
	authProvider?: string;
	createdAt?: string;
	updatedAt?: string;
	isActive?: boolean;
	role?: "USER" | "STAFF" | "ADMIN";
	guestReadingUsedToday?: boolean;
}

export interface RegisterPayload {
	email: string;
	password: string;
	name: string;
	phoneNumber?: string;
	roleName?: string;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface UpdateProfilePayload {
	name?: string;
	phoneNumber?: string;
	avatarUrl?: string;
	gender?: string;
	dateOfBirth?: string;
	address?: string;
}

export interface ChangePasswordPayload {
	oldPassword?: string;
	newPassword?: string;
}

export interface ForgotPasswordPayload {
	email: string;
}

export interface ResetPasswordPayload {
	token: string;
	newPassword: string;
}
