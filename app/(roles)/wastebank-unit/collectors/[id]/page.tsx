'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Trash2,
  Award,
  Wallet,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  collectorProfileAPI,
  CollectorProfile,
} from '@/services/api/collector';
import { userListAPI } from '@/services/api/user/list';
import { UserListItem } from '@/types';
import { decodeId, generateHashId } from '@/lib/id-utils';

interface CollectorDetailData {
  profile: CollectorProfile;
  userInfo: UserListItem | null;
}

export default function CollectorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [collectorData, setCollectorData] =
    useState<CollectorDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollectorDetail = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch collector profile
      const profileResponse = await collectorProfileAPI.getProfile(userId);

      // Fetch additional user info from user list API
      const userListResponse = await userListAPI.getUserList({
        page: 1,
        size: 100, // Get a larger list to find our user
      });

      // Find the specific user in the list
      let userInfo = null;
      if (userListResponse.data?.users) {
        userInfo =
          userListResponse.data.users.find((user) => user.id === userId) ||
          null;
      }

      setCollectorData({
        profile: profileResponse.data,
        userInfo,
      });
    } catch (err) {
      console.error('Error fetching collector detail:', err);
      setError(
        err instanceof Error ? err.message : 'Gagal memuat detail kolektor'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      // Decode the obfuscated ID
      const realId = decodeId(params.id);
      if (realId) {
        fetchCollectorDetail(realId);
      } else {
        setError('ID kolektor tidak valid');
        setLoading(false);
      }
    }
  }, [params.id]);

  const handleBack = () => {
    router.push('/wastebank-unit/collectors');
  };

  // Loading state
  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>Memuat detail kolektor...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center gap-2 text-red-600'>
          <AlertCircle className='h-8 w-8' />
          <span>{error}</span>
          <button
            onClick={handleBack}
            className='mt-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200'
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!collectorData?.profile) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center text-gray-600'>
          <User className='mx-auto h-12 w-12 text-gray-400' />
          <p className='mt-2'>Data kolektor tidak ditemukan</p>
          <button
            onClick={handleBack}
            className='mt-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200'
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const { profile } = collectorData;
  const user = profile.user;
  const hashId = generateHashId(user.id);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={handleBack}
            className='flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-50'
          >
            <ArrowLeft className='h-5 w-5 text-gray-600' />
          </button>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <User className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Detail Kolektor Sampah
            </h1>
            <p className='mt-1 text-gray-600'>
              Informasi lengkap kolektor {hashId}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='my-6 grid grid-cols-1 gap-6 text-left md:grid-cols-3'>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Trash2 className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Sampah Terkumpul
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {profile.total_waste_weight || 0} kg
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Award className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Poin
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {user.points || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Wallet className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Saldo
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  Rp {user.balance?.toLocaleString('id-ID') || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='p-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Personal Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Personal
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>ID</p>
                    <p className='text-gray-900'>
                      {hashId || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Username
                    </p>
                    <p className='text-gray-900'>
                      {user.username || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Email</p>
                    <div className='flex items-center gap-2'>
                      <p className='text-gray-900'>
                        {user.email || 'Tidak tersedia'}
                      </p>
                      {user.is_email_verified ? (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      ) : (
                        <XCircle className='h-4 w-4 text-red-500' />
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Role</p>
                    <p className='text-gray-900'>
                      {user.role || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Telepon</p>
                    <p className='text-gray-900'>
                      {user.phone_number || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Alamat</p>
                    <p className='text-gray-900'>
                      {user.address || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Kota</p>
                    <p className='text-gray-900'>
                      {user.city || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Provinsi
                    </p>
                    <p className='text-gray-900'>
                      {user.province || 'Tidak tersedia'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Kinerja
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Bergabung
                    </p>
                    <p className='text-gray-900'>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            'id-ID',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'Tidak diketahui'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Terakhir Update
                    </p>
                    <p className='text-gray-900'>
                      {user.updated_at
                        ? new Date(user.updated_at).toLocaleDateString(
                            'id-ID',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'Belum pernah diperbarui'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
