'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { handleLogout } from '@/helpers/utils/logout/logout';

export const LogoutButton: React.FC = () => {
  const router = useRouter();

  const onLogoutClick = async () => {
    try {
      await handleLogout(router);
    } catch (error) {
      console.error('Failed to logout:', error);
      // You can add toast notification here
    }
  };

  return (
    <button
      onClick={onLogoutClick}
      className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
    >
      Logout
    </button>
  );
};

export default LogoutButton;
