export const queryKeys = {
	accounts: {
		all: ["accounts"] as const,
		detail: (id: number) => ["accounts", "detail", id] as const,
	},
	roles: {
		all: ["roles"] as const,
	},
};
