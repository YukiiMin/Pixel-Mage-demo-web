import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* Proxy tất cả /api/* và /oauth2/* sang Spring Boot monolith */
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:8080/api/:path*",
			},
			{
				source: "/oauth2/:path*",
				destination: "http://localhost:8080/oauth2/:path*",
			},
		];
	},
};

export default nextConfig;
