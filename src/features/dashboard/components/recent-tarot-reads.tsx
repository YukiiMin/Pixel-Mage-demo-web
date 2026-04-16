"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Package, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function RecentTarotReads() {
	// Mock data - replace with real API calls
	const recentOrders = [
		{
			id: "ORD-001",
			packName: "Mystic Starter Pack",
			status: "completed",
			date: "2024-01-15",
			price: "450,000 VNĐ",
		},
		{
			id: "ORD-002",
			packName: "Crystal Elite Pack",
			status: "processing",
			date: "2024-01-14",
			price: "1,200,000 VNĐ",
		},
		{
			id: "ORD-003",
			packName: "Shadow Master Pack",
			status: "pending",
			date: "2024-01-13",
			price: "800,000 VNĐ",
		},
	];

	const recentReadings = [
		{
			id: "READ-001",
			spread: "3 Lá Cơ Bản",
			question: "Tình hình công việc tháng này?",
			date: "2024-01-15",
			cards: ["The Fool", "The Magician", "The High Priestess"],
		},
		{
			id: "READ-002",
			spread: "Celtic Cross",
			question: "Mối quan hệ hiện tại ra sao?",
			date: "2024-01-14",
			cards: ["The Lovers", "The Chariot", "The Star"],
		},
	];

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-400" />;
			case "processing":
				return <Clock className="h-4 w-4 text-yellow-400" />;
			default:
				return <XCircle className="h-4 w-4 text-red-400" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "text-green-400 bg-green-900/20";
			case "processing":
				return "text-yellow-400 bg-yellow-900/20";
			default:
				return "text-red-400 bg-red-900/20";
		}
	};

	return (
		<div className="space-y-4">
			{/* Recent Orders */}
			<Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/30 backdrop-blur-sm">
				<CardHeader>
					<CardTitle className="text-slate-200 flex items-center gap-2">
						<Package className="h-5 w-5" />
						Đơn hàng gần nhất
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{recentOrders.map((order, index) => (
							<motion.div
								key={order.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/20 hover:bg-slate-800/60 transition-colors"
							>
								<div className="flex-1">
									<div className="font-medium text-white">{order.packName}</div>
									<div className="text-sm text-slate-400">{order.date}</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="text-right">
										<div className="font-medium text-white">{order.price}</div>
										<div
											className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${getStatusColor(order.status)}`}
										>
											{getStatusIcon(order.status)}
											{order.status === "completed"
												? "Hoàn thành"
												: order.status === "processing"
													? "Đang xử lý"
													: "Chờ xử lý"}
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Recent Tarot Readings */}
			<Card className="bg-gradient-to-br from-purple-800/60 to-slate-900/60 border-purple-700/30 backdrop-blur-sm">
				<CardHeader>
					<CardTitle className="text-purple-200 flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Lịch sử Tarot
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{recentReadings.map((reading, index) => (
							<motion.div
								key={reading.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								className="p-3 rounded-lg bg-purple-800/40 border border-purple-700/20 hover:bg-purple-800/60 transition-colors"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="font-medium text-white">
											{reading.question}
										</div>
										<div className="text-sm text-purple-300">
											{reading.spread} • {reading.date}
										</div>
										<div className="text-xs text-purple-400 mt-1">
											Lá bài: {reading.cards.join(", ")}
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
