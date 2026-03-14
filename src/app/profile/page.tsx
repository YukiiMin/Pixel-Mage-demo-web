"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RequestState } from "@/components/ui/request-state";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function ProfilePage() {
	const authSession = useAuthSession();

	if (!authSession.isAuthenticated) {
		return (
			<div className="min-h-screen bg-background px-4 py-20">
				<div className="mx-auto max-w-xl">
					<RequestState
						variant="error"
						title="Sign in required"
						description="Please sign in to access your profile and account settings."
						actionLabel="Go to login"
						onAction={() => {
							window.location.href = "/login?redirect=/profile";
						}}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background px-4 py-20">
			<div className="mx-auto max-w-2xl space-y-6">
				<Card className="border-border/60 bg-card/80 backdrop-blur">
					<CardHeader>
						<CardTitle className="text-2xl">Your profile</CardTitle>
						<CardDescription>
							Session-aware profile summary powered by the current auth state.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								Name
							</p>
							<p className="mt-1 text-sm font-medium text-foreground">
								{authSession.account?.name || "No profile name returned yet"}
							</p>
						</div>
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								Email
							</p>
							<p className="mt-1 text-sm font-medium text-foreground">
								{authSession.account?.email || "Stored session only"}
							</p>
						</div>
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								Provider
							</p>
							<p className="mt-1 text-sm font-medium text-foreground">
								{authSession.account?.provider || "LOCAL"}
							</p>
						</div>
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								Role ID
							</p>
							<p className="mt-1 text-sm font-medium text-foreground">
								{authSession.account?.roleId ?? "Unknown"}
							</p>
						</div>
					</CardContent>
				</Card>

				<div className="flex gap-3">
					<Button asChild>
						<Link href="/">Back to home</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/admin/accounts">Open admin accounts</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
