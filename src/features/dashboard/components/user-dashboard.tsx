"use client";

import { getInitials } from "@/components/layout/header/_config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StarBackground from "@/components/ui/star-background";
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
    <div className="min-h-screen relative overflow-x-hidden">
      <StarBackground />
      <main className="relative z-10">
        <div className="px-2 sm:px-4 py-4">
          <div className="grid lg:grid-cols-12 gap-4">

            {/* Row 1: Welcome Banner - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="col-span-12"
            >
              <Card className="glass-card border-primary/20 overflow-hidden h-full animate-fog-in">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Avatar - Use Cloudinary image if available, else fallback to initials */}
                    <Link href="/profile" className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300" title="Quay ra trang cá nhân">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden glow-gold animate-pulse-gold">
                        {profileData?.avatarUrl ? (
                          <img
                            src={profileData.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full gradient-gold-purple-bg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                            {initials}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Welcome Text với Mystic Typography */}
                    <div className="flex-1 min-w-0">
                      <motion.h1
                        className="text-2xl sm:text-3xl text-mystic-gradient animate-fog-in mb-1 sm:mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        Chào mừng trở lại, {userName}!
                      </motion.h1>
                      <motion.p
                        className="text-ethereal text-base sm:text-lg"
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

            {/* Row 2: Stats Cards - 3 columns với glass-card */}
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="col-span-12 sm:col-span-6 lg:col-span-4"
              >
                <Link href={stat.href}>
                  <Card className="glass-card border-primary/10 hover:border-primary/30 hover:glow-gold transition-all duration-300 hover:scale-105 cursor-pointer group h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white/80 text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                          {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gold-shimmer" style={{ fontFamily: "var(--font-stats)" }}>
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {/* Row 3: Main Content - 2 columns */}

            {/* Left Column: Quick Actions - 4 columns với glass-card */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <Card className="glass-card border-primary/10 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-mystic flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <Sparkles className="h-5 w-5 text-primary" />
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
                        className={`w-full bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-semibold py-4 shadow-lg hover:glow-gold transition-all duration-300 group`}
                      >
                        <Link href={action.href} className="flex items-center justify-center gap-3 w-full">
                          <action.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-xs opacity-80">{action.description}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Recent Activity - 8 columns với glass-card */}
            <div className="col-span-12 lg:col-span-8 space-y-4">

              {/* Recent Orders */}
              <Card className="glass-card border-primary/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-mystic flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <Package className="h-5 w-5 text-primary" />
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
                        className="flex items-center justify-between p-3 rounded-lg glass-card border-primary/5 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{order.packName}</div>
                          <div className="text-sm text-slate-400">{order.date}</div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
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

              {/* Recent Tarot Readings với glass-card và glow-purple */}
              <Card className="glass-card border-secondary/20 glow-purple">
                <CardHeader className="pb-4">
                  <CardTitle className="text-mystic flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <Clock className="h-5 w-5 text-secondary" />
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
                        className="p-3 rounded-lg glass-card border-secondary/10 hover:border-secondary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{reading.question}</div>
                            <div className="text-sm text-secondary/80">{reading.spread} • {reading.date}</div>
                            <div className="text-xs text-secondary/60 mt-1">
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
