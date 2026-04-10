"use client";

import { default as Footer } from "@/components/layout/footer";
import Header from "@/components/layout/header";
import UserDashboardComponent from "@/features/dashboard/components/user-dashboard";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <UserDashboardComponent />
    </div>
  );
}
