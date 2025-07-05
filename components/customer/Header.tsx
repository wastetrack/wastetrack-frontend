// components/customer/Header.tsx
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { Alert } from '@/components/ui';
import { showToast } from '@/components/ui';
import { handleLogout } from '@/helpers/utils/logout/logout';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UserProfile {
  fullName?: string;
}

interface UserData {
  profile?: UserProfile;
}

interface HeaderProps {
  userData?: UserData;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  userData, 
  onProfileClick, 
  onSettingsClick 
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Simulated notifications
  useEffect(() => {
    setNotifications([
      { 
        id: 1, 
        title: 'Pickup Scheduled', 
        message: 'Your pickup is scheduled for tomorrow', 
        type: 'info' 
      },
      { 
        id: 2, 
        title: 'New Reward', 
        message: 'You\'ve earned 50 points!', 
        type: 'success' 
      }
    ]);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (!target.closest('.notification-menu')) {
        setIsNotificationOpen(false);
      }
      if (!target.closest('.profile-menu')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Reset profile dropdown when route changes
  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  const handleSignOut = async (): Promise<void> => {
    try {
      const result = await Alert.confirm({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar?',
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Tidak',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444',
      });

      if (result.isConfirmed) {
        // Use the logout service to handle proper logout
        const logoutResult = await handleLogout(router);

        if (logoutResult.success) {
          showToast.success('Anda telah berhasil keluar dari akun Anda.');
        } else {
          // Even if logout failed on server, show success since user data is cleared
          showToast.success('Anda telah keluar dari akun Anda.');
        }
        
        // The handleLogout function already redirects to /login
        // so we don't need to call router.push('/login') here
      }
    } catch (error) {
      console.error('Logout error:', error);
      await Alert.error({
        title: 'Gagal Keluar',
        text: 'Terjadi kesalahan saat mencoba keluar. Silakan coba lagi.',
      });
    }
  };

  const handleProfileNavigation = (): void => {
    onProfileClick();
    setIsProfileOpen(false);
  };

  const handleSettingNavigation = (): void => {
    onSettingsClick();
    setIsProfileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-100 px-6 shadow-sm">
      <div className="flex items-center justify-between h-full">
        {/* Left side - Brand/Logo */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-emerald-600 sm:text-xl">WasteTrack</h1>
        </div>

        {/* Right side - User menu & notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative notification-menu">
            <button
              className="bg-white relative p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 py-2 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg w-64 sm:w-80">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-md font-semibold text-gray-700 sm:text-lg">Notifikasi</h3>
                </div>
                {notifications.map((notification) => (
                  <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm text-left font-medium text-gray-800">{notification.title}</p>
                    <p className="mt-1 text-left text-xs font-light text-gray-500">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative profile-menu">
            <button
              className="bg-white flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                <span className="font-medium text-emerald-600">
                  {userData?.profile?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 py-2 bg-white border border-gray-100 rounded-lg shadow-lg w-52 sm:w-72">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-md font-semibold text-gray-700 sm:text-lg">Akun Saya</p>
                </div>
                <button
                  onClick={handleProfileNavigation}
                  className="mt-2 flex items-center w-full bg-white gap-2 px-4 py-2 text-left hover:bg-gray-50"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Profile</span>
                </button>
                <button
                  onClick={handleSettingNavigation}
                  className="flex items-center w-full bg-white gap-2 px-4 py-2 text-left hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Pengaturan</span>
                </button>
                <div className="mt-2 border-t bg-white border-gray-100">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full gap-2 bg-white px-4 py-2 text-left text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;