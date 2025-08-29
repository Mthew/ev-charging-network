"use client";

import React, { useState } from "react";
import {
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "../ui";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const router = useRouter();

  const { isLoading: authLoading, login } = useAuth();

  // Real JWT authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginForm.identifier || !loginForm.password) {
      setLoginError("Please fill in all fields");
      return;
    }

    const result = await login({
      identifier: loginForm.identifier,
      password: loginForm.password,
    });

    if (!result.success) {
      setLoginError(result.message);
    } else {
      // Authentication successful, analytics will load automatically via useEffect
      // Don't call loadAnalyticsData() here to avoid race condition with cookie setting
      console.log("Login successful, auth state updated");
      router.push("/dashboard");
    }
  };
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold">OG</span>
            </div>
            <span className="text-white font-semibold text-xl">Dashboard</span>
          </div>
          <CardTitle className="text-white">Acceso Administrativo</CardTitle>
          <CardDescription className="text-gray-300">
            Ingresa tus credenciales para acceder al panel de control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Usuario o Email"
                value={loginForm.identifier}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, identifier: e.target.value })
                }
                className="custom-input"
                required
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className="custom-input pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {loginError && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{loginError}</span>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={authLoading}
            >
              {authLoading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
            {/* <div className="text-xs text-gray-400 text-center space-y-1">
              <p>Credenciales demo:</p>
              <p>admin / admin123 (Admin)</p>
              <p>demo / demo123 (Usuario)</p>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
