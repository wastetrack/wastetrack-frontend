'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';
import { createCollectorManagement } from '@/services/api/wastebank';
import { getTokenManager } from '@/lib/token-manager';
import { CreateCollectorManagementRequest, CollectorStatus } from '@/types';
import { showToast } from '@/components/ui';

export default function AddCollectorPage() {
  const router = useRouter();
  const [wasteBankId, setWasteBankId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [collectorId, setCollectorId] = useState('');
  const [status, setStatus] = useState<CollectorStatus>('active');

  // Get waste bank ID from authenticated user
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const tokenManager = getTokenManager();

        // Check if user is authenticated
        if (!tokenManager.isAuthenticated()) {
          setError('Anda belum login. Silakan login terlebih dahulu.');
          setLoading(false);
          return;
        }

        // Get user data from token manager
        const userData = tokenManager.getCurrentUser();
        if (!userData) {
          setError('Data pengguna tidak ditemukan. Silakan login kembali.');
          setLoading(false);
          return;
        }

        // For waste bank users, the user ID should be the waste bank ID
        if (userData.role === 'waste_bank_unit') {
          setWasteBankId(userData.id);
        } else {
          setError('Akses ditolak. Anda bukan pengguna bank sampah.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to get user profile:', err);
        setError('Gagal mendapatkan profil pengguna. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wasteBankId || !collectorId.trim()) {
      setError('ID kolektor harus diisi.');
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

      // Show success message
      showToast.success('Kolektor berhasil ditambahkan!');

      // Redirect back to collectors list
      router.push('/wastebank-unit/collectors');
    } catch (err) {
      console.error('Failed to add collector:', err);
      setError('Gagal menambahkan kolektor. Pastikan ID kolektor valid.');
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
            onClick={() => router.push('/wastebank-unit/collectors')}
            className='mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'
          >
            Kembali ke Daftar Kolektor
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
              Tambah Kolektor Baru
            </h1>
            <p className='mt-1 text-gray-600'>
              Tambahkan kolektor baru ke dalam tim bank sampah Anda
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
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                ID Kolektor <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                placeholder='Masukkan ID kolektor'
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                value={collectorId}
                onChange={(e) => setCollectorId(e.target.value)}
                required
              />
              <p className='mt-1 text-xs text-gray-500'>
                Masukkan ID pengguna dengan peran kolektor yang ingin
                ditambahkan
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
                Pilih status awal untuk kolektor ini
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
              disabled={submitting || !collectorId.trim()}
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
                  Tambah Kolektor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
