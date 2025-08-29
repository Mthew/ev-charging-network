"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { Breadcrumb } from "@/components/Breadcrumb";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-muted/40">
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content */}
        <div className="w-full flex flex-1 flex-col md:ml-16">
          {/* Mobile Header */}
          <MobileHeader />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-full">
              <Breadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
