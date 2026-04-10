"use client";

import CustomerSidebar from "@/components/layout/customer-sidebar";
import { default as Footer } from "@/components/layout/footer";
import Header from "@/components/layout/header";
import StarBackground from "@/components/ui/star-background";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <Header />
      <main className="relative z-10 pt-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column - Sidebar */}
            <div className="md:col-span-3">
              <CustomerSidebar />
            </div>

            {/* Right Column - Main Content */}
            <div className="md:col-span-9">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
