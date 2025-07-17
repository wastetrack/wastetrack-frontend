'use client';

import { userListAPI, currentUserAPI } from '@/services/api/user';
import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { showToast } from '@/components/ui';
import {
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  Check,
  Loader2,
  Building2,
  Truck,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import {
  wasteDropRequestAPI,
  WasteDropRequestRequest,
  WasteDropRequestSimpleResponse,
} from '@/services/api/customer';
import PickLocation from '@/components/ui/PickLocation';
import type { WasteCategory } from '@/types/waste-category';

// Local type for waste type (matches API)
type WasteType = {
  id: string;
  name: string;
  category_id?: string;
  subcategory_id?: string;
  unit?: string;
  description?: string;
};

type WasteSubcategory = {
  id: string;
  name: string;
  types: WasteType[];
};

// Type definitions
interface Coordinates {
  lat: number;
  lng: number;
}

interface BankWasteType {
  id: string;
  waste_type_id: string;
  custom_price_per_kgs: number;
  waste_bank_id: string;
  created_at: string;
  updated_at: string;
  waste_type: {
    id: string;
    category_id: string;
    name: string;
    description: string;
    waste_category: {
      id: string;
      name: string;
      description: string;
    };
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface WasteBank {
  id: string;
  profile?: {
    institution?: string;
    address?: string;
    phone_number?: string;
    location?: {
      coordinates?: Coordinates;
      address?: string;
    };
  };
  role: string;
  distance?: number | null;
  originalData?: {
    id?: string;
    institution?: string;
    name?: string;
    phone?: string;
    phone_number?: string;
    address?: string;
    role?: string;
    city?: string;
    province?: string;
    coordinates?: Coordinates;
    location?: { coordinates?: Coordinates; address?: string };
    [key: string]: unknown;
  };
}

interface LocationDataMap {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  province?: string;
}

interface PickLocationData {
  latitude: number;
  longitude: number;
}

interface SavedLocationPayload extends PickLocationData {
  address: string;
  updatedAt: string;
}

interface LocationData {
  address: string;
  coordinates?: {
    lat: string;
    lng: string;
  };
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}

interface UserData {
  phone_number?: string;
  institution?: string;
  address?: string;
  city?: string;
  province?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  [key: string]: unknown;
}

// Extended WasteCategory type for component use
interface ExtendedWasteCategory extends WasteCategory {
  types?: WasteType[];
  subcategories?: WasteSubcategory[];
}

// Haversine formula to calculate distance (in kilometers) between two lat/lng points
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Mock getCurrentLocation function (replace with your actual implementation)
const getCurrentLocation = (options: {
  onSuccess: (locationData: LocationData) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: unknown) => void;
  includeAddress: boolean;
}) => {
  options.onLoading(true);

  if (!navigator.geolocation) {
    options.onError(new Error('Geolocation is not supported by this browser.'));
    options.onLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      options.onSuccess({
        address: `Lat: ${latitude}, Lng: ${longitude}`,
        coordinates: {
          lat: latitude.toString(),
          lng: longitude.toString(),
        },
        latitude,
        longitude,
      });
      options.onLoading(false);
    },
    (error) => {
      options.onError(error);
      options.onLoading(false);
    }
  );
};

// Mock PickLocation component (replace with your actual component)
// const PickLocation: React.FC<{
//   initialLocation?: { latitude: number; longitude: number } | null;
//   onSaveLocation: (locationData: LocationData) => void;
//   onCancel: () => void;
//   pageTitle: string;
//   useFirebase: boolean;
//   allowBack: boolean;
// }> = ({ onSaveLocation, onCancel }) => {
//   return (
//     <div className='fixed inset-0 z-50 bg-white'>
//       <div className='p-4'>
//         <h2 className='mb-4 text-lg font-semibold'>Pick Location</h2>
//         <p className='mb-4 text-gray-500'>
//           Location picker component placeholder
//         </p>
//         <div className='flex gap-2'>
//           <button
//             onClick={() =>
//               onSaveLocation({
//                 address: 'Sample Address',
//                 latitude: -6.2,
//                 longitude: 106.8,
//               })
//             }
//             className='rounded bg-emerald-500 px-4 py-2 text-white'
//           >
//             Save Location
//           </button>
//           <button
//             onClick={onCancel}
//             className='rounded bg-gray-500 px-4 py-2 text-white'
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const authenticatedApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

authenticatedApiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        const tokenManager = getTokenManager();
        const token = await tokenManager.getValidAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for authenticated requests
authenticatedApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      try {
        const tokenManager = getTokenManager();
        const refreshedToken = await tokenManager.getValidAccessToken();

        if (refreshedToken && error.config && !error.config._retry) {
          error.config._retry = true;
          error.config.headers.Authorization = `Bearer ${refreshedToken}`;
          return authenticatedApiClient.request(error.config);
        } else {
          tokenManager.logout();
        }
      } catch (refreshError) {
        console.warn('Failed to refresh token:', refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default function SchedulePage() {
  // State declarations
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [wasteBanks, setWasteBanks] = useState<WasteBank[]>([]);
  const [loadingWasteBanks, setLoadingWasteBanks] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationDataMap | null>(null);
  const [, setSchedules] = useState<WasteDropRequestSimpleResponse[]>([]);

  // Auth state using only currentUserAPI
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [bankWasteTypes, setBankWasteTypes] = useState<BankWasteType[]>([]);
  const [loadingBankWasteTypes, setLoadingBankWasteTypes] = useState(false);
  const [wasteTypesError, setWasteTypesError] = useState('');

  // Form data
  const [formData, setFormData] = useState<{
    deliveryType: string;
    date: string;
    time: string;
    wasteTypes: string[];
    wasteQuantities: Record<string, number>;
    location: string;
    phone: string;
    coordinates: Coordinates | null;
    wasteBankId: string;
    wasteBankName: string;
    notes: string;
  }>({
    deliveryType: '',
    date: '',
    time: '',
    wasteTypes: [],
    wasteQuantities: {},
    location: '',
    phone: '',
    coordinates: null,
    wasteBankId: '',
    wasteBankName: '',
    notes: '',
  });

  // Fetch user profile on component mount (and get userId from profile)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setAuthLoading(true);
        setAuthError(null);
        // Get userId
        const id = await currentUserAPI.getUserId();
        setUserId(id);
        // Get user profile
        const userResponse = await currentUserAPI.getCurrentUser();
        const user = userResponse.data;
        const mappedUserData: UserData = {
          phone_number: user.phone_number || '',
          institution: user.institution || '',
          address: user.address || '',
          city: user.city || '',
          province: user.province || '',
          location: user.location
            ? {
                latitude: user.location.latitude || 0,
                longitude: user.location.longitude || 0,
              }
            : undefined,
        };
        setUserData(mappedUserData);
        setFormData((prev) => ({
          ...prev,
          location: mappedUserData.address || '',
          phone: mappedUserData.phone_number || '',
          coordinates: mappedUserData.location
            ? {
                lat: mappedUserData.location.latitude,
                lng: mappedUserData.location.longitude,
              }
            : null,
        }));
      } catch (error) {
        let errorMessage = 'Gagal memuat profil pengguna';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setAuthError(errorMessage);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Refresh user function (re-fetch profile)
  const refreshUser = () => {
    setAuthError(null);
    setAuthLoading(true);
    const fetchUserProfile = async () => {
      try {
        const id = await currentUserAPI.getUserId();
        setUserId(id);
        const userResponse = await currentUserAPI.getCurrentUser();
        const user = userResponse.data;
        const mappedUserData: UserData = {
          phone_number: user.phone_number || '',
          institution: user.institution || '',
          address: user.address || '',
          city: user.city || '',
          province: user.province || '',
          location: user.location
            ? {
                latitude: user.location.latitude || 0,
                longitude: user.location.longitude || 0,
              }
            : undefined,
        };
        setUserData(mappedUserData);
        setFormData((prev) => ({
          ...prev,
          location: mappedUserData.address || '',
          phone: mappedUserData.phone_number || '',
          coordinates: mappedUserData.location
            ? {
                lat: mappedUserData.location.latitude,
                lng: mappedUserData.location.longitude,
              }
            : null,
        }));
      } catch {
        setAuthError('Gagal memuat ulang profil pengguna');
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUserProfile();
  };

  // REAL API: Function to get waste types for specific bank
  const getBankWasteTypes = async (
    wasteBankId: string
  ): Promise<BankWasteType[]> => {
    try {
      // console.log('🔍 Fetching waste types for bank:', wasteBankId);

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', '1');
      queryParams.append('size', '100'); // Get all waste types for the bank
      queryParams.append('waste_bank_id', wasteBankId);

      const url = `/api/waste-type-prices?${queryParams.toString()}`;
      // console.log('🌐 API URL:', url);

      // Make authenticated API call using the configured client
      const response = await authenticatedApiClient.get(url);
      // console.log('📋 Raw API response:', response.data);

      // Handle response structure based on the actual API response
      let wasteTypes: BankWasteType[] = [];
      if (response.data?.data) {
        wasteTypes = response.data.data;
      } else if (Array.isArray(response.data)) {
        wasteTypes = response.data;
      }

      // console.log(
      //   '✅ Waste types loaded for bank:',
      //   wasteBankId,
      //   'Count:',
      //   wasteTypes.length
      // );
      // console.log('🏷️ Sample waste type:', wasteTypes[0]);

      return wasteTypes;
    } catch (error) {
      console.error(error);

      // For debugging: show more detailed error info
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      if (axios.isAxiosError(error)) {
        console.error('API Error Status:', error.response?.status);
        console.error('API Error Data:', error.response?.data);
      }

      // Fallback: Return empty array instead of throwing to prevent UI crash
      return [];
    }
  };

  // Fetch waste banks from API (role: waste_bank_unit)
  useEffect(() => {
    let isMounted = true;

    const fetchWasteBanks = async () => {
      try {
        setLoadingWasteBanks(true);

        // Try the public method first (no authentication required)
        let response;
        try {
          response = await userListAPI.getUserList({
            role: 'waste_bank_unit',
            size: 50,
          });
        } catch {
          // Fallback to authenticated method if public fails
          // console.log('Public API failed, trying authenticated API...');
          response = await userListAPI.getUserList({
            role: 'waste_bank_unit',
            size: 50,
          });
        }

        // Handle different response structures and map to expected format
        let rawBanks: unknown[] = [];
        if (response?.data?.users) {
          rawBanks = response.data.users;
        } else if (Array.isArray(response?.data)) {
          rawBanks = response.data;
        } else if (Array.isArray(response)) {
          rawBanks = response;
        }

        // Map API response to expected frontend structure
        const mappedBanks: WasteBank[] = rawBanks.map((bank) => {
          const typedBank = bank as {
            id?: string;
            institution?: string;
            name?: string;
            phone?: string;
            phone_number?: string;
            address?: string;
            role?: string;
            city?: string;
            province?: string;
            coordinates?: Coordinates;
            location?: { coordinates?: Coordinates; address?: string };
            [key: string]: unknown;
          };
          return {
            id: typedBank.id || '',
            profile: {
              institution:
                typedBank.institution || typedBank.name || 'Unnamed WasteBank',
              phone_number: typedBank.phone_number || typedBank.phone || '',
              location: {
                address: typedBank.address || 'No address provided',
              },
            },
            role: typedBank.role || 'waste_bank_unit',
            distance: null,
            // Keep original data for additional fields if needed
            originalData: typedBank,
          };
        });

        // Calculate distance if user coordinates are available
        let finalBanks = mappedBanks;
        if (formData.coordinates && mappedBanks.length > 0) {
          finalBanks = mappedBanks.map((bank) => {
            // If bank has coordinates in original data, calculate distance
            const bankCoords =
              bank.originalData?.coordinates ||
              bank.originalData?.location?.coordinates;
            if (bankCoords && bankCoords.lat && bankCoords.lng) {
              const distance = calculateDistance(
                formData.coordinates!.lat,
                formData.coordinates!.lng,
                typeof bankCoords.lat === 'string'
                  ? parseFloat(bankCoords.lat)
                  : bankCoords.lat,
                typeof bankCoords.lng === 'string'
                  ? parseFloat(bankCoords.lng)
                  : bankCoords.lng
              );
              return { ...bank, distance };
            }
            return { ...bank, distance: null };
          });

          // Sort by distance
          finalBanks.sort((a, b) => {
            const aDistance = a.distance ?? Number.POSITIVE_INFINITY;
            const bDistance = b.distance ?? Number.POSITIVE_INFINITY;
            return aDistance - bDistance;
          });
        }

        if (isMounted) {
          setWasteBanks(finalBanks);
          // console.log('🏦 Waste banks loaded:', finalBanks.length);
        }
      } catch (error) {
        console.error('Error fetching waste banks:', error);
        if (isMounted) {
          setWasteBanks([]);
        }
      } finally {
        if (isMounted) {
          setLoadingWasteBanks(false);
        }
      }
    };

    fetchWasteBanks();

    return () => {
      isMounted = false;
    };
  }, [formData.coordinates]);

  // FIXED: Fetch waste types when bank is selected or changed
  useEffect(() => {
    const fetchBankWasteTypes = async () => {
      if (!formData.wasteBankId) {
        // console.log('🚫 No bank selected, clearing waste types');
        setBankWasteTypes([]);
        return;
      }

      try {
        setLoadingBankWasteTypes(true);
        setWasteTypesError('');

        // console.log('🔄 Fetching waste types for bank:', formData.wasteBankId);
        // console.log('🏦 Bank name:', formData.wasteBankName);

        const wasteTypes = await getBankWasteTypes(formData.wasteBankId);
        setBankWasteTypes(wasteTypes);

        // console.log('✅ Bank waste types loaded:', wasteTypes.length);
      } catch (error) {
        console.error(error);
        setWasteTypesError('Gagal memuat jenis sampah untuk bank sampah ini');
        setBankWasteTypes([]);
      } finally {
        setLoadingBankWasteTypes(false);
      }
    };

    fetchBankWasteTypes();
  }, [formData.wasteBankId]); // Re-fetch when bank changes

  // Clear selected waste types when bank changes
  useEffect(() => {
    if (formData.wasteBankId) {
      // console.log('🗑️ Clearing selected waste types for new bank');
      setFormData((prev) => ({
        ...prev,
        wasteTypes: [],
        wasteQuantities: {},
      }));
    }
  }, [formData.wasteBankId]);

  // FIXED: Function to handle bank selection with proper logging
  const handleBankSelection = (bank: WasteBank) => {
    // console.log('🏦 Bank selected:', {
    //   id: bank.id,
    //   name: bank.profile?.institution,
    //   originalData: bank.originalData,
    // });

    setFormData((prev) => ({
      ...prev,
      wasteBankId: bank.id,
      wasteBankName: bank.profile?.institution || 'Unnamed WasteBank',
      // Clear waste selections when changing bank
      wasteTypes: [],
      wasteQuantities: {},
    }));

    // console.log('💾 Form data updated with bank ID:', bank.id);
  };

  // Function to map bank waste types to frontend structure
  const mapBankWasteTypesToFrontend = (): ExtendedWasteCategory[] => {
    if (!bankWasteTypes.length) {
      // console.log('📦 No bank waste types to map');
      return [];
    }

    // console.log('🗂️ Mapping bank waste types:', bankWasteTypes.length);

    const categoriesMap = new Map<
      string,
      {
        id: string;
        name: string;
        description: string;
        types: WasteType[];
      }
    >();

    bankWasteTypes.forEach((bankType) => {
      const categoryId = bankType.waste_type.category_id;
      const categoryName = bankType.waste_type.waste_category.name;
      const categoryDescription =
        bankType.waste_type.waste_category.description;

      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          description: categoryDescription,
          types: [],
        });
      }

      const category = categoriesMap.get(categoryId)!;
      const wasteTypeItem: WasteType = {
        id: bankType.waste_type.id,
        name: bankType.waste_type.name,
        category_id: bankType.waste_type.category_id,
        description: bankType.waste_type.description,
      };

      category.types.push(wasteTypeItem);
    });

    // Convert to array format
    const result = Array.from(categoriesMap.values())
      .map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        types: category.types,
      }))
      .filter((category) => category.types && category.types.length > 0);

    // console.log('✅ Mapped categories:', result.length);
    // console.log(
    //   '📋 Categories:',
    //   result.map((c) => `${c.name} (${c.types?.length} types)`)
    // );
    return result;
  };

  // Get mapped waste types for rendering
  const wasteTypes = mapBankWasteTypesToFrontend();

  // Fetch upcoming schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await wasteDropRequestAPI.getCustomerWasteDropRequests({
          delivery_type: 'pickup',
          status: 'pending',
          page: 1,
          size: 5,
        });
        setSchedules(res.data);
      } catch {
        setError('Gagal memuat jadwal');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Time slots with 2-hour intervals
  const timeSlots: TimeSlot[] = [
    { time: '08:00-10:00', available: true },
    { time: '10:00-12:00', available: true },
    { time: '13:00-15:00', available: true },
    { time: '15:00-17:00', available: true },
  ];

  // Fixed handleGetLocation function for SchedulePickup.tsx
  const handleGetLocation = (): void => {
    setGettingLocation(true);
    getCurrentLocation({
      onSuccess: (locationData: LocationData) => {
        if (locationData.coordinates) {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: parseFloat(locationData.coordinates!.lat),
              lng: parseFloat(locationData.coordinates!.lng),
            },
            location: locationData.address || prev.location,
          }));
        }
        setGettingLocation(false);
      },
      onLoading: (loading: boolean) => {
        setGettingLocation(loading);
      },
      onError: () => {
        setGettingLocation(false);
        Swal.fire({
          title: 'Error',
          text: 'Gagal mendapatkan lokasi. Silakan coba lagi.',
          icon: 'error',
          confirmButtonColor: '#10B981',
          customClass: {
            popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
            title: 'text-xl sm:text-2xl font-semibold text-gray-800',
            htmlContainer: 'text-sm sm:text-base text-gray-600',
            confirmButton: 'text-sm sm:text-base',
          },
        });
      },
      includeAddress: true,
    });
  };

  const convertToPickLocationFormat = (
    location: LocationDataMap | null
  ): PickLocationData | null => {
    if (!location) return null;
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  };

  // Handle saving location from PickLocation component
  const handleSaveLocation = (payload: SavedLocationPayload) => {
    console.log('Lokasi baru diterima dari PickLocation:', payload);

    // Konversi ke format LocationDataMap yang digunakan di SchedulePage
    const locationData: LocationDataMap = {
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
      // city dan province bisa diekstrak dari address jika diperlukan
    };

    setSelectedLocation(locationData);

    // Update form data juga
    setFormData((prev) => ({
      ...prev,
      location: payload.address,
      coordinates: {
        lat: payload.latitude,
        lng: payload.longitude,
      },
    }));

    setShowLocationPicker(false);

    // Tambahan: Show success message
    console.log('Lokasi berhasil disimpan:', locationData);
  };

  const handleCancelPicker = () => {
    console.log('Picker dibatalkan');
    setShowLocationPicker(false);
  };

  const handleLocationCorrection = () => {
    console.log(
      'Membuka location picker. Current selectedLocation:',
      selectedLocation
    );
    setShowLocationPicker(true);
  };

  // Handle waste quantity change
  const handleQuantityChange = (typeId: string, change: number): void => {
    setFormData((prev) => {
      const currentQuantity = prev.wasteQuantities[typeId] || 0;
      const newQuantity = Math.max(0, Math.min(10, currentQuantity + change));

      // Copy existing waste types and quantities
      const updatedWasteTypes = [...prev.wasteTypes];
      const updatedWasteQuantities = { ...prev.wasteQuantities };

      if (newQuantity === 0) {
        // Delete waste type if quantity is 0
        const index = updatedWasteTypes.indexOf(typeId);
        if (index > -1) updatedWasteTypes.splice(index, 1);
        delete updatedWasteQuantities[typeId];
      } else {
        // Still keep the waste type in the list
        updatedWasteQuantities[typeId] = newQuantity;
      }

      return {
        ...prev,
        wasteTypes: updatedWasteTypes,
        wasteQuantities: updatedWasteQuantities,
      };
    });
  };

  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;

    const phoneNumber = value.replace(/[^\d]/g, '').slice(0, 13); // Limit to 15 digits
    const length = phoneNumber.length;

    if (length <= 4) return phoneNumber;
    if (length <= 8) {
      return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
    }
    if (length <= 12) {
      return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 8)}-${phoneNumber.slice(8)}`;
    }
    return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 8)}-${phoneNumber.slice(8, 12)}-${phoneNumber.slice(12)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formattedPhone }));
  };

  // Handle form submission (API)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!userId) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
      }
      // Validate required fields
      if (!formData.wasteBankId) {
        throw new Error('Bank sampah belum dipilih');
      }
      if (!formData.date) {
        throw new Error('Tanggal belum dipilih');
      }
      if (!formData.time) {
        throw new Error('Waktu belum dipilih');
      }
      if (formData.wasteTypes.length === 0) {
        throw new Error('Jenis sampah belum dipilih');
      }
      if (!formData.phone) {
        throw new Error('Nomor telepon belum diisi');
      }

      // Compose API request
      const delivery_type =
        formData.deliveryType === 'pickup' ? 'pickup' : 'dropoff';

      // Format date properly (YYYY-MM-DD)
      const appointment_date = formData.date;

      // Convert time slot to start/end time with timezone (as per API example)
      let appointment_start_time = '';
      let appointment_end_time = '';
      if (formData.time) {
        const [start, end] = formData.time.split('-');
        appointment_start_time = `${start}:00+07:00`; // Match API format
        appointment_end_time = `${end}:00+07:00`;
      }

      // Prepare items according to API structure
      const items = {
        waste_type_ids: formData.wasteTypes,
        quantities: formData.wasteTypes.map(
          (typeId) => formData.wasteQuantities[typeId] || 1
        ),
      };

      const req: WasteDropRequestRequest = {
        delivery_type,
        customer_id: userId,
        user_phone_number: formData.phone.replace(/[-\s]/g, ''), // Remove formatting
        waste_bank_id: formData.wasteBankId,
        total_price: 0, // Backend should calculate this
        appointment_location: formData.coordinates
          ? {
              latitude: formData.coordinates.lat,
              longitude: formData.coordinates.lng,
            }
          : undefined,
        appointment_date,
        appointment_start_time,
        appointment_end_time,
        notes: formData.notes || '', // Ensure it's not undefined
        items,
      };

      // Debug: Log the request payload
      // console.log(
      //   '🚀 Submitting waste drop request:',
      //   JSON.stringify(req, null, 2)
      // );
      // console.log('📋 Items structure:', items);
      // console.log('📅 Date/Time:', {
      //   appointment_date,
      //   appointment_start_time,
      //   appointment_end_time,
      // });

      await wasteDropRequestAPI.createWasteDropRequest(req);
      // console.log('✅ Success response:', response);

      setSuccess(true);
      setFormData({
        deliveryType: '',
        date: '',
        time: '',
        wasteTypes: [],
        wasteQuantities: {},
        location: userData?.address || '',
        phone: '',
        coordinates: null,
        wasteBankId: '',
        wasteBankName: '',
        notes: '',
      });
      setStep(1);
    } catch (err) {
      console.error('❌ Submission error:', err);

      // Enhanced error handling
      if (axios.isAxiosError(err)) {
        console.error('API Error Details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            data: err.config?.data,
          },
        });

        // Try to get more specific error message
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data?.errors ||
          `API Error ${err.response?.status}: ${err.response?.statusText}` ||
          'Gagal mengirim permintaan';

        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal menjadwalkan pickup');
      }
    } finally {
      setLoading(false);
    }
  };

  const getWasteDetails = (typeId: string): WasteType | null => {
    for (const category of wasteTypes) {
      if (category.subcategories) {
        for (const subcat of category.subcategories) {
          const found = subcat.types.find((t: WasteType) => t.id === typeId);
          if (found) return found;
        }
      } else if (category.types) {
        const found = category.types.find((t: WasteType) => t.id === typeId);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle success message
  useEffect(() => {
    if (!success) return; // guard clause

    // 1) munculkan toast
    showToast.success('Permintaan setor sampah berhasil dikirim!');

    // 2) reset flag & form
    setSuccess(false);
    setFormData({
      deliveryType: '',
      date: '',
      time: '',
      wasteTypes: [],
      wasteQuantities: {},
      location: userData?.address || '',
      phone: '',
      coordinates: null,
      wasteBankId: '',
      wasteBankName: '',
      notes: '',
    });
  }, [success]); // userData tak perlu di deps, karena hanya dipakai sekali

  // DEBUG: Log form data changes
  useEffect(() => {
    // console.log('📝 Form data updated:', {
    //   wasteBankId: formData.wasteBankId,
    //   wasteBankName: formData.wasteBankName,
    //   wasteTypes: formData.wasteTypes.length,
    // });
  }, [formData.wasteBankId, formData.wasteBankName, formData.wasteTypes]);

  return (
    <div>
      {/* Auth Loading State */}
      {authLoading && (
        <div className='mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
          <div className='flex items-center gap-2'>
            <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
            <span className='font-medium text-blue-700'>
              Memuat informasi pengguna...
            </span>
          </div>
        </div>
      )}

      {/* Auth Error State */}
      {!authLoading && (authError || !userId) && (
        <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-red-500' />
            <div>
              <span className='font-medium text-red-700'>
                {authError || 'Tidak dapat memuat informasi pengguna'}
              </span>
              <p className='mt-1 text-sm text-red-600'>
                {authError
                  ? 'Terjadi kesalahan saat memuat profil.'
                  : 'Silakan login kembali untuk melanjutkan.'}
              </p>
              {authError && (
                <button
                  onClick={refreshUser}
                  className='mt-2 text-sm text-red-600 underline hover:text-red-800'
                >
                  Coba Lagi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className='mb-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 p-4 text-center text-white'>
        <h1 className='mb-2 text-lg font-bold sm:text-2xl'>Setor Sampah</h1>
        <p className='sm:text-md text-sm text-emerald-50'>
          Bantu kelola sampah Anda dengan berkelanjutan
        </p>
      </div>

      {/* DEBUG PANEL - Remove in production */}
      <div className='mb-4 hidden rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
        <h3 className='mb-2 text-sm font-medium text-yellow-800'>
          Debug Info:
        </h3>
        <div className='space-y-1 text-xs text-yellow-700'>
          <div>
            Auth Loading:{' '}
            <span className='font-mono'>{authLoading ? 'Yes' : 'No'}</span>
          </div>
          <div>
            Auth Error: <span className='font-mono'>{authError || 'None'}</span>
          </div>
          <div>
            Current User ID:{' '}
            <span className='font-mono'>{userId || 'None'}</span>
          </div>
          <div>
            User Data Loaded:{' '}
            <span className='font-mono'>{userData ? 'Yes' : 'No'}</span>
          </div>
          <div>
            Selected Bank ID:{' '}
            <span className='font-mono'>{formData.wasteBankId || 'None'}</span>
          </div>
          <div>
            Selected Bank Name:{' '}
            <span className='font-mono'>
              {formData.wasteBankName || 'None'}
            </span>
          </div>
          <div>
            Raw Waste Types from API:{' '}
            <span className='font-mono'>{bankWasteTypes.length}</span>
          </div>
          <div>
            Mapped Categories:{' '}
            <span className='font-mono'>{wasteTypes.length}</span>
          </div>
          <div>
            Selected Waste Types:{' '}
            <span className='font-mono'>{formData.wasteTypes.length}</span>
          </div>
          <div>
            Delivery Type:{' '}
            <span className='font-mono'>{formData.deliveryType || 'None'}</span>
          </div>
          <div>
            Date: <span className='font-mono'>{formData.date || 'None'}</span>
          </div>
          <div>
            Time: <span className='font-mono'>{formData.time || 'None'}</span>
          </div>
          <div>
            Phone: <span className='font-mono'>{formData.phone || 'None'}</span>
          </div>
          <div>
            User Phone:{' '}
            <span className='font-mono'>
              {userData?.phone_number || 'None'}
            </span>
          </div>
          <div>
            User Address:{' '}
            <span className='font-mono'>{userData?.address || 'None'}</span>
          </div>
          <div>
            User City:{' '}
            <span className='font-mono'>{userData?.city || 'None'}</span>
          </div>
          <div>
            User Province:{' '}
            <span className='font-mono'>{userData?.province || 'None'}</span>
          </div>
          <div>
            User Institution:{' '}
            <span className='font-mono'>{userData?.institution || 'None'}</span>
          </div>
          <div>
            User Location:{' '}
            <span className='font-mono'>
              {userData?.location
                ? `${userData.location.latitude}, ${userData.location.longitude}`
                : 'None'}
            </span>
          </div>
          {bankWasteTypes.length > 0 && (
            <div>
              Sample Category:{' '}
              <span className='font-mono'>
                {bankWasteTypes[0]?.waste_type?.waste_category?.name}(
                {bankWasteTypes[0]?.waste_type?.name})
              </span>
            </div>
          )}
          {formData.wasteTypes.length > 0 && (
            <div>
              Selected Types:{' '}
              <span className='font-mono'>
                {formData.wasteTypes
                  .map((id) => {
                    const waste = getWasteDetails(id);
                    return waste
                      ? `${waste.name}(${formData.wasteQuantities[id] || 1})`
                      : id;
                  })
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Steps indicator with progress bar */}
      <div>
        {/* Progress bar */}
        <div className='relative mb-8'>
          <div className='h-1 w-full rounded-full bg-gray-200 sm:h-2'>
            <div
              className='h-1 rounded-full bg-emerald-500 transition-all duration-300 sm:h-2'
              style={{
                width: `${((step - 1) / ((formData.deliveryType === 'pickup' ? 6 : 4) - 1)) * 100}%`,
              }}
            />
          </div>
          <div className='absolute -top-2 left-0 flex w-full justify-between'>
            {[
              'Delivery',
              'WasteBank',
              'Schedule',
              'Details',
              'Location',
              'Confirm',
            ]
              .slice(0, formData.deliveryType === 'pickup' ? 6 : 4)
              .map((text, index) => (
                <div
                  key={text}
                  className={`-ml-3 flex h-5 w-5 items-center justify-center rounded-full text-sm transition-all
                    duration-300 first:ml-0 last:ml-0 sm:h-6 sm:w-6
                    ${
                      step > index + 1
                        ? 'bg-emerald-500 text-white'
                        : step === index + 1
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  style={{
                    left: `${(index / ((formData.deliveryType === 'pickup' ? 6 : 4) - 1)) * 100}%`,
                  }}
                >
                  {step > index + 1 ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <span className='text-xs'>{index + 1}</span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Step labels */}
        <div className='flex hidden justify-between px-1 text-[10px] text-gray-600'>
          {[
            'Pengiriman',
            'Lokasi',
            'Bank Sampah',
            'Jadwal',
            'Detail',
            'Konfirmasi',
          ]
            .slice(0, formData.deliveryType === 'pickup' ? 6 : 4)
            .map((text) => (
              <div key={text} className='flex-1 text-center'>
                {text}
              </div>
            ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-left text-xs sm:mb-6 sm:p-4 sm:text-xs'>
          <div className='flex gap-2 text-red-700 sm:items-center'>
            <AlertCircle className='h-4 w-4 sm:h-5 sm:w-5' />
            <p className='font-medium'>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className='relative space-y-6'>
        {/* Show overlay if loading or not authenticated */}
        {(authLoading || authError || !userId) && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-75'>
            {authLoading ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='h-8 w-8 animate-spin text-emerald-500' />
                <span className='text-gray-600'>Memuat...</span>
              </div>
            ) : authError ? (
              <div className='text-center'>
                <AlertCircle className='mx-auto mb-2 h-12 w-12 text-red-500' />
                <p className='mb-2 text-gray-600'>
                  Gagal memuat profil pengguna
                </p>
                <button
                  onClick={refreshUser}
                  className='rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600'
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <div className='text-center'>
                <AlertCircle className='mx-auto mb-2 h-12 w-12 text-red-500' />
                <p className='text-gray-600'>Silakan login untuk melanjutkan</p>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Delivery Type Selection */}
        {step === 1 && (
          <div className='space-y-6'>
            <div className='sm:shadow-xs overflow-hidden rounded-xl sm:border sm:border-gray-200 sm:bg-white'>
              <div className='border-b border-gray-100 py-4 text-center sm:p-6'>
                <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                  Pilih Tipe Pengiriman
                </h2>
                <p className='mt-1 text-sm text-gray-500'>
                  Pilih cara Anda ingin menangani sampah Anda
                </p>
              </div>
              <div className='sm:p-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <button
                    type='button'
                    onClick={() =>
                      setFormData({ ...formData, deliveryType: 'pickup' })
                    }
                    className={`rounded-lg border-2 p-4 transition-all
                      ${
                        formData.deliveryType === 'pickup'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-200'
                      }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 sm:rounded-lg'>
                            <Truck className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
                          </div>
                          <h3 className='text-sm text-gray-900 sm:text-lg'>
                            Jasa Penjemputan
                          </h3>
                        </div>
                        <p className='mt-2 text-left text-xs text-gray-500 sm:text-sm'>
                          Penjemputan sampah ke lokasi Anda
                        </p>
                        <p className='text-left text-xs font-semibold text-emerald-600 sm:text-sm'>
                          Biaya layanan berlaku
                        </p>
                      </div>
                      {formData.deliveryType === 'pickup' && (
                        <div className='hidden rounded-full bg-emerald-500 p-1 text-white'>
                          <Check className='h-3 w-3 sm:h-4 sm:w-4' />
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    type='button'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        deliveryType: 'dropoff',
                      })
                    }
                    className={`rounded-lg border-2 p-4 transition-all
                      ${
                        formData.deliveryType === 'dropoff'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-200'
                      }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='w-full'>
                        <div className='flex cursor-pointer items-center gap-2'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 sm:rounded-lg'>
                            <Package className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
                          </div>
                          <h3 className='text-sm font-medium text-gray-900 sm:text-lg'>
                            Antar Mandiri
                          </h3>
                        </div>
                        <p className='mt-2 text-left text-xs text-gray-500 sm:text-sm'>
                          Antar sampah ke bank sampah
                        </p>
                        <p className='text-left text-xs font-semibold text-emerald-600 sm:text-sm'>
                          Tanpa biaya layanan
                        </p>
                      </div>
                      {formData.deliveryType === 'dropoff' && (
                        <div className='hidden rounded-full bg-emerald-500 p-1 text-white'>
                          <Check className='h-3 w-3 sm:h-4 sm:w-4' />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location - Only show for pickup service */}
        {formData.deliveryType === 'pickup' && step === 2 && (
          <div className='space-y-6'>
            <div className='sm:shadow-xs overflow-hidden rounded-xl sm:border sm:border-gray-200 sm:bg-white'>
              <div className='border-b border-gray-100 py-4 sm:p-6'>
                <div className='text-center'>
                  <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                    Lokasi Penjemputan
                  </h2>
                  <p className='mt-1 text-sm text-gray-500'>
                    Di mana kami harus menjemput sampah Anda?
                  </p>
                </div>
              </div>
              <div className='space-y-4 sm:p-6'>
                <div className='flex flex-col items-start justify-between gap-4 sm:flex-col'>
                  <textarea
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className='w-full rounded-lg border border-gray-200 p-3 text-sm placeholder:text-xs'
                    rows={4}
                    placeholder='Masukkan alamat lengkap Anda'
                    required
                  />
                  <button
                    type='button'
                    onClick={handleGetLocation}
                    className='flex hidden w-full flex-shrink-0 items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-200'
                  >
                    {gettingLocation ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Navigation className='h-4 w-4' />
                    )}
                    Lokasi Saat Ini
                  </button>

                  <button
                    type='button'
                    onClick={handleLocationCorrection}
                    className='flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-200'
                  >
                    <MapPin className='h-4 w-4' />
                    {selectedLocation
                      ? 'Ubah Lokasi di Peta'
                      : 'Pilih Lokasi di Peta'}
                  </button>

                  {/* Location Picker Modal */}
                  {selectedLocation && (
                    <div className='hidden w-full rounded-lg border border-emerald-200 bg-emerald-50 p-3'>
                      <div className='flex items-start gap-2'>
                        <MapPin className='mt-0.5 h-4 w-4 text-emerald-600' />
                        <div>
                          <p className='text-sm font-medium text-emerald-800'>
                            Lokasi Terpilih dari Peta:
                          </p>
                          <p className='text-xs text-emerald-700'>
                            {selectedLocation.address}
                          </p>
                          <p className='text-xs text-emerald-600'>
                            {selectedLocation.latitude.toFixed(6)},{' '}
                            {selectedLocation.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type='tel'
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className='w-full rounded-lg border border-gray-200 p-3 text-sm placeholder:text-xs'
                  placeholder='No. Telp. (contoh: 0812-3456-7890)'
                  pattern='[0-9]{4}-[0-9]{4}-[0-9]{4}(-[0-9]{1,4})?'
                  required
                />

                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className='w-full rounded-lg border border-gray-200 p-3 text-sm placeholder:text-xs'
                  rows={3}
                  placeholder="Catatan tambahan (contoh: 'Sampah berada dalam kantong hitam dekat garasi')"
                />
              </div>
            </div>
          </div>
        )}

        {showLocationPicker && (
          <div className='fixed inset-0 z-50 bg-opacity-50'>
            <div className='h-full w-full rounded-lg bg-white'>
              {/* Tambahkan tombol close untuk mobile */}
              <button
                onClick={handleCancelPicker}
                className='absolute right-4 top-4 z-10 hidden rounded-full bg-white p-2 shadow-lg hover:bg-gray-50'
              >
                <X className='h-5 w-5' />
              </button>

              <PickLocation
                // Konversi selectedLocation ke format yang diharapkan PickLocation
                initialLocation={convertToPickLocationFormat(selectedLocation)}
                onSaveLocation={handleSaveLocation}
                onCancel={handleCancelPicker}
                allowBack={true}
                pageTitle='Pilih Lokasi Penjemputan'
              />
            </div>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className='mt-4 hidden rounded border border-yellow-300 bg-yellow-50 p-2 text-xs'>
            <strong>DEBUG Location State:</strong>
            <pre>
              {JSON.stringify(
                {
                  showLocationPicker,
                  selectedLocation,
                  formDataLocation: formData.location,
                  formDataCoordinates: formData.coordinates,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Step 2 for dropoff dan Step 3 for pickup: WasteBank Selection */}
        {((formData.deliveryType === 'dropoff' && step === 2) ||
          (formData.deliveryType === 'pickup' && step === 3)) && (
          <div className='space-y-6'>
            <div className='sm:shadow-xs overflow-hidden rounded-xl sm:border sm:border-gray-200 sm:bg-white'>
              <div className='border-b border-gray-100 py-4 text-center sm:p-6'>
                <div>
                  <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                    Pilih Bank Sampah
                  </h2>
                  <p className='mt-1 text-sm text-gray-500'>
                    Pilih bank sampah yang akan mengelola sampah Anda
                  </p>
                </div>
              </div>

              {loadingWasteBanks ? (
                <div className='flex justify-center p-6'>
                  <Loader2 className='h-8 w-8 animate-spin text-emerald-500' />
                </div>
              ) : (
                <div className='divide-y divide-gray-200 border-b border-gray-200'>
                  {wasteBanks.map((bank) => (
                    <label
                      key={bank.id}
                      className={`group flex cursor-pointer items-start p-2 transition-all duration-300 hover:bg-emerald-100/60 sm:p-4
                        ${formData.wasteBankId === bank.id ? 'bg-emerald-100' : ''}`}
                    >
                      <input
                        type='radio'
                        name='wasteBank'
                        className='sr-only'
                        checked={formData.wasteBankId === bank.id}
                        onChange={() => handleBankSelection(bank)}
                      />
                      <div className='flex-1 p-2'>
                        <div className='items-center justify-between text-left'>
                          <div className='flex items-start gap-4'>
                            <div>
                              <h3 className='text-sm font-medium text-gray-900 transition-colors duration-300 group-hover:text-emerald-700'>
                                {bank.profile?.institution ||
                                  'Unnamed WasteBank'}
                              </h3>
                              <div className='mt-1 flex flex-col gap-0.5'>
                                <div className='flex items-center gap-2'>
                                  <p className='text-xs text-gray-500'>
                                    {bank.profile?.location?.address ||
                                      'No address provided'}
                                  </p>
                                </div>
                                {bank.originalData &&
                                  (bank.originalData.city ||
                                    bank.originalData.province) && (
                                    <div className='flex items-center gap-2'>
                                      <p className='text-xs text-gray-500'>
                                        {bank.originalData.city}
                                        {bank.originalData.city &&
                                        bank.originalData.province
                                          ? ', '
                                          : ''}
                                        {bank.originalData.province}
                                      </p>
                                    </div>
                                  )}
                              </div>
                              <div className='mt-2 items-center gap-4'>
                                <div>
                                  {bank.profile?.phone_number && (
                                    <div className='flex items-center text-xs text-gray-500'>
                                      {bank.profile.phone_number}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {formData.wasteBankId === bank.id && (
                            <div className='sm:shadow-xs mt-4 hidden rounded-full border border-gray-200 bg-emerald-500 p-[2px] text-white sm:shadow-emerald-100'>
                              <Check className='hidden h-3 w-3 sm:h-5 sm:w-5' />
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {((formData.deliveryType === 'dropoff' && step === 3) ||
          (formData.deliveryType === 'pickup' && step === 4)) && (
          <div className='space-y-6'>
            {/* Date selection */}
            <div className='sm:shadow-xs overflow-hidden rounded-xl sm:border sm:border-gray-200 sm:bg-white'>
              <div className='border-b border-gray-100 py-4 sm:p-6'>
                {/* <Calendar className='h-7 w-7 text-emerald-500' /> */}
                <div className='text-center'>
                  <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                    Pilih Tanggal
                  </h2>
                  <p className='mt-1 text-sm text-gray-500'>
                    Pilih tanggal penjemputan yang Anda inginkan
                  </p>
                </div>
              </div>
              <div className='pb-6 sm:p-6'>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className='w-full rounded-lg border border-gray-200 bg-white p-3 text-sm'
                  required
                />
              </div>
            </div>

            {/* Time selection */}
            <div className='sm:shadow-xs overflow-hidden rounded-xl sm:border sm:border-gray-200 sm:bg-white'>
              <div className='pb-4 sm:border-b sm:border-gray-100 sm:p-6'>
                <div className='text-center'>
                  <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                    Pilih Waktu
                  </h2>
                  <p className='mt-1 text-sm text-gray-500'>
                    Pilih waktu penjemputan yang Anda inginkan
                  </p>
                </div>
              </div>
              <div className='sm:p-6'>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                  {timeSlots.map(({ time, available }) => (
                    <button
                      key={time}
                      type='button'
                      disabled={!available}
                      onClick={() => setFormData({ ...formData, time })}
                      className={`rounded-md p-3 text-xs font-medium transition-colors sm:text-sm 
                        ${
                          formData.time === time
                            ? 'bg-emerald-500 text-white'
                            : available
                              ? 'border border-gray-200 bg-white text-gray-700 hover:bg-emerald-100'
                              : 'cursor-not-allowed border border-gray-200 bg-white text-gray-400'
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Waste Details */}
        {((formData.deliveryType === 'dropoff' && step === 4) ||
          (formData.deliveryType === 'pickup' && step === 5)) && (
          <div className='space-y-6'>
            <div className='sm:shadow-xs overflow-hidden rounded-xl sm:border sm:border-gray-200 sm:bg-white'>
              <div className='py-4 sm:border-b sm:border-gray-100 sm:p-6'>
                <div className='text-center'>
                  <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                    Pilih Jenis Sampah
                  </h2>
                  <p className='mt-1 text-sm text-gray-500'>
                    Pilih jenis sampah yang diterima oleh{' '}
                    <span className='font-medium text-emerald-600'>
                      {formData.wasteBankName || 'bank sampah yang dipilih'}
                    </span>
                  </p>
                </div>
              </div>

              <div className='sm:p-6'>
                {/* No Bank Selected State */}
                {!formData.wasteBankId ? (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <Building2 className='mb-4 h-12 w-12 text-gray-400' />
                    <p className='text-center text-gray-500'>
                      Silakan pilih bank sampah terlebih dahulu di langkah
                      sebelumnya
                    </p>
                    <button
                      type='button'
                      onClick={() => setStep(2)}
                      className='mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-white transition-colors hover:bg-emerald-600'
                    >
                      Pilih Bank Sampah
                    </button>
                  </div>
                ) : loadingBankWasteTypes ? (
                  <div className='flex items-center justify-center py-12'>
                    <Loader2 className='h-8 w-8 animate-spin text-emerald-500' />
                    <span className='ml-2 text-gray-600'>
                      Memuat jenis sampah untuk {formData.wasteBankName}...
                    </span>
                  </div>
                ) : wasteTypesError ? (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <AlertCircle className='mb-4 h-12 w-12 text-red-500' />
                    <p className='mb-2 text-center text-red-600'>
                      {wasteTypesError}
                    </p>
                    <p className='mb-4 text-center text-sm text-gray-500'>
                      Bank sampah ini mungkin belum mengatur jenis sampah yang
                      diterima
                    </p>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => window.location.reload()}
                        className='rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600'
                      >
                        Muat Ulang
                      </button>
                      <button
                        type='button'
                        onClick={() => setStep(2)}
                        className='rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
                      >
                        Pilih Bank Lain
                      </button>
                    </div>
                  </div>
                ) : wasteTypes.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <Package className='mb-4 h-12 w-12 text-gray-400' />
                    <p className='mb-2 text-center text-gray-500'>
                      Bank sampah ini belum menerima jenis sampah apapun
                    </p>
                    <p className='mb-4 text-center text-sm text-gray-400'>
                      Silakan pilih bank sampah lain atau hubungi bank sampah
                      ini langsung
                    </p>
                    <button
                      type='button'
                      onClick={() => setStep(2)}
                      className='rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600'
                    >
                      Pilih Bank Sampah Lain
                    </button>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {/* Waste Types */}
                    {wasteTypes.map((category) => (
                      <div
                        key={category.id}
                        className='overflow-hidden rounded-lg'
                      >
                        <div className='flex items-center justify-between'>
                          <h3 className='text-md font-medium text-gray-900 sm:text-lg'>
                            {category.name}
                          </h3>
                          <span className='rounded-full bg-gray-200 px-2 py-1 text-[10px] text-gray-500 sm:text-xs'>
                            {category.types?.length || 0} jenis
                          </span>
                        </div>

                        <div className='sm:bg-white'>
                          {/* Simplified layout - no subcategories */}
                          <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
                            {category.types?.map((type: WasteType) => {
                              const isChecked = formData.wasteTypes.includes(
                                type.id
                              );
                              const quantity =
                                formData.wasteQuantities[type.id] || 0;

                              const priceInfo = bankWasteTypes.find(
                                (bt) => bt.waste_type.id === type.id
                              );

                              return (
                                <div key={type.id} className='space-y-1'>
                                  <label className='flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50'>
                                    <div className='flex flex-1 flex-col items-start'>
                                      <div className='flex w-full items-center'>
                                        <input
                                          type='checkbox'
                                          checked={isChecked}
                                          onChange={() => {
                                            const newTypes = isChecked
                                              ? formData.wasteTypes.filter(
                                                  (t) => t !== type.id
                                                )
                                              : [
                                                  ...formData.wasteTypes,
                                                  type.id,
                                                ];
                                            setFormData((prev) => ({
                                              ...prev,
                                              wasteTypes: newTypes,
                                              wasteQuantities: {
                                                ...prev.wasteQuantities,
                                                [type.id]: newTypes.includes(
                                                  type.id
                                                )
                                                  ? 1
                                                  : 0,
                                              },
                                            }));
                                          }}
                                          className='h-3 w-3 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 sm:h-4 sm:w-4'
                                        />
                                        <span className='ml-2 flex-1 text-sm text-gray-700'>
                                          {type.name}
                                        </span>
                                        {isChecked && (
                                          <div className='flex items-center text-emerald-600'>
                                            <Check className='h-4 w-4' />
                                          </div>
                                        )}
                                      </div>
                                      {priceInfo && (
                                        <div className='ml-5 mt-1 hidden'>
                                          <span className='text-xs text-gray-500'>
                                            Rp{' '}
                                            {priceInfo.custom_price_per_kgs.toLocaleString()}
                                            /kg
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </label>

                                  {isChecked && (
                                    <div className='flex items-center justify-between rounded-md sm:bg-white sm:shadow-sm'>
                                      <div className='flex items-center gap-3'>
                                        <div className='flex items-center'>
                                          <button
                                            type='button'
                                            onClick={() =>
                                              handleQuantityChange(type.id, -1)
                                            }
                                            disabled={quantity <= 0}
                                            className={`rounded-l-md p-2 transition-colors ${
                                              quantity <= 0
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-200 active:bg-emerald-300'
                                            }`}
                                          >
                                            <Minus
                                              className='h-3 w-3 sm:h-5 sm:w-5'
                                              strokeWidth={2.5}
                                            />
                                          </button>
                                          <div className='flex h-[32px] w-12 items-center justify-center bg-white text-sm font-semibold text-gray-800 sm:text-base'>
                                            {quantity}
                                          </div>
                                          <button
                                            type='button'
                                            onClick={() =>
                                              handleQuantityChange(type.id, 1)
                                            }
                                            disabled={quantity >= 10}
                                            className={`rounded-r-md p-2 transition-colors ${
                                              quantity >= 10
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:bg-emerald-200'
                                            }`}
                                          >
                                            <Plus
                                              className='h-3 w-3 sm:h-5 sm:w-5'
                                              strokeWidth={2.5}
                                            />
                                          </button>
                                        </div>
                                        <span className='min-w-[60px] text-xs font-medium text-gray-500 sm:text-sm'>
                                          kantong
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6 (pickup) or Step 4 (dropoff): Confirmation */}
        {((formData.deliveryType === 'pickup' && step === 6) ||
          (formData.deliveryType === 'dropoff' && step === 4)) && (
          <div className='sm:shadow-xs overflow-hidden rounded-xl sm:border sm:border-gray-200 sm:bg-white'>
            <div className='py-4 text-center sm:border-b sm:border-gray-100 sm:p-6'>
              <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                Tinjau{' '}
                {formData.deliveryType === 'pickup'
                  ? 'Penjemputan'
                  : 'Pengantaran'}{' '}
                Anda
              </h2>
              <p className='mt-1 text-sm text-gray-500'>
                Harap konfirmasi detail informasi Anda
              </p>
            </div>

            <div className='space-y-6 text-left sm:p-6'>
              {/* WasteBank Info */}
              <div className='flex items-start gap-4'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 sm:h-10 sm:w-10'>
                  <Building2 className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
                </div>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-gray-500'>
                    Bank Sampah
                  </p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {formData.wasteBankName}
                  </p>
                  {formData.deliveryType === 'dropoff' && (
                    <>
                      <p className='mt-2 text-sm text-gray-500'>
                        {
                          wasteBanks.find(
                            (bank) => bank.id === formData.wasteBankId
                          )?.profile?.address
                        }
                      </p>
                      <div className='mt-4'>
                        <p className='text-xs font-medium text-gray-500'>
                          Nomor Telepon Anda
                        </p>
                        <input
                          type='tel'
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          className='mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm placeholder:text-xs'
                          placeholder='No. Telp. (contoh: 0812-3456-7890)'
                          pattern='[0-9]{4}-[0-9]{4}-[0-9]{4}(-[0-9]{1,4})?'
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Schedule Info */}
              <div className='flex items-start gap-4'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 sm:h-10 sm:w-10'>
                  <Calendar className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500'>Jadwal</p>
                  <p className='text-sm font-semibold text-gray-900'>
                    <span>
                      {new Date(formData.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <br />
                    <span>{formData.time}</span>
                  </p>
                </div>
              </div>

              {/* Waste Info */}
              <div className='flex items-start gap-4'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 sm:h-10 sm:w-10'>
                  <Package className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
                </div>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-gray-500'>
                    Detail Sampah
                  </p>
                  <div className='text-sm font-semibold sm:mt-2 sm:space-y-2'>
                    {formData.wasteTypes.map((typeId) => {
                      const waste = getWasteDetails(typeId);
                      const quantity = formData.wasteQuantities[typeId] || 0;
                      return waste ? (
                        <div key={typeId} className='flex justify-between'>
                          <span className='text-gray-900'>
                            {waste.name} ({quantity} kantong)
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Location Info with Notes - Only for pickup */}
              {formData.deliveryType === 'pickup' && (
                <div className='flex items-start gap-4'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 sm:h-10 sm:w-10'>
                    <MapPin className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-xs font-medium text-gray-500'>
                      Lokasi Penjemputan
                    </p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {formData.location}
                    </p>
                    {formData.phone && (
                      <>
                        <p className='mt-2 text-xs font-medium text-gray-500'>
                          Nomor Telepon
                        </p>
                        <p className='text-sm font-semibold text-gray-700'>
                          {formData.phone}
                        </p>
                      </>
                    )}
                    {formData.notes && (
                      <>
                        <p className='mt-2 text-xs font-medium text-gray-500'>
                          Catatan Tambahan
                        </p>
                        <p className='text-sm font-semibold text-gray-700'>
                          {formData.notes}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons - Updated validation */}
        <div className='flex justify-between pt-6'>
          {step > 1 && (
            <button
              type='button'
              onClick={() => setStep(step - 1)}
              className='flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:text-base'
            >
              <ArrowLeft className='h-4 w-4' />
              Kembali
            </button>
          )}

          {((formData.deliveryType === 'pickup' && step < 6) ||
            (formData.deliveryType === 'dropoff' && step < 4)) && (
            <button
              type='button'
              onClick={() => {
                let validationError = '';

                switch (step) {
                  case 1:
                    // Step 1: Delivery Type (sama untuk pickup & dropoff)
                    if (!formData.deliveryType) {
                      validationError =
                        'Silahkan pilih tipe pengiriman untuk melanjutkan';
                    }
                    break;

                  case 2:
                    // Step 2: Location untuk pickup, WasteBank untuk dropoff
                    if (formData.deliveryType === 'pickup') {
                      // Pickup step 2: Location
                      if (!formData.location.trim()) {
                        validationError =
                          'Silahkan masukkan lokasi penjemputan untuk melanjutkan';
                      } else if (!formData.phone) {
                        validationError =
                          'Silahkan masukkan nomor telepon untuk melanjutkan';
                      }
                    } else {
                      // Dropoff step 2: WasteBank
                      if (!formData.wasteBankId) {
                        validationError =
                          'Silahkan pilih Bank Sampah untuk melanjutkan';
                      }
                    }
                    break;

                  case 3:
                    // Step 3: WasteBank untuk pickup, Schedule untuk dropoff
                    if (formData.deliveryType === 'pickup') {
                      // Pickup step 3: WasteBank
                      if (!formData.wasteBankId) {
                        validationError =
                          'Silahkan pilih Bank Sampah untuk melanjutkan';
                      }
                    } else {
                      // Dropoff step 3: Schedule
                      if (!formData.date) {
                        validationError =
                          'Silahkan pilih tanggal untuk melanjutkan';
                      } else if (!formData.time) {
                        validationError =
                          'Silahkan pilih waktu untuk melanjutkan';
                      }
                    }
                    break;

                  case 4:
                    // Step 4: Schedule untuk pickup, WasteDetails untuk dropoff
                    if (formData.deliveryType === 'pickup') {
                      // Pickup step 4: Schedule
                      if (!formData.date) {
                        validationError =
                          'Silahkan pilih tanggal untuk melanjutkan';
                      } else if (!formData.time) {
                        validationError =
                          'Silahkan pilih waktu untuk melanjutkan';
                      }
                    } else {
                      // Dropoff step 4: WasteDetails
                      if (formData.wasteTypes.length === 0) {
                        validationError =
                          'Silahkan pilih minimal satu jenis sampah untuk melanjutkan';
                      } else if (
                        formData.wasteTypes.some(
                          (typeId) => !formData.wasteQuantities[typeId]
                        )
                      ) {
                        validationError =
                          'Silahkan tentukan jumlah untuk semua jenis sampah yang dipilih';
                      }
                    }
                    break;

                  case 5:
                    // Step 5: WasteDetails untuk pickup saja
                    if (formData.deliveryType === 'pickup') {
                      if (formData.wasteTypes.length === 0) {
                        validationError =
                          'Silahkan pilih minimal satu jenis sampah untuk melanjutkan';
                      } else if (
                        formData.wasteTypes.some(
                          (typeId) => !formData.wasteQuantities[typeId]
                        )
                      ) {
                        validationError =
                          'Silahkan tentukan jumlah untuk semua jenis sampah yang dipilih';
                      }
                    }
                    break;
                }

                if (validationError) {
                  setError(validationError);
                  return;
                }

                setError('');
                setStep(step + 1);
              }}
              className='ml-auto flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 sm:text-base'
            >
              Lanjut
              <ArrowRight className='h-4 w-4 sm:h-5 sm:w-5' />
            </button>
          )}

          {((formData.deliveryType === 'pickup' && step === 6) ||
            (formData.deliveryType === 'dropoff' && step === 4)) && (
            <button
              type='submit'
              disabled={loading}
              className={`ml-auto rounded-lg bg-emerald-500 px-6 py-2 text-sm text-white hover:bg-emerald-600 sm:text-base
                ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {loading ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Memproses...
                </span>
              ) : (
                'Konfirmasi'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
