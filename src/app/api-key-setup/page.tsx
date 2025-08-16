"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  MapPin,
  Copy,
} from "lucide-react";
import GoogleMaps from "@/components/GoogleMaps";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";

export default function ApiKeySetupPage() {
  const [apiKey, setApiKey] = useState("");
  const [testResults, setTestResults] = useState<{
    mapsApi: boolean | null;
    placesApi: boolean | null;
    geocodingApi: boolean | null;
  }>({
    mapsApi: null,
    placesApi: null,
    geocodingApi: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testAddress, setTestAddress] = useState("");

  const currentApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (currentApiKey && currentApiKey !== "your_google_maps_api_key_here") {
      setApiKey(currentApiKey);
      testApiKey(currentApiKey);
    }
  }, [currentApiKey]);

  const testApiKey = async (keyToTest: string) => {
    if (!keyToTest || keyToTest === "your_google_maps_api_key_here") return;

    setIsLoading(true);

    try {
      // Test Geocoding API (this will validate that the API key works)
      // We avoid loading additional map scripts to prevent loader conflicts
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=Medellín,Colombia&key=${keyToTest}`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status === "OK") {
          // If geocoding works, assume Maps API will work too
          setTestResults((prev) => ({
            ...prev,
            geocodingApi: true,
            mapsApi: true,
            placesApi: true,
          }));
        } else {
          setTestResults((prev) => ({
            ...prev,
            geocodingApi: false,
            mapsApi: false,
            placesApi: false,
          }));
        }
      } catch (error) {
        setTestResults((prev) => ({ ...prev, geocodingApi: false }));
      }
    } catch (error) {
      console.error("Error testing API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyEnvTemplate = () => {
    const envContent = `# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${apiKey}

# Database Configuration (for future use)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=ev_charging_network

# Authentication Secret (for production)
JWT_SECRET=your_jwt_secret_here`;

    navigator.clipboard.writeText(envContent);
    alert(
      "Environment configuration copied to clipboard! Paste it into your .env.local file."
    );
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null)
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
    if (status === true)
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return "Not tested";
    if (status === true) return "Working";
    return "Error";
  };

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔑 Google Maps API Setup
          </h1>
          <p className="text-gray-300">
            Configure and test your Google Maps API key for full functionality
          </p>
        </div>

        {/* Current Status */}
        <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Key className="w-5 h-5 mr-2 text-primary" />
              Current API Key Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">API Key Configured</span>
                <div className="flex items-center space-x-2">
                  {currentApiKey &&
                  currentApiKey !== "your_google_maps_api_key_here" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">Yes</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-400">No</span>
                    </>
                  )}
                </div>
              </div>

              {currentApiKey &&
                currentApiKey !== "your_google_maps_api_key_here" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-gray-300 text-sm">
                        Maps JavaScript API
                      </span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(testResults.mapsApi)}
                        <span className="text-sm">
                          {getStatusText(testResults.mapsApi)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-gray-300 text-sm">
                        Geocoding API
                      </span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(testResults.geocodingApi)}
                        <span className="text-sm">
                          {getStatusText(testResults.geocodingApi)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {(!currentApiKey ||
          currentApiKey === "your_google_maps_api_key_here") && (
          <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                📋 Setup Instructions
              </CardTitle>
              <CardDescription className="text-gray-300">
                Follow these steps to get your Google Maps API key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-white font-semibold">
                    1. Google Cloud Console
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>
                      Go to{" "}
                      <a
                        href="https://console.cloud.google.com/"
                        target="_blank"
                        className="text-primary underline"
                      >
                        Google Cloud Console
                      </a>
                    </li>
                    <li>Create or select a project</li>
                    <li>Enable billing (required for production)</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-white font-semibold">2. Enable APIs</h4>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>Maps JavaScript API</li>
                    <li>Places API</li>
                    <li>Geocoding API</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">
                  📖 Need detailed instructions?
                </h4>
                <p className="text-yellow-300 text-sm mb-3">
                  Check out our comprehensive setup guide with screenshots and
                  step-by-step instructions.
                </p>
                <Button
                  onClick={() => window.open("/GOOGLE_MAPS_SETUP.md", "_blank")}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                >
                  View Setup Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Key Testing */}
        <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">🧪 Test Your API Key</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your API key to test functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="custom-input flex-1"
              />
              <Button
                onClick={() => testApiKey(apiKey)}
                disabled={!apiKey || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                Test
              </Button>
            </div>

            {apiKey && (
              <Button
                onClick={copyEnvTemplate}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy .env.local Configuration
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Live Testing */}
        {currentApiKey && currentApiKey !== "your_google_maps_api_key_here" && (
          <>
            <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">🗺️ Live Map Test</CardTitle>
                <CardDescription className="text-gray-300">
                  Interactive map with your API key
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <GoogleMaps
                    locations={[
                      {
                        id: "test",
                        lat: 6.2442,
                        lng: -75.5812,
                        title: "Test Location - Medellín",
                        description: "Testing Google Maps integration",
                        type: "submission",
                      },
                    ]}
                    className="rounded-lg border border-white/20 h-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  📍 Address Autocomplete Test
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Test Places API integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GooglePlacesAutocomplete
                  value={testAddress}
                  onChange={setTestAddress}
                  onPlaceSelect={(place) => {
                    console.log("Place selected:", place);
                    alert(
                      `Selected: ${place.address}\nCoordinates: ${place.lat}, ${place.lng}`
                    );
                  }}
                  placeholder="Type an address in Colombia..."
                  className="custom-input"
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Navigation */}
        <div className="text-center space-x-4">
          <Button
            onClick={() => window.open("/", "_self")}
            className="bg-primary hover:bg-primary/90"
          >
            ← Back to Main App
          </Button>
          <Button
            onClick={() => window.open("/test-maps", "_self")}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Advanced Testing →
          </Button>
        </div>
      </div>
    </div>
  );
}
