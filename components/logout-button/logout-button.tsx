'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { handleLogout } from '../../services/functions/logout-function/logout-function';

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
      className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
