import type { Metadata } from "next";
import Providers from "@/components/providers1";
import "./globals.css";

export const metadata: Metadata = {
	title: "PixelMage — AI Tarot Platform",
	description:
		"Đọc bài AI · Sưu tập thẻ NFC · Kết nối vũ trụ. Nền tảng Tarot AI hàng đầu Việt Nam.",
	authors: [{ name: "PixelMage Team" }],
	keywords: ["tarot", "AI", "NFC", "card collection", "mystical", "pixelmage"],
	openGraph: {
		title: "PixelMage — AI Tarot Platform",
		description: "Đọc bài AI · Sưu tập thẻ NFC · Kết nối vũ trụ.",
		type: "website",
		siteName: "PixelMage",
	},
	twitter: {
		card: "summary_large_image",
		title: "PixelMage — AI Tarot Platform",
		description: "Đọc bài AI · Sưu tập thẻ NFC · Kết nối vũ trụ.",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="vi" suppressHydrationWarning>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
