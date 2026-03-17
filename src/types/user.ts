export interface UserProfile {
	id: number;
	email: string;
	name: string;
	phoneNumber?: string;
	roleId?: number;
	provider?: string;
}

export interface RegisterPayload {
	email: string;
	password: string;
	name: string;
	phoneNumber?: string;
	roleId?: number;
}

export interface LoginPayload {
	email: string;
	password: string;
}
