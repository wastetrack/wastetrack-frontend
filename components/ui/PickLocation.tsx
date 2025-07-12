'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl, { Map, Marker, LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// --- Komponen Ikon & UI (Tidak berubah) ---
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

// --- Atur Access Token Mapbox ---
// Pastikan variabel lingkungan NEXT_PUBLIC_MAPBOX_TOKEN sudah diatur di .env.local
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// --- Definisi Tipe ---
type LocationType = {
  latitude: number;
  longitude: number;
};

type SavedLocationPayload = LocationType & {
  address: string;
  updatedAt: string;
};

type PickLocationProps = {
  initialLocation?: LocationType | null;
  onSaveLocation?: (location: SavedLocationPayload) => Promise<void> | void;
  onCancel?: () => void;
  pageTitle?: string;
  allowBack?: boolean;
};

// --- Komponen Bantuan (Tooltip - Tidak berubah) ---
const HelpTooltip = ({ title, content }: { title: string; content: string }) => (
  <div className="group relative">
    <button type="button" className="rounded-full bg-gray-100 p-1 text-gray-500 hover:bg-gray-200">
      <Info size={16} />
    </button>
    <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 transform rounded-md border border-gray-200 bg-white p-3 shadow-lg group-hover:block">
      <h4 className="mb-1 text-sm font-semibold">{title}</h4>
      <p className="text-xs text-gray-600">{content}</p>
    </div>
  </div>
);

