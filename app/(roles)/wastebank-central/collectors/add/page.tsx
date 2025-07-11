'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Save, ChevronDown, User } from 'lucide-react';
import { createCollectorManagement } from '@/services/api/wastebank';
import { userListAPI } from '@/services/api/user/list';
import { getTokenManager } from '@/lib/token-manager';
import { CreateCollectorManagementRequest, CollectorStatus } from '@/types';
import { showToast } from '@/components/ui';

interface CollectorOption {
  id: string;
  username: string;
  email: string;
  institution?: string;
}

export default function AddCollectorPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [wasteBankId, setWasteBankId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [collectorId, setCollectorId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollector, setSelectedCollector] =
    useState<CollectorOption | null>(null);
  const [availableCollectors, setAvailableCollectors] = useState<
    CollectorOption[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [status, setStatus] = useState<CollectorStatus>('active');

  // Get waste bank ID from authenticated user
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const tokenManager = getTokenManager();
        if (!tokenManager.isAuthenticated()) {
          setError('Anda belum login. Silakan login terlebih dahulu.');
          setLoading(false);
          return;
        }
        const userData = tokenManager.getCurrentUser();
        if (!userData) {
          setError('Data pengguna tidak ditemukan. Silakan login kembali.');
          setLoading(false);
          return;
        }
        if (userData.role === 'waste_bank_central') {
          setWasteBankId(userData.id);
          await fetchAvailableCollectors(userData.institution);
        } else {
          setError('Akses ditolak. Anda bukan pengguna bank sampah pusat.');
          setLoading(false);
          return;
        }
      } catch {
        setError('Gagal mendapatkan profil pengguna. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch available collectors with same institution
  const fetchAvailableCollectors = async (institution?: string) => {
    if (!institution) return;
    try {
      setFetchingUsers(true);
      const response = await userListAPI.getUserList({
        page: 1,
        size: 100,
        institution,
      });
      let users: CollectorOption[] = [];
      let userList: unknown[] = [];
      if (Array.isArray(response)) {
        userList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        userList = response.data;
      } else if (response?.data?.users && Array.isArray(response.data.users)) {
        userList = response.data.users;
      }
      if (userList && Array.isArray(userList)) {
        users = userList
          .map((user) => {
            const u = user as CollectorOption & { role?: string };
            return {
              id: u.id,
              username: u.username || u.email || u.id || '-',
              email: u.email || '-',
              institution: u.institution || '',
              role: u.role || '',
            };
          })
          .filter((u) => u.role === 'waste_collector_central');
      }
      setAvailableCollectors(users);
    } catch {
      setError('Gagal memuat daftar user. Silakan coba lagi.');
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
    if (value === '') {
      setSelectedCollector(null);
      setCollectorId('');
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const getFilteredCollectors = () => {
    if (searchQuery.trim() === '') {
      return availableCollectors;
    }
    return availableCollectors.filter(
      (collector) =>
        (collector.username &&
          collector.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (collector.email &&
          collector.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (collector.id &&
          collector.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredCollectors = getFilteredCollectors();

  const handleCollectorSelect = (collector: CollectorOption) => {
    setSelectedCollector(collector);
    setSearchQuery(collector.username);
    setCollectorId(collector.id);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteBankId || !collectorId.trim()) {
      setError('Pilih kolektor pusat yang ingin ditambahkan.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const data: CreateCollectorManagementRequest = {
        waste_bank_id: wasteBankId,
        collector_id: collectorId.trim(),
        status: status,
      };
      await createCollectorManagement(data);
      showToast.success('Kolektor pusat berhasil ditambahkan!');
      router.push('/wastebank-central/collectors');
    } catch {
      setError(
        'Gagal menambahkan kolektor pusat. Pastikan kolektor belum terdaftar.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-gray-600'>Loading...</div>
          <div className='mt-2 text-sm text-gray-500'>Loading form data...</div>
        </div>
      </div>
    );
  }

  if (error && !wasteBankId) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-red-600'>{error}</div>
          <button
            onClick={() => router.push('/wastebank-central/collectors')}
            className='mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'
          >
            Kembali ke Daftar Kolektor Pusat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <UserPlus className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Tambah Kolektor Pusat Baru
            </h1>
            <p className='mt-1 text-gray-600'>
              Tambahkan kolektor pusat baru ke dalam tim bank sampah pusat Anda
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button
            onClick={() => router.back()}
            className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
          >
            <ArrowLeft size={20} className='mr-2 inline' />
            Kembali
          </button>
        </div>
      </div>

      {/* Form */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Show error message if any */}
          {error && (
            <div className='rounded-lg bg-red-50 p-4 text-red-700'>
              <p>{error}</p>
            </div>
          )}

          <div className='space-y-4'>
            <div className='relative' ref={dropdownRef}>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Pilih Kolektor Pusat <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Klik atau ketik untuk mencari kolektor pusat...'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleInputFocus}
                  onClick={() => setShowDropdown(true)}
                  autoComplete='off'
                />
                <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                  {fetchingUsers ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent'></div>
                  ) : (
                    <ChevronDown className='h-4 w-4 text-gray-400' />
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg'>
                    {fetchingUsers ? (
                      <div className='p-4 text-center'>
                        <div className='mx-auto h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent'></div>
                        <div className='mt-2 text-sm text-gray-500'>
                          Mencari kolektor pusat...
                        </div>
                      </div>
                    ) : filteredCollectors.length > 0 ? (
                      filteredCollectors.map((collector) => (
                        <div
                          key={collector.id}
                          className='flex cursor-pointer items-center px-3 py-2 hover:bg-gray-50'
                          onClick={() => handleCollectorSelect(collector)}
                        >
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100'>
                            <User className='h-4 w-4 text-emerald-600' />
                          </div>
                          <div className='ml-3 flex-1'>
                            <div className='text-sm font-medium text-gray-900'>
                              {collector.username}
                            </div>
                            <div className='text-xs text-gray-500'>
                              {collector.email}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='p-3'>
                        <div className='text-center text-sm text-gray-500'>
                          {availableCollectors.length === 0
                            ? 'Belum ada kolektor pusat dari institusi yang sama terdaftar di sistem'
                            : searchQuery.length > 0
                              ? `Tidak ada kolektor pusat ditemukan dengan kata kunci "${searchQuery}"`
                              : 'Klik untuk melihat daftar kolektor pusat yang tersedia'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected collector display */}
              {selectedCollector && (
                <div className='mt-2 flex items-center rounded-lg border border-emerald-200 bg-emerald-50 p-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100'>
                    <User className='h-4 w-4 text-emerald-600' />
                  </div>
                  <div className='ml-3 flex-1'>
                    <div className='text-sm font-medium text-emerald-900'>
                      {selectedCollector.username}
                    </div>
                    <div className='text-xs text-emerald-700'>
                      {selectedCollector.email}
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setSelectedCollector(null);
                      setSearchQuery('');
                      setCollectorId('');
                    }}
                    className='text-emerald-600 hover:text-emerald-800'
                  >
                    ×
                  </button>
                </div>
              )}

              <p className='mt-1 text-xs text-gray-500'>
                Cari kolektor pusat dari institusi yang sama yang terdaftar di
                sistem
                {availableCollectors.length > 0 && (
                  <span className='ml-1 text-emerald-600'>
                    ({availableCollectors.length} kolektor pusat tersedia)
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Status <span className='text-red-500'>*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CollectorStatus)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                required
              >
                <option value='active'>Aktif</option>
                <option value='inactive'>Tidak Aktif</option>
              </select>
              <p className='mt-1 text-xs text-gray-500'>
                Pilih status awal untuk kolektor pusat ini
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={() => router.back()}
              className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type='submit'
              disabled={submitting || !selectedCollector}
              className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50'
            >
              {submitting ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                  Menambahkan...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Tambah Kolektor Pusat
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
