'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl, { Map, Marker, LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MapPin,
  Loader2,
  AlertCircle,
  Save,
  ArrowLeft,
  Search,
  Info,
  X,
  CheckCircle,
} from 'lucide-react';
import { INDONESIA_CITIES, INDONESIA_PROVINCES } from '@/constants';
import {
  PickLocationProps,
  LocationType,
  SavedLocationPayload,
  NominatimGeocodingData,
  NominatimAddress,
  MapboxGeocodingData,
  NominatimResult,
  GooglePlacesResult,
} from '@/types';
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const HelpTooltip = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <div className='group relative'>
    <button
      type='button'
      className='rounded-full bg-gray-100 p-1 text-gray-500 hover:bg-gray-200'
    >
      <Info size={16} />
    </button>
    <div className='absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 transform rounded-md border border-gray-200 bg-white p-3 shadow-lg group-hover:block'>
      <h4 className='mb-1 text-sm font-semibold'>{title}</h4>
      <p className='text-xs text-gray-600'>{content}</p>
    </div>
  </div>
);

// --- Komponen Utama ---
const PickLocation: React.FC<PickLocationProps> = ({
  initialLocation = null,
  onSaveLocation,
  onCancel,
  pageTitle = 'Pilih Lokasi Anda',
  allowBack = true,
}) => {
  const [location, setLocation] = useState<LocationType | null>(
    initialLocation
  );
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const router = useRouter();

  const [addressComponents, setAddressComponents] = useState({
    kota: '',
    provinsi: '',
    kecamatan: '',
    kelurahan: '',
    kodePos: '',
    fullAddress: '',
  });

  // Debug log untuk melihat props yang diterima
  useEffect(() => {
    console.log('PickLocation props:', {
      initialLocation,
      pageTitle,
      allowBack,
      onSaveLocation: !!onSaveLocation,
      onCancel: !!onCancel,
    });
  }, [initialLocation, pageTitle, allowBack, onSaveLocation, onCancel]);

  const fetchAddressFromCoordinates = useCallback(
    async (lat: number, lng: number) => {
      console.log('Fetching address for:', { lat, lng });
      try {
        const providers = [
          {
            name: 'nominatim',
            fetch: async () => {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                  `format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=id`,
                { headers: { 'User-Agent': 'WasteTrack-App/1.0' } }
              );
              if (!response.ok) throw new Error('Nominatim request failed');
              const data = await response.json();
              return {
                address: data.display_name,
                components: data,
                source: 'nominatim',
              };
            },
          },
          {
            name: 'mapbox',
            fetch: async () => {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
                  `access_token=${mapboxgl.accessToken}&language=id&country=id&types=address,poi,place`
              );
              if (!response.ok) throw new Error('Mapbox request failed');
              const data = await response.json();
              const feature = data.features[0];
              return {
                address: feature?.place_name,
                components: feature,
                source: 'mapbox',
              };
            },
          },
        ];

        for (const provider of providers) {
          try {
            const result = await provider.fetch();
            if (result.address && result.address.length > 20) {
              console.log(`Address from ${provider.name}:`, result.address);
              setAddress(result.address);

              // Parse komponen alamat dengan parser yang cerdas
              const parsedComponents = parseIndonesianAddress(
                result.address,
                result.components
              );
              setAddressComponents(parsedComponents);
              console.log('Parsed components:', parsedComponents);

              return;
            }
          } catch (err) {
            console.warn(`${provider.name} failed:`, err);
            continue;
          }
        }

        setAddress('Alamat tidak ditemukan');
      } catch (err) {
        console.error('Error fetching address:', err);
        setAddress('Gagal memuat detail alamat');
      }
    },
    []
  );

  const parseIndonesianAddress = (
    fullAddress: string,
    geocodingData?: NominatimGeocodingData | MapboxGeocodingData
  ) => {
    console.log('Parsing address:', fullAddress);

    const result = {
      kota: '',
      provinsi: '',
      kecamatan: '',
      kelurahan: '',
      kodePos: '',
      fullAddress: fullAddress,
    };
    // Daftar kota/kabupaten utama
    const kotaIndonesia = INDONESIA_CITIES;

    // Daftar provinsi Indonesia
    const provinsiIndonesia = INDONESIA_PROVINCES;

    try {
      // ✅ Step 1: Extract kode pos (paling mudah dan akurat)
      const postalMatch = fullAddress.match(/\b\d{5}\b/);
      if (postalMatch) {
        result.kodePos = postalMatch[0];
        console.log('✅ Found postal code:', result.kodePos);
      }

      // ✅ Step 2: DIRECT MATCHING - Cari kota dari daftar yang PASTI BENAR
      const lowerAddress = fullAddress.toLowerCase();

      // Cari kota dengan exact matching
      for (const kota of kotaIndonesia) {
        const lowerKota = kota.toLowerCase();

        // Cek berbagai format kemungkinan
        if (
          lowerAddress.includes(`, ${lowerKota},`) || // ", Surabaya,"
          lowerAddress.includes(`, ${lowerKota} `) || // ", Surabaya "
          lowerAddress.includes(`${lowerKota},`) || // "Surabaya,"
          lowerAddress.includes(`kota ${lowerKota}`) || // "Kota Surabaya"
          lowerAddress.includes(`kabupaten ${lowerKota}`) || // "Kabupaten Malang"
          lowerAddress.includes(`kab. ${lowerKota}`) || // "Kab. Sidoarjo"
          lowerAddress.includes(`kab ${lowerKota}`) || // "Kab Gresik"
          lowerAddress.endsWith(lowerKota)
        ) {
          // "...Surabaya"

          result.kota = kota;
          console.log('✅ Found city match:', kota);
          break; // Stop setelah ketemu yang pertama
        }
      }

      // ✅ Step 3: DIRECT MATCHING - Cari provinsi dari daftar yang PASTI BENAR
      for (const provinsi of provinsiIndonesia) {
        const lowerProvinsi = provinsi.toLowerCase();

        if (lowerAddress.includes(lowerProvinsi)) {
          result.provinsi = provinsi;
          console.log('✅ Found province match:', provinsi);
          break; // Stop setelah ketemu yang pertama
        }
      }

      // ✅ Step 4: Fallback - Ambil detail dari structured data (hanya jika belum ketemu)
      if (geocodingData && (!result.kota || !result.provinsi)) {
        console.log('🔄 Using structured data as fallback...');

        if (geocodingData.address) {
          // Nominatim structure
          const addr = geocodingData.address as NominatimAddress;

          // Hanya ambil kota dari structured data jika masih kosong DAN ada di daftar kita
          if (!result.kota) {
            const cityFromData =
              addr.city || addr.town || addr.village || addr.municipality || '';
            if (cityFromData) {
              const matchedCity = kotaIndonesia.find(
                (kota) =>
                  kota.toLowerCase() === cityFromData.toLowerCase() ||
                  kota.toLowerCase().includes(cityFromData.toLowerCase()) ||
                  cityFromData.toLowerCase().includes(kota.toLowerCase())
              );
              if (matchedCity) {
                result.kota = matchedCity;
                console.log('✅ Found city from structured data:', matchedCity);
              }
            }
          }

          // Hanya ambil provinsi dari structured data jika masih kosong DAN ada di daftar kita
          if (!result.provinsi) {
            const provFromData = addr.state || addr.province || '';
            if (provFromData) {
              const matchedProv = provinsiIndonesia.find(
                (prov) =>
                  prov.toLowerCase() === provFromData.toLowerCase() ||
                  prov.toLowerCase().includes(provFromData.toLowerCase()) ||
                  provFromData.toLowerCase().includes(prov.toLowerCase())
              );
              if (matchedProv) {
                result.provinsi = matchedProv;
                console.log(
                  '✅ Found province from structured data:',
                  matchedProv
                );
              }
            }
          }

          // Ambil detail lainnya (ini aman karena bukan kota/provinsi)
          if (!result.kecamatan) {
            result.kecamatan = addr.suburb || addr.subdistrict || '';
          }
          if (!result.kelurahan) {
            result.kelurahan = addr.neighbourhood || addr.hamlet || '';
          }
          if (!result.kodePos) {
            result.kodePos = addr.postcode || '';
          }
        } else if (geocodingData.context) {
          // Mapbox structure
          interface MapboxContext {
            id: string;
            text: string;
            [key: string]: unknown;
          }

          const context: MapboxContext[] = Array.isArray(geocodingData.context)
            ? geocodingData.context
            : [];

          context.forEach((ctx: MapboxContext) => {
            if (ctx.id.includes('place') && !result.kota) {
              // Hanya ambil jika ada di daftar kota kita
              const matchedCity = kotaIndonesia.find(
                (kota) =>
                  kota.toLowerCase() === ctx.text.toLowerCase() ||
                  kota.toLowerCase().includes(ctx.text.toLowerCase()) ||
                  ctx.text.toLowerCase().includes(kota.toLowerCase())
              );
              if (matchedCity) {
                result.kota = matchedCity;
                console.log('✅ Found city from Mapbox context:', matchedCity);
              }
            } else if (ctx.id.includes('region') && !result.provinsi) {
              // Hanya ambil jika ada di daftar provinsi kita
              const matchedProv = provinsiIndonesia.find(
                (prov) =>
                  prov.toLowerCase() === ctx.text.toLowerCase() ||
                  prov.toLowerCase().includes(ctx.text.toLowerCase()) ||
                  ctx.text.toLowerCase().includes(prov.toLowerCase())
              );
              if (matchedProv) {
                result.provinsi = matchedProv;
                console.log(
                  '✅ Found province from Mapbox context:',
                  matchedProv
                );
              }
            } else if (ctx.id.includes('district') && !result.kecamatan) {
              result.kecamatan = ctx.text;
            } else if (ctx.id.includes('postcode') && !result.kodePos) {
              result.kodePos = ctx.text;
            }
          });
        }
      }

      // ✅ Final validation - Pastikan hasil adalah kota/provinsi yang valid
      if (result.kota && !kotaIndonesia.includes(result.kota)) {
        console.log('❌ Invalid city detected, clearing:', result.kota);
        result.kota = '';
      }

      if (result.provinsi && !provinsiIndonesia.includes(result.provinsi)) {
        console.log('❌ Invalid province detected, clearing:', result.provinsi);
        result.provinsi = '';
      }

      // Bersihkan string kosong dan trim
      (Object.keys(result) as (keyof typeof result)[]).forEach((key) => {
        if (typeof result[key] === 'string') {
          result[key] = result[key].trim();
        }
      });

      console.log('🎯 Final parsed result:', {
        kota: result.kota,
        provinsi: result.provinsi,
        kodePos: result.kodePos,
      });

      return result;
    } catch (error) {
      console.error('❌ Error parsing address:', error);
      return result;
    }
  };

  const initializeMap = useCallback(
    (lat: number, lng: number) => {
      console.log('Initializing map with:', { lat, lng });

      if (mapContainerRef.current && !mapRef.current) {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: 15,
        });

        // Tambahkan kontrol navigasi
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        // Buat marker yang lebih sederhana
        const marker = new mapboxgl.Marker({
          color: '#10b981', // emerald-500
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(map);

        console.log('Marker created and added to map');

        // Event listener saat marker selesai digeser
        marker.on('dragend', () => {
          const newPos = marker.getLngLat();
          console.log('Marker dragged to:', newPos);
          const newLocation = { latitude: newPos.lat, longitude: newPos.lng };
          setLocation(newLocation);
          fetchAddressFromCoordinates(newPos.lat, newPos.lng);
        });

        // Event listener saat peta diklik
        map.on('click', (e) => {
          const newPos = e.lngLat;
          console.log('Map clicked at:', newPos);
          marker.setLngLat(newPos);
          const newLocation = { latitude: newPos.lat, longitude: newPos.lng };
          setLocation(newLocation);
          fetchAddressFromCoordinates(newPos.lat, newPos.lng);
        });

        // Event saat map selesai dimuat
        map.on('load', () => {
          console.log('Map loaded successfully');
          setLoading(false);
        });

        mapRef.current = map;
        markerRef.current = marker;

        // Ambil alamat untuk lokasi awal
        fetchAddressFromCoordinates(lat, lng);
      }
    },
    [fetchAddressFromCoordinates]
  );

  // Efek untuk memuat lokasi awal & inisialisasi peta
  useEffect(() => {
    console.log(
      'Location effect triggered. Token exists:',
      !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    );

    // Validasi token Mapbox
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setError('Token Mapbox tidak ditemukan. Harap atur di file .env.local');
      setLoading(false);
      return;
    }

    const setInitialLocation = (lat: number, lng: number) => {
      console.log('Setting initial location:', { lat, lng });
      setLocation({ latitude: lat, longitude: lng });

      // Small delay to ensure container is ready
      setTimeout(() => {
        if (!mapRef.current) {
          initializeMap(lat, lng);
        }
      }, 100);
    };

    if (initialLocation) {
      console.log('Using provided initial location');
      setInitialLocation(initialLocation.latitude, initialLocation.longitude);
    } else {
      console.log('Getting current location');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation success:', position.coords);
          setInitialLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Gagal mendapatkan lokasi. Menggunakan lokasi default.');
          const defaultLat = -6.2088; // Jakarta
          const defaultLng = 106.8456;
          setInitialLocation(defaultLat, defaultLng);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        console.log('Cleaning up map');
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialLocation, initializeMap]);

  const searchProviders = {
    // Nominatim (OpenStreetMap) - lebih akurat untuk Indonesia
    nominatim: async (
      query: string,
      proximity?: { lat: number; lng: number }
    ) => {
      const params = new URLSearchParams({
        format: 'json',
        q: query,
        countrycodes: 'id', // Indonesia only
        limit: '5',
        addressdetails: '1',
        extratags: '1',
        namedetails: '1',
      });

      // Add proximity if available
      if (proximity) {
        params.set('lat', proximity.lat.toString());
        params.set('lon', proximity.lng.toString());
        params.set('bounded', '1'); // Prefer results near proximity
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'WasteTrack-App/1.0', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim error: ${response.status}`);
      }

      const data = await response.json();
      return (data as NominatimResult[]).map((item) => ({
        place_name: item.display_name,
        center: [parseFloat(item.lon), parseFloat(item.lat)],
        relevance: item.importance || 0.5,
        properties: {
          category: item.category,
          type: item.type,
          address: item.address,
        },
      }));
    },

    // MapBox sebagai fallback
    mapbox: async (query: string, proximity?: { lat: number; lng: number }) => {
      if (!mapboxgl.accessToken) {
        throw new Error('Mapbox token not available');
      }

      const searchUrl = new URL(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
          encodeURIComponent(query) +
          '.json'
      );
      searchUrl.searchParams.set('access_token', mapboxgl.accessToken);
      searchUrl.searchParams.set('country', 'id');
      searchUrl.searchParams.set('language', 'id');
      searchUrl.searchParams.set('limit', '5');
      searchUrl.searchParams.set('types', 'address,poi,place');

      if (proximity) {
        searchUrl.searchParams.set(
          'proximity',
          `${proximity.lng},${proximity.lat}`
        );
      }

      const response = await fetch(searchUrl.toString());
      if (!response.ok) {
        throw new Error(`Mapbox error: ${response.status}`);
      }

      const data = await response.json();
      return data.features || [];
    },

    // Google Places API sebagai backup premium (jika ada API key)
    google: async (query: string, proximity?: { lat: number; lng: number }) => {
      const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!googleApiKey) {
        throw new Error('Google API key not available');
      }

      const params = new URLSearchParams({
        query: query,
        key: googleApiKey,
        region: 'id', // Indonesia
        language: 'id',
      });

      if (proximity) {
        params.set('location', `${proximity.lat},${proximity.lng}`);
        params.set('radius', '50000'); // 50km radius
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Google error: ${response.status}`);
      }

      const data = await response.json();
      return (data.results || []).map((item: GooglePlacesResult) => ({
        place_name: `${item.name}, ${item.formatted_address}`,
        center: [item.geometry.location.lng, item.geometry.location.lat],
        relevance: item.rating ? item.rating / 5 : 0.5,
        properties: {
          category: item.types?.[0],
          rating: item.rating,
          address: item.formatted_address,
        },
      }));
    },
  };

  // Enhanced search function dengan multiple providers
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const cleanQuery = searchQuery.trim();
    console.log('🔍 Searching for:', cleanQuery);

    setIsSearching(true);
    setError(null);

    setAddressComponents({
      kota: '',
      provinsi: '',
      kecamatan: '',
      kelurahan: '',
      kodePos: '',
      fullAddress: '',
    });

    try {
      const proximity = location
        ? { lat: location.latitude, lng: location.longitude }
        : undefined;
      type SearchResult = {
        place_name: string;
        center: [number, number];
        relevance: number;
        properties: Record<string, unknown>;
      };
      let results: SearchResult[] = [];
      let searchProvider = '';

      // Try providers in order of preference for Indonesia
      const providers = ['nominatim', 'mapbox', 'google'] as const;

      for (const providerName of providers) {
        try {
          console.log(`🔄 Trying ${providerName}...`);
          results = await searchProviders[providerName](cleanQuery, proximity);

          if (results && results.length > 0) {
            searchProvider = providerName;
            console.log(
              `✅ Found ${results.length} results from ${providerName}`
            );
            break;
          }
        } catch (providerError) {
          console.warn(`❌ ${providerName} failed:`, providerError);
          continue; // Try next provider
        }
      }

      if (results.length === 0) {
        throw new Error(
          `Tidak ditemukan hasil untuk "${cleanQuery}". Coba kata kunci yang lebih spesifik atau nama jalan yang lebih umum.`
        );
      }

      // Use the best result (first one, usually most relevant)
      const bestResult = results[0];
      const [newLng, newLat] = bestResult.center;

      console.log('📍 Selected result:', {
        name: bestResult.place_name,
        coordinates: [newLng, newLat],
        provider: searchProvider,
        relevance: bestResult.relevance,
      });

      const newLocation = { latitude: newLat, longitude: newLng };
      setLocation(newLocation);
      setAddress(bestResult.place_name);

      const parsedFromSearch = parseIndonesianAddress(
        bestResult.place_name,
        bestResult
      );
      console.log('🎯 Parsed from search result:', parsedFromSearch);
      setAddressComponents(parsedFromSearch);

      // Update map and marker with smooth animation
      if (mapRef.current && markerRef.current) {
        const newLngLat: LngLatLike = [newLng, newLat];
        mapRef.current.flyTo({
          center: newLngLat,
          zoom: 17, // Zoom in closer for search results
          duration: 1500,
          essential: true,
        });
        markerRef.current.setLngLat(newLngLat);
      }

      // Clear search query after successful search
      setSearchQuery('');

      // Show success feedback
      console.log(`✅ Location found using ${searchProvider}`);
    } catch (err) {
      console.error('🚫 All search providers failed:', err);

      let errorMessage =
        'Gagal mencari lokasi. Silakan coba lagi dengan kata kunci yang berbeda.';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Provide helpful suggestions for common search issues
      if (cleanQuery.length < 3) {
        errorMessage = 'Masukkan minimal 3 karakter untuk pencarian.';
      } else if (!/[a-zA-Z]/.test(cleanQuery)) {
        errorMessage = 'Gunakan nama tempat atau jalan, bukan hanya angka.';
      }

      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Fungsi simpan lokasi
  const handleSaveLocation = async () => {
    if (!location) {
      setError('Lokasi belum dipilih pada peta.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: SavedLocationPayload = {
        ...location,
        address: address || 'Alamat tidak tersedia',
        updatedAt: new Date().toISOString(),
        addressComponents: addressComponents,
      };

      console.log('Saving location with parsed components:', payload);

      if (onSaveLocation) {
        await onSaveLocation(payload);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        if (onCancel) {
          onCancel();
        } else if (allowBack) {
          router.back();
        }
      }, 1500);
    } catch (err) {
      console.error('Save error:', err);
      setError('Gagal menyimpan lokasi. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  // JSX Render
  return (
    <div className='flex h-screen flex-col bg-white'>
      {/* Header */}
      <header className='flex items-center justify-between bg-white p-4 shadow-sm'>
        <div className='flex items-center gap-4'>
          {allowBack && (
            <button
              type='button'
              onClick={() => (onCancel ? onCancel() : router.back())}
              className='text-gray-600 hover:text-gray-900'
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className='text-lg font-semibold'>{pageTitle}</h1>
        </div>
        <HelpTooltip
          title='Cara Menggunakan'
          content="Klik pada peta atau geser penanda untuk memilih lokasi. Anda juga bisa menggunakan fitur pencarian. Klik 'Simpan Lokasi' jika sudah selesai."
        />
      </header>

      {/* Search Bar */}
      <div className='m-4 flex gap-2'>
        <div className='relative flex-grow'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Cari nama jalan atau tempat...'
            className='w-full rounded-md border border-gray-300 p-2 pl-10 text-sm focus:border-emerald-500 focus:ring-emerald-500'
            disabled={isSearching}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchLocation(e as React.FormEvent<HTMLInputElement>);
              }
            }}
          />
          <Search
            size={18}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
          />
        </div>
        <button
          type='button'
          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            handleSearchLocation(e)
          }
          className='flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 disabled:opacity-50'
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? (
            <Loader2 className='animate-spin' size={20} />
          ) : (
            <Search size={20} />
          )}
        </button>
      </div>

      {/* Main Map Container */}
      <main className='relative flex-1'>
        {loading && (
          <div className='absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-90'>
            <Loader2 className='h-8 w-8 animate-spin text-emerald-500' />
            <p className='mt-2 text-gray-600'>Memuat peta...</p>
          </div>
        )}
        <div ref={mapContainerRef} className='h-full w-full' />
      </main>

      {/* Footer Controls */}
      <footer className=' bg-white p-4 shadow-lg'>
        {error && (
          <div className='mb-3 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700'>
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              type='button'
              onClick={() => setError(null)}
              className='ml-auto hidden text-red-700 hover:text-red-900'
            >
              <X size={16} />
            </button>
          </div>
        )}

        {saveSuccess && (
          <div className='mb-3 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700'>
            <CheckCircle size={16} />
            <span>Lokasi berhasil disimpan! Anda akan diarahkan kembali.</span>
          </div>
        )}

        {/* Address Display */}
        <div className='mb-4'>
          <div className='flex items-start gap-3'>
            <MapPin size={20} className='mt-1 flex-shrink-0 text-emerald-500' />
            <div className='flex-1'>
              <h3 className='text-sm font-semibold text-gray-800'>
                Alamat Terpilih
              </h3>
              <p className='text-sm text-gray-600'>
                {address || 'Klik atau geser marker untuk memilih lokasi...'}
              </p>
              {location && (
                <p className='mt-1 text-xs text-gray-500'>
                  {location.latitude.toFixed(6)},{' '}
                  {location.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3 bg-white'>
          <button
            type='button'
            onClick={() => (onCancel ? onCancel() : router.back())}
            className='flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50'
          >
            Batal
          </button>
          <button
            type='button'
            onClick={handleSaveLocation}
            disabled={saving || saveSuccess || !location}
            className='flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300'
          >
            {saving ? (
              <Loader2 className='animate-spin' size={16} />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan Lokasi'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PickLocation;
