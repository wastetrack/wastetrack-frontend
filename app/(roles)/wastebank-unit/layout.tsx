'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, BottomFooter, PageLayout } from '@/layouts';
import {
  wasteBankProfileAPI,
  WasteBankProfile,
} from '@/services/api/wastebank';
import { getTokenManager } from '@/lib/token-manager';

interface WasteBankUnitLayoutProps {
  children: React.ReactNode;
}

export default function WasteBankUnitLayout({
  children,
}: WasteBankUnitLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [profile, setProfile] = useState<WasteBankProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get user ID from token
        const tokenManager = getTokenManager();
        const userData = tokenManager.getCurrentUser();

        if (!userData?.id) {
          console.error('User ID not found');
          return;
        }

        const response = await wasteBankProfileAPI.getProfile(userData.id);
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  // Create user data object for sidebar
  const userData = profile?.user
    ? {
        email: profile.user.email || 'Email tidak tersedia',
        profile: {
          institution: profile.user.institution || 'Tidak tersedia',
          institutionName: profile.user.institution || 'Tidak tersedia',
        },
      }
    : {
        email: 'Loading...',
        profile: {
          institution: 'Loading...',
          institutionName: 'Loading...',
        },
      };

  return (
    <PageLayout>
      <div className='flex min-h-screen flex-col bg-gray-50'>
        <Sidebar
          role='waste_bank_unit'
          userData={userData}
          isCollapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
        <main
          className={`transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'ml-20' : 'ml-72'
          } flex flex-1 flex-col`}
        >
          <div className='flex-1 p-6'>
            <div className='mx-auto p-8'>{children}</div>
          </div>
          <div
            className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}
          >
            <BottomFooter />
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
