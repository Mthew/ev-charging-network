"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoogleMaps from "@/components/GoogleMaps";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import { MapPin, Navigation, Plus } from "lucide-react";

export default function TestMapsPage() {
  const [testLocations, setTestLocations] = useState([
    {
      id: "1",
      lat: 6.2442,
      lng: -75.5812,
      title: "Centro de Medellín",
      description: "Centro de la ciudad",
      type: "submission" as const,
    },
    {
      id: "2",
      lat: 6.2077,
      lng: -75.5636,
      title: "El Poblado",
      description: "Zona comercial y residencial",
      type: "desired" as const,
    },
    {
      id: "3",
      lat: 6.2486,
      lng: -75.5907,
      title: "Laureles",
      description: "Barrio Laureles",
      type: "charging" as const,
    },
  ]);

  const [addressInput, setAddressInput] = useState("");
  const [newLocation, setNewLocation] = useState<{
    lat?: number;
    lng?: number;
    address?: string;
  }>({});

  const handlePlaceSelect = (place: {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => {
    setNewLocation({
      lat: place.lat,
      lng: place.lng,
      address: place.address,
    });
    console.log("Place selected:", place);
  };

  const addLocation = () => {
    if (newLocation.lat && newLocation.lng && newLocation.address) {
      setTestLocations([
        ...testLocations,
        {
          id: Date.now().toString(),
          lat: newLocation.lat,
          lng: newLocation.lng,
          title: "Nueva Ubicación",
          description: newLocation.address,
          type: "desired" as const,
        },
      ]);
      setNewLocation({});
      setAddressInput("");
    }
  };

  const clearLocations = () => {
    setTestLocations([]);
  };

  const addRandomLocation = () => {
    // Add random location around Medellín
    const lat = 6.2442 + (Math.random() - 0.5) * 0.1;
    const lng = -75.5812 + (Math.random() - 0.5) * 0.1;

    setTestLocations([
      ...testLocations,
      {
        id: Date.now().toString(),
        lat,
        lng,
        title: `Ubicación ${testLocations.length + 1}`,
        description: "Ubicación aleatoria de prueba",
        type: "submission" as const,
      },
    ]);
  };

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🗺️ Test Google Maps Integration
          </h1>
          <p className="text-gray-300">
            Prueba de la integración de Google Maps API con marcadores y
            autocompletado
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-primary" />
              Controles de Prueba
            </CardTitle>
            <CardDescription className="text-gray-300">
              Agrega ubicaciones para probar el mapa interactivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address Input */}
            <div>
              <label className="text-white text-sm mb-2 block">
                Buscar Dirección (Google Places Autocomplete)
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <GooglePlacesAutocomplete
                    value={addressInput}
                    onChange={setAddressInput}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Busca una dirección en Colombia..."
                    className="custom-input"
                  />
                </div>
                <Button
                  onClick={addLocation}
                  disabled={!newLocation.lat || !newLocation.lng}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
              {newLocation.address && (
                <p className="text-sm text-gray-300 mt-2">
                  📍 {newLocation.address} ({newLocation.lat?.toFixed(4)},{" "}
                  {newLocation.lng?.toFixed(4)})
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={addRandomLocation}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Agregar Ubicación Aleatoria
              </Button>
              <Button
                onClick={clearLocations}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Limpiar Mapa
              </Button>
            </div>

            {/* Location Counter */}
            <div className="text-sm text-gray-300">
              📍 Ubicaciones en el mapa: {testLocations.length}
            </div>
          </CardContent>
        </Card>

        {/* Maps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regular Map */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Mapa Regular</CardTitle>
              <CardDescription className="text-gray-300">
                Marcadores individuales con ventanas de información
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <GoogleMaps
                  locations={testLocations}
                  showHeatmap={false}
                  className="rounded-lg border border-white/20 h-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Heatmap */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Mapa de Calor</CardTitle>
              <CardDescription className="text-gray-300">
                Visualización de densidad con heatmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <GoogleMaps
                  locations={testLocations}
                  showHeatmap={true}
                  className="rounded-lg border border-white/20 h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Status */}
        <Card className="mt-6 bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Estado de la API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-gray-300">
                  API Key:{" "}
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    ? "Configurada"
                    : "No configurada"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-300">
                  Maps JavaScript API: Requerida
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-300">Places API: Requerida</span>
              </div>
            </div>

            {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>⚠️ API Key no configurada:</strong> Los mapas
                  funcionan en modo demo. Para activar la funcionalidad
                  completa, configura tu Google Maps API key en el archivo
                  .env.local
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location List */}
        {testLocations.length > 0 && (
          <Card className="mt-6 bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Ubicaciones Cargadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testLocations.map((location, index) => (
                  <div
                    key={location.id}
                    className="flex justify-between items-center p-2 bg-white/5 rounded"
                  >
                    <div>
                      <span className="text-white font-medium">
                        {location.title}
                      </span>
                      <p className="text-xs text-gray-400">
                        {location.description} • {location.lat.toFixed(4)},{" "}
                        {location.lng.toFixed(4)}
                      </p>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        location.type === "desired"
                          ? "bg-blue-500"
                          : location.type === "charging"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="text-center mt-8 space-x-4">
          <Button
            onClick={() => window.open("/", "_self")}
            className="bg-primary hover:bg-primary/90"
          >
            ← Volver a la Aplicación Principal
          </Button>
          <Button
            onClick={() => window.open("/api-key-setup", "_self")}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            🔑 Configurar API Key
          </Button>
        </div>
      </div>
    </div>
  );
}
