"use client";

import React from "react";
import { Bell, Check, BellRing } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { useNotifications } from "../hooks/use-notifications";
import { getStoredUserId } from "@/lib/api-config";

interface Props {
	userRole?: string;
}

export function NotificationBell({ userRole }: Props) {
	const userId = getStoredUserId();
	const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userRole, userId);

	if (!userRole) return null;

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button
					type="button"
					className="relative rounded-full p-2 text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
				>
					{unreadCount > 0 ? (
						<BellRing className="h-5 w-5 text-amber-400 animate-pulse" />
					) : (
						<Bell className="h-5 w-5" />
					)}
					{unreadCount > 0 && (
						<span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</button>
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Content
					className="z-100 mt-2 w-80 rounded-xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-md glass-card"
					sideOffset={5}
					align="end"
				>
					<div className="mb-3 flex items-center justify-between">
						<h3 className="font-semibold text-foreground">Thông báo</h3>
						{unreadCount > 0 && (
							<button
								type="button"
								onClick={markAllAsRead}
								className="text-xs text-primary hover:underline flex items-center gap-1"
							>
								<Check className="h-3 w-3" /> Đánh dấu đã đọc
							</button>
						)}
					</div>
					
					{notifications.length === 0 ? (
						<div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
							<Bell className="h-8 w-8 mb-2 opacity-20" />
							Không có thông báo nào
						</div>
					) : (
						<div className="flex max-h-75 flex-col gap-2 overflow-y-auto pr-1">
							{notifications.map((notif) => (
								<div
									key={notif.id}
									onClick={() => !notif.read && markAsRead(notif.id)}
									className={`cursor-pointer rounded-lg border p-3 transition-colors ${
										notif.read
											? "border-border/20 bg-background/50 opacity-60"
											: "border-primary/30 bg-primary/5"
									}`}
								>
									<div className="flex justify-between items-start mb-1">
										<p className="text-sm font-medium text-foreground">{notif.title}</p>
										{!notif.read && (
											<span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
										)}
									</div>
									<p className="text-xs text-muted-foreground">{notif.message}</p>
									<p className="mt-2 text-[10px] text-muted-foreground/60 font-stats">
										{new Date(notif.timestamp).toLocaleString("vi-VN")}
									</p>
								</div>
							))}
						</div>
					)}
					<Popover.Arrow className="fill-background/95 border-t border-l border-border/50" />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
