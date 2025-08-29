"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/dashboard"
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                pathname === "/dashboard"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              } transition-colors hover:text-foreground md:h-8 md:w-8`}
            >
              Home
            </Link>
            <Link
              href="/dashboard/submissions"
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                pathname === "/dashboard/submissions"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              } transition-colors hover:text-foreground md:h-8 md:w-8`}
            >
              Submissions
            </Link>
          </nav>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
