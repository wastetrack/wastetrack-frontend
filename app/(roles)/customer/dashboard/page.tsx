'use client';

import { useState, useEffect } from 'react';
import {
  customerProfileAPI,
  type CustomerProfile,
} from '@/services/api/customer';
import { getTokenManager } from '@/lib/token-manager';
import {
  HeroSection,
  EnvironmentalImpact,
  RecentPickups,
  EcoTip,
} from '@/components/customer/dashboard';
import type { Stats, Pickup } from '@/types';

export default function CustomerDashboard() {
  // State for profile data
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy data untuk stats yang belum ada API-nya
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
    pickups: {
      pending: 2,
      completed: 18,
      cancelled: 1,
    },
  };

  const recentPickups: Pickup[] = [
    {
      id: '1',
      status: 'completed',
      wasteQuantities: { plastic: 3, paper: 2 },
      date: '2025-07-03',
      time: '14:30',
    },
    {
      id: '2',
      status: 'pending',
      quantity: 4,
      date: '2025-07-05',
      time: '10:00',
    },
    {
      id: '3',
      status: 'in_progress',
      wasteQuantities: { organic: 2, plastic: 1 },
      date: '2025-07-04',
      time: '16:15',
    },
  ];

  const [displayedPickups] = useState<Pickup[]>(recentPickups.slice(0, 3));

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

  const handleViewAllPickups = (): void => {
    // Navigate to pickups page
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
      <RecentPickups
        pickups={stats.pickups}
        displayedPickups={displayedPickups}
        recentPickups={recentPickups}
        onViewAllPickups={handleViewAllPickups}
      />

      {/* Eco Tip Component */}
      <EcoTip />
    </div>
  );
}
