// components/customer/BottomNavigation.tsx
import React from 'react';
import {
  Home,
  Camera,
  Calendar,
  ShoppingBag,
  Wallet,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isVisible?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  isVisible = true,
}) => {
  // Navigation items configuration
  const navItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Beranda' },
    { id: 'detect', icon: Camera, label: 'Deteksi' },
    { id: 'schedule', icon: Calendar, label: 'Setor' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Toko' },
    { id: 'history', icon: Wallet, label: 'Tabungan' },
  ];

  const handleNavigation = (tabId: string): void => {
    onTabChange(tabId);
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)]'>
      <div className='flex h-16 items-center justify-around'>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className={`flex min-w-[64px] flex-col items-center bg-white p-2 transition-colors
              ${
                activeTab === item.id
                  ? 'rounded-lg bg-emerald-50 text-emerald-500'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-emerald-400'
              }`}
          >
            <item.icon className='h-4 w-4 sm:h-5 sm:w-5' />
            <span className='mt-1 text-[11px]'>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
