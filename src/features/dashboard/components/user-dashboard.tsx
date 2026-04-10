"use client";

import { getInitials } from "@/components/layout/header/_config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/features/auth/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  Settings,
  Sparkles,
  Trophy,
  Wallet,
  XCircle
} from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
  const { data: profileData } = useProfile(1);
  const userName = profileData?.name || profileData?.email || "Người dùng";
  const initials = getInitials(userName);

  // Mock data - replace with real API calls
  const stats = [
    {
      title: "Số dư ví",
      value: "2,450,000 VNĐ",
      icon: Wallet,
      href: "/wallet",
      color: "from-green-600 to-emerald-600",
      bgGradient: "from-green-900/20 to-emerald-900/20",
    },
    {
      title: "Thẻ đã thu thập",
      value: "45/120",
      icon: CreditCard,
      href: "/my-cards",
      color: "from-blue-600 to-purple-600",
      bgGradient: "from-blue-900/20 to-purple-900/20",
    },
    {
      title: "Thành tựu đã mở",
      value: "5",
      icon: Trophy,
      href: "/achievements",
      color: "from-yellow-600 to-orange-600",
      bgGradient: "from-yellow-900/20 to-orange-900/20",
    },
  ];

  const quickActions = [
    {
      title: "Bắt đầu phiên Tarot mới",
      description: "Bốc bài xem vận may",
      href: "/tarot",
      icon: Sparkles,
      color: "from-purple-600 to-blue-600",
    },
    {
      title: "Mở Pack mới ngay",
      description: "Mua thẻ ngẫu nhiên",
      href: "/marketplace",
      icon: Package,
      color: "from-blue-600 to-green-600",
    },
    {
      title: "Quản lý Hồ sơ",
      description: "Cập nhật thông tin & mật khẩu",
      href: "/profile",
      icon: Settings,
      color: "from-slate-600 to-gray-600",
    },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header sẽ được thêm ở layout level */}
      <main>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-12 gap-6">

            {/* Row 1: Welcome Banner - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="col-span-12"
            >
              <Card className="bg-gradient-to-r from-purple-900/60 via-blue-900/60 to-purple-900/60 border-purple-500/20 backdrop-blur-sm overflow-hidden h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <Link href="/profile" className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" title="Quay ra trang trn">
                      <div className="w-16 h-16 rounded-full gradient-gold-purple-bg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {initials}
                      </div>
                    </Link>

                    {/* Welcome Text */}
                    <div className="flex-1">
                      <motion.h1
                        className="text-3xl font-bold text-white mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        Chào mừng trở lại, {userName}!
                      </motion.h1>
                      <motion.p
                        className="text-purple-200 text-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        🌟 Hôm nay bạn muốn khám phá điều gì với PixelMage?
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Row 2: Stats Cards - 3 columns */}
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="col-span-12 lg:col-span-4"
              >
                <Link href={stat.href}>
                  <Card className={`bg-gradient-to-br ${stat.bgGradient} border border-white/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group h-full`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white/80 text-sm font-medium">
                          {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-white/60 group-hover:text-white/80 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {/* Row 3: Main Content - 2 columns */}

            {/* Left Column: Quick Actions - 4 columns */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/30 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Lối tắt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        asChild
                        className={`w-full bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-semibold py-4 shadow-lg hover:shadow-lg transition-all duration-300 group`}
                      >
                        <Link href={action.href} className="flex items-center justify-center gap-3 w-full">
                          <action.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-xs opacity-80">{action.description}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 ml-auto" />
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Recent Activity - 8 columns */}
            <div className="col-span-12 lg:col-span-8 space-y-4">

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
                            <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status === "completed" ? "Hoàn thành" : order.status === "processing" ? "Đang xử lý" : "Chờ xử lý"}
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
                            <div className="font-medium text-white">{reading.question}</div>
                            <div className="text-sm text-purple-300">{reading.spread} • {reading.date}</div>
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
          </div>
        </div>
      </main>
    </div>
  );
}
