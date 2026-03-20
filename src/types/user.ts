export interface UserProfile {
	customerId: number;
	email: string;
	name: string;
	phoneNumber?: string;
	avatarUrl?: string;
	emailVerified?: boolean;
	authProvider?: string;
	providerId?: string;
	createdAt?: string;
	updatedAt?: string;
	isActive?: boolean;
	role?: {
		roleId: number;
		roleName: string;
	};
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
