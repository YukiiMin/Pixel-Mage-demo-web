export interface Account {
	id: number;
	email: string;
	name: string;
	phoneNumber: string | null;
	roleId: number | null;
	provider: string | null;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegistrationPayload {
	email: string;
	password: string;
	name: string;
	phoneNumber: string;
	roleId: number;
}

export interface UpdateAccountPayload {
	name: string;
	phoneNumber: string;
}

export interface AuthPayload {
	token: string;
	account?: Account;
}
