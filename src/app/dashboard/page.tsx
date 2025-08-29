"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { MapPin, TrendingUp, Users, Car, LogOut } from "lucide-react";
import GoogleMaps, { Location } from "@/components/GoogleMaps";
import { useAuth } from "@/hooks/useAuth";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { COLORS } from "@/config/constants";

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
  recentSubmissions?: Array<{
    id: number;
    full_name: string;
    vehicle_type: string;
    brand_model: string;
    created_at: string;
  }>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
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

  const [isLoading, setIsLoading] = useState(false);

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
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const applyFilters = async (filters: {
    locationType?: string;
    vehicleType?: string;
    usageType?: string;
  }) => {
    setIsLoading(true);
    try {
      // Convert "all" values to empty strings for the API
      const filtersForAPI = Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [
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
        const { submissions, locations, ...rest } = result.data;
        setAnalyticsData(rest);
        setSubmissionsData({
          submissions,
          locations,
        });
        setMapVisualizationType("all");
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

  const getMapLocations = (
    data: {
      submissions: Array<{
        id: number;
        vehicle_type: string;
        brand_model: string;
        usage_type: string;
        primary_charging_location: string;
        created_at: string;
        charging_latitude?: number;
        charging_longitude?: number;
        charging_address?: string;
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
    } | null,
    filter: "desired" | "submitted" | "all" = "all"
  ): Location[] => {
    const locations: Location[] = [];

    if (data) {
      if (data.submissions && ["all", "submitted"].includes(filter)) {
        locations.push(
          ...data.submissions
            .filter((loc) => loc.charging_latitude && loc.charging_longitude)
            .map((loc) => ({
              id: loc.id.toString(),
              lat: Number(loc.charging_latitude),
              lng: Number(loc.charging_longitude),
              title: loc.primary_charging_location,
              description: loc.charging_address || "",
              type: "charging" as const,
            }))
        );
      }

      if (data.locations && ["all", "desired"].includes(filter)) {
        locations.push(
          ...data.locations
            .filter((loc) => loc.latitude && loc.longitude)
            .map((loc) => ({
              id: loc.id.toString(),
              lat: Number(loc.latitude),
              lng: Number(loc.longitude),
              title: loc.identifier,
              description: loc.address,
              type: "submission" as const,
            }))
        );
      }
    }

    return locations;
  };

  const [mapVisualizationType, setMapVisualizationType] = useState<
    "desired" | "submitted" | "all"
  >("all");
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);

  useEffect(() => {
    const applyLocationFilters = () => {
      if (submissionsData?.locations && submissionsData?.locations) {
        const filtered = getMapLocations(submissionsData || null);
        // Apply additional filtering logic here
        setFilteredLocations(() => filtered);
      }
    };

    applyLocationFilters();
  }, [submissionsData]);

  const handlers = {
    changeMapVisualization: (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedFilter = e.target.value as "desired" | "submitted" | "all";
      if (selectedFilter) {
        setMapVisualizationType(selectedFilter);
        setFilteredLocations(() =>
          getMapLocations(submissionsData || null, selectedFilter)
        );
      }
    },
  };

  //#endregion

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-white/10">
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0 mx-auto max-w-7xl">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">OG</span>
            </div>
            <span className="text-white font-semibold text-lg md:text-xl">
              Dashboard
            </span>
          </div>
          <div className="flex items-center justify-between md:justify-end space-x-4">
            <div className="text-left md:text-right">
              <p className="text-white text-sm md:text-base font-medium">
                {user?.username}
              </p>
              <p className="text-gray-300 text-xs md:text-sm capitalize">
                {user?.role === "admin" ? "Administrador" : "Usuario"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white hover:text-primary flex items-center space-x-2 px-3 py-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 mx-auto max-w-7xl">
        <DashboardFilters applyFilters={applyFilters} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Left Sidebar - Charts and Data */}
          <div className="xl:col-span-1 space-y-4 md:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3 md:gap-4">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs md:text-sm">
                        Total Usuarios
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-white">
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
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs md:text-sm">
                        Ubicaciones Deseadas
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-white">
                        {analyticsData?.totalLocations || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        Puntos de carga solicitados
                      </p>
                    </div>
                    <MapPin className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Database Status Indicator */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm md:text-base font-medium">
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
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-white flex items-center text-base md:text-lg">
                  <Car className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
                  Tipo de vehiculo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analyticsData?.vehicleTypes && (
                  <ResponsiveContainer
                    width="100%"
                    height={180}
                    className="md:h-[200px]"
                  >
                    <PieChart>
                      <Pie
                        data={[
                          ...analyticsData.vehicleTypes.map((item) => ({
                            vehicle_type: item.vehicle_type,
                            count: Number(item.count),
                          })),
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="vehicle_type"
                        label={({ vehicle_type, count }) =>
                          `${vehicle_type}: ${count}`
                        }
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
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-white text-base md:text-lg">
                  Recorrido
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analyticsData?.kmRanges && (
                  <ResponsiveContainer
                    width="100%"
                    height={120}
                    className="md:h-[150px]"
                  >
                    <BarChart data={analyticsData.kmRanges}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="average_kms_per_day"
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      />
                      <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center - Heatmap */}
          <div className="xl:col-span-2 xl:row-span-2 order-first xl:order-none">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-full">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-white">
                  <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <div className="text-base md:text-lg">
                      Mapa de Calor - Medellín
                    </div>
                    <div>
                      <div className="relative inline-block text-left w-full md:w-auto">
                        <select
                          className="w-full md:w-auto bg-black/20 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                          onChange={handlers.changeMapVisualization}
                          value={mapVisualizationType}
                        >
                          <option className="bg-[#1e293b]" value="all">
                            Todas las ubicaciones
                          </option>
                          <option className="bg-[#1e293b]" value="submitted">
                            Datos enviados
                          </option>
                          <option className="bg-[#1e293b]" value="desired">
                            Ubicaciones deseadas
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Concentración de solicitudes y puntos de carga
                  {/* Legend */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
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
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] md:h-[400px] xl:h-[calc(100%-120px)] p-3 md:p-6">
                <GoogleMaps
                  locations={filteredLocations || []}
                  showHeatmap={true}
                  className="rounded-lg border border-white/20 h-full w-full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - More Analytics */}
          <div className="xl:col-span-1 space-y-4 md:space-y-6">
            {/* Totals by Location */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-white text-base md:text-lg">
                  Lugares de carga
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 md:space-y-3">
                  {analyticsData?.chargingLocations.map((location, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 hover:bg-white/5 rounded"
                    >
                      <span className="text-gray-300 capitalize text-sm md:text-base truncate pr-2">
                        {location.primary_charging_location}
                      </span>
                      <span className="text-white font-semibold text-sm md:text-base flex-shrink-0">
                        {location.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Preferences */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-white text-base md:text-lg">
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analyticsData?.desiredLocationCounts && (
                  <ResponsiveContainer
                    width="100%"
                    height={180}
                    className="md:h-[200px]"
                  >
                    <PieChart>
                      <Pie
                        data={analyticsData.desiredLocationCounts.map(
                          (item) => ({
                            identifier: item.identifier,
                            count: Number(item.count),
                          })
                        )}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="identifier"
                        label={({ identifier, count }) =>
                          `${identifier}: ${count}`
                        }
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
          </div>
        </div>

        {/* Bottom Section - Additional Analytics */}
        <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Monthly Trend */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-white flex items-center text-base md:text-lg">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
                Tendencia Mensual
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {analyticsData?.monthlyData && (
                <ResponsiveContainer
                  width="100%"
                  height={180}
                  className="md:h-[200px]"
                >
                  <LineChart data={analyticsData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
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

          {/* Recent Submissions */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-white text-base md:text-lg">
                Últimas Solicitudes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 md:space-y-4">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }, (_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-white/10 rounded animate-pulse w-3/4"></div>
                        <div className="h-2 bg-white/10 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="h-2 bg-white/10 rounded animate-pulse w-16"></div>
                    </div>
                  ))
                ) : analyticsData?.recentSubmissions?.length ? (
                  analyticsData.recentSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Car className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {submission.full_name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {submission.vehicle_type} - {submission.brand_model}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gray-400 text-xs">
                          {new Date(submission.created_at).toLocaleDateString(
                            "es-ES",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      No hay solicitudes recientes
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
