"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  MapPin,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Car,
  Zap,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import GoogleMaps from "@/components/GoogleMaps";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  vehicleTypes: Array<{ vehicle_type: string; count: number }>;
  usageTypes: Array<{ usage_type: string; count: number }>;
  chargingLocations: Array<{
    primary_charging_location: string;
    count: number;
  }>;
  kmRanges: Array<{ average_kms_per_day: string; count: number }>;
  desiredLocationCounts: Array<{ identifier: string; count: number }>;
  monthlyData: Array<{ month: string; count: number }>;
  totalSubmissions: number;
  totalLocations: number;
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

// Generate demo locations for Medellín heatmap
const generateDemoLocations = () => {
  const medellinCenter = { lat: 6.2442, lng: -75.5812 };
  const locations: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    type: "submission";
  }> = [];

  // Generate sample locations around Medellín
  const areas = [
    { name: "Poblado", lat: 6.2077, lng: -75.5636, count: 15 },
    { name: "Laureles", lat: 6.2486, lng: -75.5907, count: 12 },
    { name: "Centro", lat: 6.2476, lng: -75.5658, count: 20 },
    { name: "Envigado", lat: 6.1711, lng: -75.5919, count: 8 },
    { name: "Sabaneta", lat: 6.1513, lng: -75.6163, count: 6 },
    { name: "Itagüí", lat: 6.1655, lng: -75.6344, count: 10 },
    { name: "Bello", lat: 6.3369, lng: -75.5539, count: 14 },
    { name: "Medellín Norte", lat: 6.294, lng: -75.54, count: 9 },
  ];

  areas.forEach((area, areaIndex) => {
    for (let i = 0; i < area.count; i++) {
      // Add some random variation around each area center
      const lat = area.lat + (Math.random() - 0.5) * 0.02;
      const lng = area.lng + (Math.random() - 0.5) * 0.02;

      locations.push({
        id: `demo-${areaIndex}-${i}`,
        lat,
        lng,
        title: `${area.name} - Punto ${i + 1}`,
        description: `Solicitud de estación de carga en ${area.name}`,
        type: "submission" as const,
      });
    }
  });

  return locations;
};

