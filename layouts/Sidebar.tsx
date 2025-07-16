'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  LogOut,
  Users,
  Loader2,
  LayoutDashboard,
  Wallet,
  CircleDollarSign,
  CreditCard,
  Warehouse,
  FileText,
  Truck,
  ShoppingCart,
  Package,
  ClipboardCheck,
  Route,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { SidebarProps, UserRole } from '@/types';
import { handleLogout } from '@/helpers/utils/logout/logout';
import Swal from 'sweetalert2';

// Extended MenuItem interface to support nested menus
interface MenuItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  exact?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: initialCollapsed = false,
  onCollapse,
  role,
  userData,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();

  const getMenuItems = (role: UserRole): MenuItem[] => {
    const menuConfigs: Record<UserRole, MenuItem[]> = {
      waste_bank_unit: [
        {
          label: 'Dashboard',
          path: '/wastebank-unit',
          icon: <LayoutDashboard size={20} />,
          exact: true,
        },
        {
          label: 'Manajemen Kolektor',
          path: '/wastebank-unit/collectors',
          icon: <Users size={20} />,
        },
        {
          label: 'Manajemen Harga',
          path: '/wastebank-unit/prices',
          icon: <CircleDollarSign size={20} />,
        },
        {
          label: 'Transaksi',
          icon: <CreditCard size={20} />,
          children: [
            {
              label: 'Transaksi Masuk',
              path: '/wastebank-unit/transactions/in',
              icon: <ArrowUpCircle size={18} />,
            },
            {
              label: 'Transaksi Keluar',
              path: '/wastebank-unit/transactions/out',
              icon: <ArrowDownCircle size={18} />,
            },
          ],
        },
        {
          label: 'Penyimpanan Gudang',
          path: '/wastebank-unit/warehouses',
          icon: <Warehouse size={20} />,
        },
        {
          label: 'Gaji',
          path: '/wastebank-unit/salaries',
          icon: <Wallet size={20} />,
        },
        {
          label: 'Permintaan Induk',
          path: '/wastebank-unit/requests',
          icon: <Truck size={20} />,
        },
        {
          label: 'Laporan Unit',
          path: '/wastebank-unit/reports',
          icon: <FileText size={20} />,
        },
      ],
      waste_collector_unit: [
        {
          label: 'Dashboard',
          path: '/collector-unit',
          icon: <LayoutDashboard size={20} />,
          exact: true,
        },
        {
          label: 'Tugas',
          path: '/collector-unit/tasks',
          icon: <ClipboardCheck size={20} />,
        },
        {
          label: 'Koleksi Harian',
          path: '/collector-unit/collections',
          icon: <Package size={20} />,
        },
        {
          label: 'Rute Unit',
          path: '/collector-unit/trips',
          icon: <Route size={20} />,
        },
      ],
      waste_bank_central: [
        {
          label: 'Dashboard',
          path: '/wastebank-central',
          icon: <LayoutDashboard size={20} />,
          exact: true,
        },
        {
          label: 'Manajemen Kolektor',
          path: '/wastebank-central/collectors',
          icon: <Users size={20} />,
        },
        {
          label: 'Manajemen Harga',
          path: '/wastebank-central/prices',
          icon: <CircleDollarSign size={20} />,
        },
        {
          label: 'Transaksi',
          icon: <CreditCard size={20} />,
          children: [
            {
              label: 'Transaksi Masuk',
              path: '/wastebank-central/transactions/in',
              icon: <ArrowUpCircle size={18} />,
            },
            {
              label: 'Transaksi Keluar',
              path: '/wastebank-central/transactions/out',
              icon: <ArrowDownCircle size={18} />,
            },
          ],
        },
        {
          label: 'Penyimpanan Gudang',
          path: '/wastebank-central/warehouses',
          icon: <Warehouse size={20} />,
        },
        {
          label: 'Gaji',
          path: '/wastebank-central/salaries',
          icon: <Wallet size={20} />,
        },
        {
          label: 'Permintaan Offtaker',
          path: '/wastebank-central/requests',
          icon: <Truck size={20} />,
        },
        {
          label: 'Laporan Unit',
          path: '/wastebank-central/reports',
          icon: <FileText size={20} />,
        },
      ],
      waste_collector_central: [
        {
          label: 'Dashboard',
          path: '/collector-central',
          icon: <LayoutDashboard size={20} />,
          exact: true,
        },
        {
          label: 'Tugas',
          path: '/collector-central/tasks',
          icon: <ClipboardCheck size={20} />,
        },
        {
          label: 'Koleksi Harian',
          path: '/collector-central/collections',
          icon: <Package size={20} />,
        },
        {
          label: 'Rute Unit',
          path: '/collector-central/trips',
          icon: <Route size={20} />,
        },
      ],
      industry: [
        {
          label: 'Dashboard',
          path: '/offtaker',
          icon: <LayoutDashboard size={20} />,
          exact: true,
        },
        {
          label: 'Transaksi',
          path: '/offtaker/transactions',
          icon: <ShoppingCart size={20} />,
        },
        {
          label: 'Pembayaran',
          path: '/offtaker/payments',
          icon: <CreditCard size={20} />,
        },
        {
          label: 'Laporan',
          path: '/offtaker/reports',
          icon: <FileText size={20} />,
        },
      ],
    };
    return menuConfigs[role] || [];
  };

  const menuItems = getMenuItems(role);

  // Auto-expand parent menu if child is active
  useEffect(() => {
    const newExpanded = new Set(expandedMenus);
    let hasChanges = false;

    menuItems.forEach((item) => {
      if (item.children && hasActiveChild(item.children)) {
        if (!newExpanded.has(item.label)) {
          newExpanded.add(item.label);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setExpandedMenus(newExpanded);
    }
  }, [pathname]);

  // Toggle expanded menu
  const toggleMenu = (menuLabel: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuLabel)) {
      newExpanded.delete(menuLabel);
    } else {
      newExpanded.add(menuLabel);
    }
    setExpandedMenus(newExpanded);
  };

  // Check if menu item is active
  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path) {
      if (item.exact) {
        return pathname === item.path;
      } else {
        // Untuk non-exact match, pastikan tidak ada konflik dengan path yang lebih spesifik
        // Contoh: '/wastebank-unit' tidak boleh active saat di '/wastebank-unit/collectors'
        const isExactMatch = pathname === item.path;
        const isStartMatch = pathname.startsWith(item.path + '/');
        return isExactMatch || isStartMatch;
      }
    }
    if (item.children) {
      return item.children.some((child) => isMenuActive(child));
    }
    return false;
  };

  // Check if any child is active
  const hasActiveChild = (children: MenuItem[]): boolean => {
    return children.some((child) => isMenuActive(child));
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem, index: number, level: number = 0) => {
    const isActive = isMenuActive(item);
    const isExpanded = expandedMenus.has(item.label);
    const hasChildren = item.children && item.children.length > 0;

    // If it has children, render expandable menu
    if (hasChildren) {
      return (
        <div key={`${item.label}-${index}`}>
          <button
            onClick={() => !isCollapsed && toggleMenu(item.label)}
            className={`group flex w-full items-center gap-3 rounded-lg p-3 transition-all
              ${
                isActive || hasActiveChild(item.children!)
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }
              ${isCollapsed ? 'justify-center' : ''}
              ${level > 0 ? 'ml-4' : ''}`}
          >
            {item.icon}
            {!isCollapsed && (
              <>
                <span className='flex-1 text-left text-sm font-medium transition-colors group-hover:text-emerald-600'>
                  {item.label}
                </span>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>

          {/* Submenu */}
          {!isCollapsed && isExpanded && (
            <div className='ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-200'>
              {item.children!.map((child, childIndex) =>
                renderMenuItem(child, childIndex, level + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    // Regular menu item with link
    return (
      <Link
        key={`${item.label}-${index}`}
        href={item.path!}
        className={`group flex items-center gap-3 rounded-lg p-3 transition-all
          ${
            isActive
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
          }
          ${isCollapsed ? 'justify-center' : ''}
          ${level > 0 ? 'ml-4' : ''}`}
      >
        {item.icon}
        {!isCollapsed && (
          <span className='text-sm font-medium transition-colors group-hover:text-emerald-600'>
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  const handleLogoutClick = async () => {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Tidak',
        customClass: {
          popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
          title: 'text-xl sm:text-2xl font-semibold text-gray-800',
          htmlContainer: 'text-sm sm:text-base text-gray-600',
          confirmButton: 'text-sm sm:text-base',
          cancelButton: 'text-sm sm:text-base',
        },
        padding: '1em',
        heightAuto: false,
        scrollbarPadding: false,
      });

      if (result.isConfirmed) {
        setIsLoggingOut(true);

        const logoutResult = await handleLogout(router);

        if (logoutResult.success) {
          await Swal.fire({
            title: 'Berhasil Keluar',
            text: 'Anda telah berhasil keluar dari akun Anda.',
            icon: 'success',
            confirmButtonColor: '#10B981',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            customClass: {
              popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
              title: 'text-xl sm:text-2xl font-semibold text-gray-800',
            },
            padding: '1em',
            heightAuto: false,
            scrollbarPadding: false,
          });
        } else {
          throw new Error(logoutResult.message);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
      Swal.fire({
        title: 'Logout Failed',
        text: 'An error occurred while logging out. Please try again.',
        icon: 'error',
        confirmButtonColor: '#10B981',
        customClass: {
          popup: 'rounded-lg',
        },
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getProfilePath = (role: UserRole) => {
    const pathMap: Record<UserRole, string> = {
      waste_bank_unit: '/wastebank-unit',
      waste_collector_unit: '/collector-unit',
      waste_bank_central: '/wastebank-central',
      waste_collector_central: '/collector-central',
      industry: '/offtaker',
    };
    return pathMap[role] || `/${role}`;
  };

  return (
    <aside
      className={`border-r border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'} fixed left-0 top-0 h-screen`}
    >
      {/* Logo Section */}
      <div className='flex h-16 items-center justify-between border-b border-gray-200 px-4'>
        {!isCollapsed && (
          <div className='flex items-center'>
            <Image
              src='/icons/web-logo.svg'
              alt='WasteTrack Logo'
              width={40}
              height={40}
              className='mr-2'
            />
            <span className='text-md font-semibold text-emerald-600'>
              WasteTrack
            </span>
          </div>
        )}
        <button
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            if (onCollapse) {
              onCollapse(!isCollapsed);
            }
          }}
          className='rounded-lg p-2 transition-colors hover:bg-gray-100'
        >
          <ChevronRight
            size={20}
            className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className='space-y-2 p-4'>
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </nav>

      {/* Profile & Logout Section */}
      <div className='absolute bottom-4 left-0 right-0 px-4'>
        <Link
          href={`${getProfilePath(role)}/profile`}
          className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3
            ${
              pathname.includes('/profile')
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
            }
            transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          {!isCollapsed ? (
            <>
              {/* Avatar */}
              <div className='flex-shrink-0'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-semibold text-white'>
                  {userData?.profile?.institution
                    ? userData.profile.institution.substring(0, 2).toUpperCase()
                    : '?'}
                </div>
              </div>

              {/* User Info */}
              <div className='min-w-0 flex-1 text-left'>
                <div className='truncate text-sm font-medium text-gray-900'>
                  {userData?.profile?.institution ||
                    userData?.profile?.institutionName ||
                    'Institution'}
                </div>
                <div className='truncate text-xs text-gray-500'>
                  {userData?.email || 'user@email.com'}
                </div>
              </div>
            </>
          ) : (
            <Users
              size={20}
              className={
                pathname.includes('/profile') ? 'text-emerald-600' : ''
              }
            />
          )}
        </Link>

        <button
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className={`flex w-full items-center gap-3 rounded-lg p-3
            text-gray-600 transition-all hover:bg-red-50 
            hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isLoggingOut ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <LogOut size={20} />
          )}
          {!isCollapsed && (
            <span className='text-sm font-medium'>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
