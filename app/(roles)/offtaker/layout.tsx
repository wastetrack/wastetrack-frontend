'use client';

import React from 'react';
import { Sidebar, BottomFooter, PageLayout } from '@/layouts';

interface WasteBankCentralLayoutProps {
  children: React.ReactNode;
}

// Mock user data - replace with actual auth data
const mockUserData = {
  email: 'wastebank-central@example.com',
  profile: {
    institution: 'Bank Sampah Pusat Surabaya',
    institutionName: 'Bank Sampah Pusat Surabaya',
  },
};

export default function WasteBankCentralLayout({
  children,
}: WasteBankCentralLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <PageLayout>
      <div className='flex min-h-screen flex-col bg-gray-50'>
        <Sidebar
          role='industry'
          userData={mockUserData}
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
