"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, Trophy } from "lucide-react";
import Link from "next/link";

export default function QuickStatsCards() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Link href={stat.href}>
            <Card className={`bg-gradient-to-br ${stat.bgGradient} border border-white/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group`}>
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
    </div>
  );
}
