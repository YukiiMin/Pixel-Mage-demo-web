import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

// Disposable email domains list — inline import workaround for CommonJS module
let disposableDomains: Set<string>;
try {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const raw = require("disposable-email-domains") as string[];
	disposableDomains = new Set(raw);
} catch {
	disposableDomains = new Set();
}

function isDisposableEmail(email: string): boolean {
	const domain = email.split("@")[1]?.toLowerCase();
	if (!domain) return false;
	return disposableDomains.has(domain);
}

export const registerSchema = z.object({
	name: z
		.string()
		.min(2, "Họ và tên phải có ít nhất 2 ký tự")
		.max(100, "Họ và tên quá dài"),

	email: z
		.string()
		.email("Email không hợp lệ")
		.refine((email) => !isDisposableEmail(email), {
			message: "Email tạm thời không được phép. Vui lòng dùng email thật.",
		}),

	phoneNumber: z
		.string()
		.optional()
		.refine(
			(val) => {
				if (!val || val.trim() === "") return true; // optional
				return isValidPhoneNumber(val, "VN");
			},
			{ message: "Số điện thoại không hợp lệ. Vui lòng nhập đúng đầu số Việt Nam." },
		),

	password: z
		.string()
		.min(8, "Mật khẩu phải có ít nhất 8 ký tự")
		.regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
		.regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số"),

	agreeTerms: z.boolean().refine((val) => val === true, {
		message: "Bạn phải đồng ý với điều khoản dịch vụ",
	}),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
