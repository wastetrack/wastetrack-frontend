'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header, BottomNavigation } from '@/components/customer';
import { showDevModal } from '@/components/ui';
import { customerProfileAPI } from '@/services/api/customer/profile';

interface UserProfile {
  fullName?: string;
}

interface UserData {
  profile?: UserProfile;
}

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [userData, setUserData] = useState<UserData>({
    profile: { fullName: 'Loading...' },
  });

  // Get user ID from localStorage
  const getUserId = (): string | null => {
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr);
          return user.id || user.user_id || null;
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  };

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    try {
      const userId = getUserId();
      if (userId) {
        const response = await customerProfileAPI.getProfile(userId);
        if (response.data) {
          // The API returns { data: { user: { username: string } } }
          const profileData = response.data;
          setUserData({
            profile: {
              fullName: profileData.user?.username || 'User',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Keep default data if fetch fails
    }
  }, []);

  // Load user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Set active tab based on current pathname
  useEffect(() => {
    if (pathname?.includes('/dashboard')) {
      setActiveTab('home');
    } else if (pathname?.includes('/detect')) {
      showDevModal({
        title: 'Deteksi Sampah',
        message:
          'Fitur deteksi sampah sedang dalam pengembangan dan belum dapat diakses saat ini.',
        buttonText: 'Mengerti',
      });
      setActiveTab('home');
    } else if (pathname?.includes('/schedule')) {
      setActiveTab('schedule');
    } else if (pathname?.includes('/marketplace')) {
      // Show dev modal for marketplace and redirect to home
      showDevModal({
        title: 'Marketplace',
        message:
          'Fitur marketplace sedang dalam pengembangan dan belum dapat diakses saat ini.',
        buttonText: 'Mengerti',
      });
      setActiveTab('home');
    } else if (pathname?.includes('/history')) {
      // Show dev modal for history
      showDevModal({
        title: 'Riwayat Transaksi',
        message:
          'Fitur riwayat transaksi sedang dalam pengembangan dan belum dapat diakses saat ini.',
        buttonText: 'OK',
      });
      setActiveTab('home');
    }
  }, [pathname]);

  // Handle profile navigation
  const handleProfileClick = (): void => {
    router.push('/customer/profile');
  };

  // Handle settings navigation
  const handleSettingsClick = (): void => {
    router.push('/customer/settings');
  };

  // Handle tab navigation
  const handleTabChange = (tabId: string): void => {
    setActiveTab(tabId);

    switch (tabId) {
      case 'home':
        router.push('/customer');
        break;
      case 'detect':
        showDevModal({
          title: 'Deteksi Sampah',
          message:
            'Fitur deteksi sampah sedang dalam pengembangan dan belum dapat diakses saat ini.',
          buttonText: 'Mengerti',
        });
        break;
      case 'schedule':
        router.push('/customer/schedule');
        break;
      case 'marketplace':
        showDevModal({
          title: 'Marketplace',
          message:
            'Fitur marketplace sedang dalam pengembangan dan belum dapat diakses saat ini.',
          buttonText: 'Mengerti',
        });
        break;
      case 'history':
        showDevModal({
          title: 'Riwayat Transaksi',
          message:
            'Fitur riwayat transaksi sedang dalam pengembangan dan belum dapat diakses saat ini.',
          buttonText: 'OK',
        });
        break;
      default:
        router.push('/customer');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <Header
        userData={userData}
        onProfileClick={handleProfileClick}
        onSettingsClick={handleSettingsClick}
      />

      {/* Main Content */}
      <main className='min-h-screen p-6 py-20'>
        <div className='mx-auto max-w-7xl'>{children}</div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isVisible={true}
      />
    </div>
  );
};

export default CustomerLayout;