export default function Dashboard() {
  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
    login,
    logout,
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [submissionsData, setSubmissionsData] = useState<{
    submissions: Array<{
      id: number;
      vehicle_type: string;
      brand_model: string;
      usage_type: string;
      primary_charging_location: string;
      created_at: string;
      [key: string]: unknown;
    }>;
    locations: Array<{
      id: number;
      submission_id: number;
      identifier: string;
      address: string;
      latitude?: number;
      longitude?: number;
      created_at: string;
    }>;
  } | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    locationType: "all",
    vehicleType: "all",
    usageType: "all",
  });
  const [isLoading, setIsLoading] = useState(false);

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
    }
  };

  const loadAnalyticsData = useCallback(
    async (retryCount = 0) => {
      console.log(`Loading analytics data (attempt ${retryCount + 1})...`);
      setIsLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem("auth-token");
        const headers: HeadersInit = {
          "Cache-Control": "no-cache",
        };

        // Add Authorization header if token exists
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
          console.log("Adding Authorization header with token");
        }

        // Load analytics data
        const analyticsResponse = await fetch("/api/analytics", {
          credentials: "include", // Include cookies for authentication
          headers,
        });

        console.log("Analytics response status:", analyticsResponse.status);

        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success) {
          console.log("Analytics data loaded successfully");
          setAnalyticsData(analyticsResult.data);
        } else if (analyticsResponse.status === 401) {
          // If this is within retry limit, wait longer and try again
          if (retryCount < 3) {
            const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s delays
            console.log(
              `Analytics 401, retrying in ${delay}ms... (attempt ${
                retryCount + 1
              }/3)`
            );
            setTimeout(() => {
              loadAnalyticsData(retryCount + 1);
            }, delay);
            return;
          } else {
            // Token actually expired or invalid after multiple retries, logout user
            console.log("Authentication failed after all retries, logging out");
            logout();
            return;
          }
        }

        // Load submissions data for map
        const submissionsResponse = await fetch(
          "/api/analytics?type=submissions",
          {
            credentials: "include", // Include cookies for authentication
            headers,
          }
        );

        console.log("Submissions response status:", submissionsResponse.status);

        const submissionsResult = await submissionsResponse.json();
        if (submissionsResult.success) {
          console.log("Submissions data loaded successfully");
          setSubmissionsData(submissionsResult.data);
        }
      } catch (error) {
        console.error("Error loading analytics:", error);

        // If there's a network error and we haven't retried much, try again
        if (retryCount < 2) {
          console.log(
            `Network error, retrying in 2 seconds... (attempt ${
              retryCount + 1
            }/2)`
          );
          setTimeout(() => {
            loadAnalyticsData(retryCount + 1);
          }, 2000);
          return;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [logout]
  );

  // Load analytics data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Longer delay to ensure cookie is properly set after login
      console.log("User authenticated, loading analytics in 1.5 seconds...");
      const timeoutId = setTimeout(() => {
        console.log("Loading analytics data now...");
        loadAnalyticsData();
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user, loadAnalyticsData]);

  const applyFilters = async () => {
    setIsLoading(true);
    try {
      // Convert "all" values to empty strings for the API
      const filtersForAPI = Object.fromEntries(
        Object.entries(activeFilters).map(([key, value]) => [
          key,
          value === "all" ? "" : value,
        ])
      );

      // Get token from localStorage
      const token = localStorage.getItem("auth-token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/analytics", {
        method: "POST",
        headers,
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ filters: filtersForAPI }),
      });
      const result = await response.json();
      if (result.success) {
        setAnalyticsData(result.data);
      } else if (response.status === 401) {
        // Token expired or invalid, logout user
        logout();
        return;
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Verificando autenticación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  //#region Authentication Login Form

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold">OG</span>
              </div>
              <span className="text-white font-semibold text-xl">
                Dashboard
              </span>
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
              <div className="text-xs text-gray-400 text-center space-y-1">
                <p>Credenciales demo:</p>
                <p>admin / admin123 (Admin)</p>
                <p>demo / demo123 (Usuario)</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  //#endregion

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="p-4 border-b border-white/10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">OG</span>
            </div>
            <span className="text-white font-semibold">Dashboard - Fase2</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-gray-300 text-xs capitalize">
                {user?.role === "admin" ? "Administrador" : "Usuario"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white hover:text-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* #region Filters Section */}

        <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              Filtros de Ubicación
            </CardTitle>
            <CardDescription className="text-gray-300">
              Filtra los datos por Casa, Trabajo, Tercer Lugar, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Tipo de Ubicación
                </label>
                <Select
                  value={activeFilters.locationType}
                  onValueChange={(value) =>
                    setActiveFilters({ ...activeFilters, locationType: value })
                  }
                >
                  <SelectTrigger className="custom-input">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="home">Casa</SelectItem>
                    <SelectItem value="work">Trabajo</SelectItem>
                    <SelectItem value="university">Universidad</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Tipo de Vehículo
                </label>
                <Select
                  value={activeFilters.vehicleType}
                  onValueChange={(value) =>
                    setActiveFilters({ ...activeFilters, vehicleType: value })
                  }
                >
                  <SelectTrigger className="custom-input">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="car">Automóvil</SelectItem>
                    <SelectItem value="motorcycle">Motocicleta</SelectItem>
                    <SelectItem value="bicycle">Bicicleta</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Tipo de Uso
                </label>
                <Select
                  value={activeFilters.usageType}
                  onValueChange={(value) =>
                    setActiveFilters({ ...activeFilters, usageType: value })
                  }
                >
                  <SelectTrigger className="custom-input">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Trabajo</SelectItem>
                    <SelectItem value="delivery">Domicilios</SelectItem>
                    <SelectItem value="taxi">Taxi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={applyFilters}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <Filter className="w-4 h-4 mr-2" />
              Aplicar Filtros
            </Button>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Charts and Data */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Total Usuarios</p>
                      <p className="text-2xl font-bold text-white">
                        {analyticsData?.totalSubmissions || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        Registros en BD:{" "}
                        {analyticsData?.vehicleTypes.reduce(
                          (acc, item) => acc + item.count,
                          0
                        ) || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">
                        Ubicaciones Deseadas
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {analyticsData?.totalLocations || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        Puntos de carga solicitados
                      </p>
                    </div>
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Database Status Indicator */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">
                      Base de Datos Conectada
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    MySQL • Tiempo real
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Type Chart */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Car className="w-5 h-5 mr-2 text-primary" />
                  Tipo EV
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.vehicleTypes && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analyticsData.vehicleTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="vehicle_type"
                      >
                        {analyticsData.vehicleTypes.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recorrido</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.kmRanges && (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={analyticsData.kmRanges}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="average_kms_per_day"
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      />
                      <YAxis tick={{ fill: "#9CA3AF" }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center - Heatmap */}
          <div className="lg:col-span-1">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white">
                  Mapa de Calor - Medellín
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Concentración de solicitudes y puntos de carga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleMaps
                  locations={generateDemoLocations()}
                  height="400px"
                  showHeatmap={true}
                  className="rounded-lg border border-white/20"
                />

                {/* Legend */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Baja</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-300">Media</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">Alta</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - More Analytics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Totals by Location */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.chargingLocations.map((location, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-300 capitalize">
                        {location.primary_charging_location}
                      </span>
                      <span className="text-white font-semibold">
                        {location.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Preferences */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Location</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.desiredLocationCounts && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analyticsData.desiredLocationCounts}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="identifier"
                      >
                        {analyticsData.desiredLocationCounts.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Género placeholder */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Género</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-400">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Datos demográficos</p>
                  <p className="text-xs">Se recopilará en futuras versiones</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Additional Analytics */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Tendencia Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.monthlyData && (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analyticsData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: "#9CA3AF" }} />
                    <YAxis tick={{ fill: "#9CA3AF" }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Additional Insights */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Insights Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-300">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-sm">
                    Ubicaciones cargadas por el mismo usuario y con
                    identificadores que permiten generar mapas de calor de
                    intención.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-sm">
                    Coloración se determina por los records sub totales
                    aplicados a los filtros.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-sm">
                    Hacer lista de marcas con modelos y tamaños tentativos de
                    batería.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
