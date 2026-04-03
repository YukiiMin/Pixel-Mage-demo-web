export interface ApiEnvelope<T> {
	data: T;
	message?: string;
	success?: boolean;
	statusCode?: number;
	timestamp?: string;
	path?: string;
}

export interface PageResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
	first: boolean;
	last: boolean;
	empty: boolean;
	numberOfElements: number;
}

export interface ResponseBase<T> {
	code: number;
	message: string;
	data: T;
}

export interface ApiErrorPayload {
	message?: string;
	code?: string;
	statusCode?: number;
	details?: unknown;
	timestamp?: string;
	path?: string;
}

export interface ApiRequestResult<T> {
	status: number;
	data: T;
	raw: unknown;
}

export class ApiHttpError extends Error {
	status: number;
	data: unknown;

	constructor(status: number, data: unknown, message?: string) {
		super(message ?? `API request failed with status ${status}`);
		this.name = "ApiHttpError";
		this.status = status;
		this.data = data;
	}

	get response() {
		return {
			status: this.status,
			data: this.data,
		};
	}
}

export function isApiHttpError(error: unknown): error is ApiHttpError {
	return (
		error instanceof ApiHttpError ||
		(error !== null &&
			typeof error === "object" &&
			"status" in error &&
			"data" in error)
	);
}

export function getApiErrorMessage(
	error: unknown,
	fallbackMessage = "Có lỗi xảy ra khi gọi API.",
): string {
	if (!isApiHttpError(error)) {
		return fallbackMessage;
	}

	const payload = error.data as ApiErrorPayload | null;
	if (payload?.message && payload.message.trim().length > 0) {
		return payload.message;
	}

	return error.message || fallbackMessage;
}
