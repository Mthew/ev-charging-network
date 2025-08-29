"use client";

import { MobileNav } from "./MobileNav";

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  return (
    <header
      className={`flex h-14 items-center justify-between border-b bg-background px-4 md:hidden ${className}`}
    >
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="text-sm font-bold">OG</span>
        </div>
        <span className="font-semibold">Dashboard</span>
      </div>
      <MobileNav />
    </header>
  );
}
