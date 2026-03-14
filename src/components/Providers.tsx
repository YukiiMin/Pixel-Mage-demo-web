"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiError } from "@/lib/api/http";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 30 * 1000,
						gcTime: 5 * 60 * 1000,
						refetchOnWindowFocus: false,
						retry: (failureCount, error) => {
							if (error instanceof ApiError) {
								if ([400, 401, 403, 404].includes(error.status)) {
									return false;
								}
							}

							return failureCount < 2;
						},
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
				<TooltipProvider>
					<Toaster />
					<Sonner />
					{children}
				</TooltipProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
