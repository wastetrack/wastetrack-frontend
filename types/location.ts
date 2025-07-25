// ===========================================
// LOCATION TYPES
// ===========================================
export type LocationType = {
  latitude: number;
  longitude: number;
};

export type SavedLocationPayload = {
  latitude: number;
  longitude: number;
  address: string;
  updatedAt: string;
  city?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postalCode?: string;
  addressComponents?: {
    kota: string;
    provinsi: string;
    kecamatan: string;
    kelurahan: string;
    kodePos: string;
    fullAddress: string;
  };
};

export type PickLocationProps = {
  initialLocation?: LocationType | null;
  onSaveLocation?: (location: SavedLocationPayload) => Promise<void> | void;
  onCancel?: () => void;
  pageTitle?: string;
  allowBack?: boolean;
};

// ===========================================
// GEOCODING TYPES
// ===========================================

export type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  province?: string;
  suburb?: string;
  subdistrict?: string;
  neighbourhood?: string;
  hamlet?: string;
  postcode?: string;
  [key: string]: unknown;
};

export type NominatimGeocodingData = {
  address?: NominatimAddress;
  display_name?: string;
  [key: string]: unknown;
};

export type MapboxContext = {
  id: string;
  text: string;
  [key: string]: unknown;
};

export type MapboxGeocodingData = {
  context?: MapboxContext[];
  [key: string]: unknown;
};

export type NominatimResult = {
  display_name: string;
  lon: string;
  lat: string;
  importance?: number;
  category?: string;
  type?: string;
  address?: Record<string, unknown>;
};

export type GooglePlacesResult = {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  types?: string[];
};
