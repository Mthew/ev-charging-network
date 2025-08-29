"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useIsDesktop } from "@/hooks/useMediaQuery";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Submissions",
    href: "/dashboard/submissions",
    icon: FileText,
  },
];

interface DesktopSidebarProps {
  className?: string;
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  // Auto-collapse on smaller desktop screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (!isDesktop) return null;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 ${
        isCollapsed ? "w-16" : "w-64"
      } flex-col border-r bg-background transition-all duration-300 ease-in-out ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div
          className={`flex items-center space-x-2 transition-all duration-300 ${
            isCollapsed ? "justify-center w-full" : ""
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground flex-shrink-0">
            <span className="text-sm font-bold">OG</span>
          </div>
          <span
            className={`font-semibold whitespace-nowrap transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 w-0 overflow-hidden"
                : "opacity-100 w-auto"
            }`}
          >
            Dashboard
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`h-6 w-6 flex-shrink-0 transition-all duration-300 ${
            isCollapsed ? "ml-0" : "ml-2"
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              } ${isCollapsed ? "justify-center" : "space-x-3"}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isCollapsed
                    ? "opacity-0 w-0 overflow-hidden"
                    : "opacity-100 w-auto"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div
          className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-300 ${
            isCollapsed ? "justify-center" : "space-x-3"
          }`}
        >
          <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div
            className={`flex-1 min-w-0 transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 w-0 overflow-hidden"
                : "opacity-100 w-auto"
            }`}
          >
            <p className="font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {user?.role}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "sm"}
          className={`mt-2 text-muted-foreground hover:text-foreground transition-all duration-300 ${
            isCollapsed ? "w-full p-2" : "w-full justify-start"
          }`}
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span
            className={`transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 w-0 overflow-hidden ml-0"
                : "opacity-100 w-auto ml-2"
            }`}
          >
            Logout
          </span>
        </Button>
      </div>
    </aside>
  );
}
