import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Dashboard - EV Charging Network",
    default: "Dashboard - EV Charging Network",
  },
  description: "Manage your EV charging network dashboard",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <>{children}</>;
}
