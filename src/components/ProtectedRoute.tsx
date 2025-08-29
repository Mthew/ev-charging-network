"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen gradient-bg flex items-center justify-center">
          <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Verificando autenticación...</p>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Admin required but user is not admin
  if (requireAdmin && user && user.role !== "admin") {
    return (
      fallback || (
        <div className="min-h-screen gradient-bg flex items-center justify-center">
          <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <h2 className="text-white text-xl font-semibold mb-4">
                Permisos Insuficientes
              </h2>
              <p className="text-gray-300">
                Necesitas permisos de administrador para acceder a esta página.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
}
