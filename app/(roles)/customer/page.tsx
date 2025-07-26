'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  customerProfileAPI,
  type CustomerProfile,
} from '@/services/api/customer';
import { wasteDropRequestAPI } from '@/services/api/user';
import { getTokenManager } from '@/lib/token-manager';
import {
  HeroSection,
  EnvironmentalImpact,
  RecentPickups,
  EcoTip,
} from '@/components/customer/dashboard';
import type { Stats, Pickup } from '@/types';
import type { WasteDropRequest } from '@/types';

export default function CustomerDashboard() {
  // State for profile data
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for waste drop requests
  const [wasteDropRequests, setWasteDropRequests] = useState<
    WasteDropRequest[]
  >([]);
  const [recentPickups, setRecentPickups] = useState<Pickup[]>([]);
  const [loadingPickups, setLoadingPickups] = useState(true);

  const router = useRouter();

  // Function to map WasteDropRequest status to Pickup status
  const mapStatusToPickupStatus = (
    status: WasteDropRequest['status']
  ): 'pending' | 'collecting' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'assigned':
      case 'collecting':
        return 'collecting';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  // Function to map WasteDropRequest to Pickup format
  const mapWasteDropRequestToPickup = (request: WasteDropRequest): Pickup => {
    const startTimeMatch =
      request.appointment_start_time.match(/(\d{2}:\d{2})/);
    const endTimeMatch = request.appointment_end_time?.match(/(\d{2}:\d{2})/);
    const startTime = startTimeMatch
      ? startTimeMatch[1]
      : request.appointment_start_time;
    const endTime = endTimeMatch
      ? endTimeMatch[1]
      : request.appointment_end_time || '';
    const time = endTime ? `${startTime} - ${endTime}` : startTime;

    const mappedPickup = {
      id: request.id,
      delivery_type: request.delivery_type,
      status: mapStatusToPickupStatus(request.status),
      date: request.appointment_date,
      time: time,
    };

    return mappedPickup;
  };

  // Calculate pickup stats from waste drop requests
  const calculatePickupStats = (requests: WasteDropRequest[]) => {
    const pending = requests.filter((r) => r.status === 'pending').length;
    const collecting = requests.filter(
      (r) => r.status === 'assigned' || r.status === 'collecting'
    ).length;
    const completed = requests.filter((r) => r.status === 'completed').length;
    const cancelled = requests.filter((r) => r.status === 'cancelled').length;

    return {
      pending,
      completed,
      cancelled,
      collecting,
    };
  };

  // Stats with real pickup data
  const stats: Stats = {
    points: customerProfile?.user.points || 0,
    impact: {
      carbonReduced: customerProfile?.carbon_deficit || 0,
      waterSaved: customerProfile?.water_saved || 0,
      treesPreserved: customerProfile?.trees || 0,
    },
    waste: {
      total: customerProfile?.bags_stored || 0,
    },
    pickups: calculatePickupStats(wasteDropRequests),
  };

  // Get recent pickups (last 3) - akan di-update setelah data API berhasil
  const displayedPickups = recentPickups.slice(0, 3);

  // Fetch customer profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user ID from token
        const tokenManager = getTokenManager();
        const token = await tokenManager.getValidAccessToken();

        if (!token) {
          throw new Error('No valid token found');
        }

        // Decode token to get user ID (assuming JWT payload contains user info)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id || payload.sub || payload.id;

        if (!userId) {
          throw new Error('User ID not found in token');
        }

        // Fetch profile
        const response = await customerProfileAPI.getProfile(userId);
        setCustomerProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch waste drop requests data
  useEffect(() => {
    const fetchWasteDropRequests = async () => {
      try {
        setLoadingPickups(true);

        // Get user ID from token
        const tokenManager = getTokenManager();
        const token = await tokenManager.getValidAccessToken();

        if (!token) {
          console.log('No token found');
          setLoadingPickups(false);
          return;
        }

        // Decode token to get user ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id || payload.sub || payload.id;

        if (!userId) {
          setLoadingPickups(false);
          return;
        }

        const response = await wasteDropRequestAPI.getCustomerWasteDropRequests(
          userId,
          {
            sort_by: 'created_at',
            order_dir: 'desc',
            size: 5,
          }
        );

        setWasteDropRequests(response.data);

        const mappedPickups = response.data.map(mapWasteDropRequestToPickup);
        setRecentPickups(mappedPickups);
      } catch (err) {
        console.error('Error fetching waste drop requests:', err);
        if (err instanceof Error) {
          console.error('Error message:', err.message);
        }
      } finally {
        setLoadingPickups(false);
      }
    };

    fetchWasteDropRequests();
  }, []);

  const handleViewAllPickups = (): void => {
    router.push('/customer/history');
    console.log('Navigate to all pickups');
  };

  // Loading state
  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600'></div>
          <p className='text-gray-500'>Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <p className='mb-2 text-red-500'>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Return early if no customer profile
  if (!customerProfile) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-500'>Data profile tidak tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Hero Section Component */}
      <HeroSection customerProfile={customerProfile} points={stats.points} />

      {/* Environmental Impact Component */}
      <EnvironmentalImpact impact={stats.impact} waste={stats.waste} />

      {/* Recent Pickups Component */}
      {loadingPickups ? (
        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold'>Riwayat Terbaru</h2>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <div className='mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-emerald-600'></div>
              <p className='text-sm text-gray-500'>Memuat data riwayat...</p>
            </div>
          </div>
        </div>
      ) : (
        <RecentPickups
          pickups={stats.pickups}
          displayedPickups={displayedPickups}
          recentPickups={recentPickups}
          onViewAllPickups={handleViewAllPickups}
        />
      )}

      <EcoTip />
    </div>
  );
}
