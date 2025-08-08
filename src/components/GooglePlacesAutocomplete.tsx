"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';

// Type declarations
interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Ingresa una dirección...",
  className = "",
  disabled = false
}: GooglePlacesAutocompleteProps) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessionToken] = useState(() => Math.random().toString(36).substring(2));
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const searchPlaces = useCallback(async (input: string) => {
    if (!input.trim() || input.length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}&sessiontoken=${sessionToken}`
      );

      console.log('INPUT => ', input, response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setPredictions(data.predictions);
        setShowDropdown(true);
      } else {
        console.warn('Places API response:', data);
        setPredictions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPredictions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    if (!onPlaceSelect) {
      onChange(prediction.description);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setShowDropdown(false);
    onChange(prediction.description);

    try {
      const response = await fetch(
        `/api/places/details?place_id=${encodeURIComponent(prediction.place_id)}&sessiontoken=${sessionToken}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        const location = place.geometry?.location;

        if (location) {
          const placeData = {
            address: place.name ? `${place.name}, ${place.formatted_address}` : place.formatted_address,
            lat: location.lat,
            lng: location.lng,
            placeId: place.place_id
          };

          console.log('Place selected:', placeData);
          onPlaceSelect(placeData);
        } else {
          console.warn('No location data in place details:', place);
        }
      } else {
        console.warn('Place details API response:', data);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isApiKeyConfigured = apiKey && apiKey !== 'your_google_maps_api_key_here';

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isApiKeyConfigured && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )}

      {/* Dropdown with predictions */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => handlePlaceSelect(prediction)}
            >
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {prediction.structured_formatting.main_text}
                </div>
                <div className="text-gray-500">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo suggestions when API key not configured */}
      {!isApiKeyConfigured && value.length > 2 && showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <div className="px-4 py-3 text-sm text-gray-500 border-b">
            <div className="font-medium">Demo Mode - Configure API Key for real suggestions</div>
          </div>
          {[
            'El Poblado, Medellín, Colombia',
            'Laureles, Medellín, Colombia',
            'Centro, Medellín, Colombia',
            'Envigado, Colombia',
            'Sabaneta, Colombia'
          ].filter(addr => addr.toLowerCase().includes(value.toLowerCase())).map((address, idx) => (
            <div
              key={idx}
              className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => {
                onChange(address);
                setShowDropdown(false);
                if (onPlaceSelect) {
                  // Demo coordinates for Medellín area
                  const demoCoords = [
                    { lat: 6.2077, lng: -75.5636 },
                    { lat: 6.2486, lng: -75.5907 },
                    { lat: 6.2442, lng: -75.5812 },
                    { lat: 6.1711, lng: -75.5919 },
                    { lat: 6.1513, lng: -75.6163 }
                  ];
                  const coord = demoCoords[idx] || { lat: 6.2442, lng: -75.5812 };
                  onPlaceSelect({
                    address,
                    lat: coord.lat,
                    lng: coord.lng,
                    placeId: `demo-${idx}`
                  });
                }
              }}
            >
              <div className="text-sm">
                <div className="font-medium text-gray-900">{address}</div>
                <div className="text-gray-500">Demo suggestion</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
