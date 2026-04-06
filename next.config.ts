import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
		],
		localPatterns: [
			{
				pathname: "/api/placeholder/**",
			},
		],
	},
	/* Proxy tất cả /api/* và /oauth2/* sang Spring Boot monolith */
	async rewrites() {
		return [
			{
				source: "/oauth2/:path*",
				destination: `${(process.env.BACKEND_URL_NGROK || process.env.BACKEND_URL || "http://localhost:8080").replace(/\/$/, "")}/oauth2/:path*`,
			},
		];
	},
};

export default nextConfig;