// --- Komponen Utama dengan Mapbox ---
const PickLocation: React.FC<PickLocationProps> = ({
  initialLocation = null,
  onSaveLocation,
  onCancel,
  pageTitle = 'Pilih Lokasi Anda',
  allowBack = true,
}) => {
  const [location, setLocation] = useState<LocationType | null>(initialLocation);
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

  // Fungsi untuk mengambil alamat menggunakan Mapbox Geocoding API
  const fetchAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=id`
      );
      if (!response.ok) throw new Error('Gagal mengambil data alamat.');
      const data = await response.json();
      const feature = data.features[0];
      setAddress(feature ? feature.place_name : 'Alamat tidak ditemukan');
    } catch {
      setAddress('Gagal memuat detail alamat');
    }
  }, []);

  // Inisialisasi Peta Mapbox
  const initializeMap = useCallback((lat: number, lng: number) => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Gaya peta default Mapbox
        center: [lng, lat], // Mapbox menggunakan format [longitude, latitude]
        zoom: 15,
      });

      // Tambahkan kontrol navigasi (zoom in/out)
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      // Buat elemen HTML kustom untuk marker
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `<div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: radial-gradient(circle, rgba(16,185,129,0.7) 0%, rgba(16,185,129,0.3) 60%, transparent 70%); cursor: pointer;">
                                    <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md"></div>
                                 </div>`;
      
      const marker = new mapboxgl.Marker({
        element: markerElement,
        draggable: true,
      })
      .setLngLat([lng, lat])
      .addTo(map);

      // Event listener saat marker selesai digeser
      marker.on('dragend', () => {
        const newPos = marker.getLngLat();
        setLocation({ latitude: newPos.lat, longitude: newPos.lng });
        fetchAddressFromCoordinates(newPos.lat, newPos.lng);
      });

      // Event listener saat peta diklik
      map.on('click', (e) => {
        const newPos = e.lngLat;
        marker.setLngLat(newPos);
        setLocation({ latitude: newPos.lat, longitude: newPos.lng });
        fetchAddressFromCoordinates(newPos.lat, newPos.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;

      // Ambil alamat untuk lokasi awal
      fetchAddressFromCoordinates(lat, lng);
    }
  }, [fetchAddressFromCoordinates]);

  // Efek untuk memuat lokasi awal & inisialisasi peta
  useEffect(() => {
    // Validasi token Mapbox
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setError('Token Mapbox tidak ditemukan. Harap atur di file .env.local');
      setLoading(false);
      return;
    }

    const setInitialLocation = (lat: number, lng: number) => {
      setLocation({ latitude: lat, longitude: lng });
      setLoading(false);
      if (!mapRef.current) {
        initializeMap(lat, lng);
      }
    };
    
    if (initialLocation) {
      setInitialLocation(initialLocation.latitude, initialLocation.longitude);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialLocation(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Gagal mendapatkan lokasi. Menggunakan lokasi default.');
          const defaultLat = -6.2088; // Jakarta
          const defaultLng = 106.8456;
          setInitialLocation(defaultLat, defaultLng);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    // Fungsi cleanup untuk menghapus map saat komponen unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialLocation, initializeMap]);

  // Fungsi untuk mencari lokasi menggunakan Mapbox Geocoding API
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=id&language=id&limit=1&proximity=${location?.longitude || 'none'},${location?.latitude || 'none'}`
      );
      if(!response.ok) throw new Error("Gagal mencari lokasi.");
      const data = await response.json();

      if (data.features?.length > 0) {
        const feature = data.features[0];
        const [newLng, newLat] = feature.center;
        
        setLocation({ latitude: newLat, longitude: newLng });
        setAddress(feature.place_name);

        if (mapRef.current && markerRef.current) {
          const newLngLat: LngLatLike = [newLng, newLat];
          mapRef.current.flyTo({ center: newLngLat, zoom: 15 });
          markerRef.current.setLngLat(newLngLat);
        }
      } else {
        setError('Lokasi tidak ditemukan.');
      }
    } catch(err) {
      setError((err as Error).message);
    } finally {
      setIsSearching(false);
    }
  };

  // Fungsi simpan lokasi (tidak berubah secara fungsional)
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
        address,
        updatedAt: new Date().toISOString(),
      };
      if (onSaveLocation) {
        await onSaveLocation(payload);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        if (!onCancel && allowBack) {
          router.back();
        }
      }, 1500);
    } catch {
      setError('Gagal menyimpan lokasi. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  // Bagian JSX (Render) tidak banyak berubah
  return (
    <div className='flex h-screen flex-col bg-white sm:bg-gray-50'>
      <header className='flex items-center justify-between border-b p-4 sm:bg-white'>
        <div className='flex items-center gap-4'>
            {allowBack && (
                <button onClick={() => onCancel ? onCancel() : router.back()} className='text-gray-600 hover:text-gray-900'>
                    <ArrowLeft size={24} />
                </button>
            )}
            <h1 className='text-lg font-semibold'>{pageTitle}</h1>
        </div>
         <HelpTooltip 
            title="Cara Menggunakan"
            content="Klik pada peta atau geser penanda untuk memilih lokasi. Anda juga bisa menggunakan fitur pencarian. Klik 'Simpan Lokasi' jika sudah selesai."
         />
      </header>

      <main className='relative flex-1'>
        {loading && (
            <div className='absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm'>
                <Loader2 className='h-8 w-8 animate-spin text-emerald-500' />
                <p className='mt-2 text-gray-600'>Memuat peta...</p>
            </div>
        )}
        <div ref={mapContainerRef} className='h-full w-full' id="map" />
      </main>

      <footer className='border-t bg-white p-4 shadow-top sm:rounded-t-lg'>
         {error && (
            <div className='mb-3 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700'>
                <AlertCircle size={16} />
                <span>{error}</span>
                 <button onClick={() => setError(null)} className='ml-auto text-red-700 hover:text-red-900'>
                    <X size={16}/>
                </button>
            </div>
        )}
        {saveSuccess && (
            <div className='mb-3 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700'>
                <CheckCircle size={16} />
                <span>Lokasi berhasil disimpan! Anda akan diarahkan kembali.</span>
            </div>
        )}
        <form onSubmit={handleSearchLocation} className="mb-4 flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama jalan atau tempat..."
              className="w-full rounded-md border border-gray-300 p-2 pl-10 focus:border-emerald-500 focus:ring-emerald-500"
              disabled={isSearching}
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 disabled:opacity-50"
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </form>

        <div className='mb-4'>
            <div className='flex items-start gap-3'>
                <MapPin size={24} className='mt-1 flex-shrink-0 text-emerald-500' />
                <div>
                    <h3 className='font-semibold text-gray-800'>Alamat Terpilih</h3>
                    <p className='text-sm text-gray-600'>{address || 'Geser peta untuk mendapatkan alamat...'}</p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
                onClick={() => onCancel ? onCancel() : router.back()}
                className='w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50'
            >
                Batal
            </button>
            <button
                onClick={handleSaveLocation}
                disabled={saving || saveSuccess || !location}
                className='flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300'
            >
                {saving ? <Loader2 className='animate-spin' size={20} /> : <Save size={20} />}
                <span>{saving ? 'Menyimpan...' : 'Simpan Lokasi'}</span>
            </button>
        </div>
      </footer>
    </div>
  );
};

export default PickLocation;