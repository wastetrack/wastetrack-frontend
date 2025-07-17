// Code for Mapbox utilities in a React application
// This file provides functions to reverse geocode coordinates and format locations

import { useState, useEffect } from 'react';

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export type LocationType =
  | { latitude: number; longitude: number }
  | string
  | null
  | undefined;

// Cache object (persistent across function calls)
const addressCache: Record<string, string> = {};

// Utility Functions
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string> => {
  const cacheKey = `${lat},${lng}`;

  // Check cache first
  if (addressCache[cacheKey]) {
    return addressCache[cacheKey];
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const address = data.features[0].place_name;

      // Cache the result
      addressCache[cacheKey] = address;

      return address;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  return `Lat: ${lat}, Long: ${lng}`;
};

export const formatLocation = async (
  location: LocationType
): Promise<string> => {
  if (
    location &&
    typeof location === 'object' &&
    location.latitude &&
    location.longitude
  ) {
    return await reverseGeocode(location.latitude, location.longitude);
  }

  if (typeof location === 'string') {
    // fallback lama, jika string mengandung lat/long
    const latLngMatch = location.match(
      /Lat:\s*(-?\d+\.?\d*),\s*Long:\s*(-?\d+\.?\d*)/
    );
    if (latLngMatch) {
      const lat = parseFloat(latLngMatch[1]);
      const lng = parseFloat(latLngMatch[2]);
      return await reverseGeocode(lat, lng);
    }
    return location;
  }

  return 'Lokasi tidak tersedia';
};

// Custom Hook (No JSX, pure logic)
export const useLocation = (location: LocationType) => {
  const [formattedLocation, setFormattedLocation] = useState<string>(
    typeof location === 'string' ? location : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLocation = async () => {
      setIsLoading(true);
      const formatted = await formatLocation(location);
      if (isMounted) {
        setFormattedLocation(formatted);
      }
      setIsLoading(false);
    };

    loadLocation();

    return () => {
      isMounted = false;
    };
  }, [location]);

  return { formattedLocation, isLoading };
};
