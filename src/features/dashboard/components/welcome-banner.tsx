"use client";

import { getInitials } from "@/components/layout/header/_config";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/features/auth/hooks/use-auth";
import { motion } from "framer-motion";

export default function WelcomeBanner() {
  const { data: profileData } = useProfile(1); // Pass userId to always fetch

  const userName = profileData?.name || profileData?.email || "Người dùng";
  const initials = getInitials(userName);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-r from-purple-900/60 via-blue-900/60 to-purple-900/60 border-purple-500/20 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full gradient-gold-purple-bg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {initials}
              </div>
            </div>

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
  );
}
