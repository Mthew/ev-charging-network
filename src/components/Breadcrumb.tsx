"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const pathNameMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/submissions": "Submissions",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1) return null;

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const name =
      pathNameMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return {
      name,
      path,
      isLast,
    };
  });

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4 md:mb-6">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.length > 1 && (
        <>
          <ChevronRight className="h-4 w-4" />
          {breadcrumbItems.slice(1).map((item, index) => (
            <div key={item.path} className="flex items-center space-x-1">
              {item.isLast ? (
                <span className="font-medium text-foreground">{item.name}</span>
              ) : (
                <>
                  <Link
                    href={item.path}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                  {index < breadcrumbItems.slice(1).length - 1 && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </div>
          ))}
        </>
      )}
    </nav>
  );
}
