'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronRight,
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
} from 'lucide-react';
import { SidebarProps, UserRole } from '@/types';
import { handleLogout } from '@/helpers/utils/logout/logout';
import Swal from 'sweetalert2';

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: initialCollapsed = false,
  onCollapse,
  role,
  userData,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getMenuItems = (role: UserRole) => {
    const menuConfigs = {
      waste_bank_unit: [
        {
          label: 'Dashboard',
          path: '/wastebank-unit',
          icon: <LayoutDashboard size={20} />,
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
          label: 'Transaksi Harian',
          path: '/wastebank-unit/transactions',
          icon: <CreditCard size={20} />,
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
          label: 'Transaksi Harian',
          path: '/wastebank-central/transactions',
          icon: <CreditCard size={20} />,
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
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          // const isActive = item.exact ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={index}
              href={item.path}
              className={`group flex items-center gap-3 rounded-lg p-3 transition-all
                ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                }
                ${isCollapsed ? 'justify-center' : ''}`}
            >
              {item.icon}
              {!isCollapsed && (
                <span className='text-sm font-medium transition-colors group-hover:text-emerald-600'>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
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
