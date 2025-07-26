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
  onSettingsClick,
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
        title: 'Selamat Datang!',
        message: 'Terima kasih telah menggunakan WasteTrack.',
        type: 'info',
      },
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
    <header className='fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-100 bg-white px-6 shadow-sm'>
      <div className='flex h-full items-center justify-between'>
        {/* Left side - Brand/Logo */}
        <div className='flex items-center gap-3'>
          <h1 className='text-lg font-bold text-emerald-600 sm:text-xl'>
            WasteTrack
          </h1>
        </div>

        {/* Right side - User menu & notifications */}
        <div className='flex items-center gap-2 sm:gap-4'>
          {/* Notifications */}
          <div className='notification-menu relative'>
            <button
              className='relative rounded-lg bg-white p-2 hover:bg-gray-100'
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className='h-5 w-5 text-gray-600' />
              {notifications.length > 0 && (
                <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationOpen && (
              <div className='w-68 absolute right-0 mt-2 rounded-lg border border-gray-100 bg-white py-2 shadow-lg sm:w-80'>
                <div className='border-b border-gray-100 px-4 py-2'>
                  <h3 className='text-md font-semibold text-gray-700 sm:text-lg'>
                    Notifikasi
                  </h3>
                </div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className='px-4 py-3 hover:bg-gray-50'
                  >
                    <p className='text-left text-sm font-medium text-gray-800'>
                      {notification.title}
                    </p>
                    <p className='mt-1 text-left text-xs font-light text-gray-500'>
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className='profile-menu relative'>
            <button
              className='flex items-center gap-2 rounded-lg bg-white p-2 hover:bg-gray-100'
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100'>
                <span className='font-medium text-emerald-600'>
                  {userData?.profile?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className='absolute right-0 w-60 rounded-lg border border-gray-100 bg-white py-2 shadow-lg sm:w-72'>
                <div className='border-b border-gray-100 px-4 py-2'>
                  <p className='text-md font-semibold text-gray-700 sm:text-lg'>
                    Akun Saya
                  </p>
                </div>
                <button
                  onClick={handleProfileNavigation}
                  className='mt-2 flex w-full items-center gap-2 bg-white px-4 py-2 text-left hover:bg-gray-50'
                >
                  <User className='h-4 w-4 text-gray-600' />
                  <span className='text-sm text-gray-700'>Profile</span>
                </button>
                <button
                  onClick={handleSettingNavigation}
                  className='flex hidden w-full items-center gap-2 bg-white px-4 py-2 text-left hover:bg-gray-50'
                >
                  <Settings className='h-4 w-4 text-gray-600' />
                  <span className='text-sm text-gray-700'>Pengaturan</span>
                </button>
                <div className='mt-2 border-t border-gray-100 bg-white'>
                  <button
                    onClick={handleSignOut}
                    className='flex w-full items-center gap-2 bg-white px-4 py-2 text-left text-red-600 hover:bg-gray-50'
                  >
                    <LogOut className='h-4 w-4' />
                    <span className='text-sm'>Keluar</span>
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
