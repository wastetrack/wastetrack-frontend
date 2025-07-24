'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  CircleDollarSign,
  Calendar,
  DollarSign,
  CheckCircle,
  Package,
} from 'lucide-react';
import {
  currentUserAPI,
  wasteTypeAPI,
  wasteCategoryAPI,
  wasteTransferRequestAPI,
  wasteTransferItemOfferingsAPI,
} from '@/services/api/user';
import { decodeId, generateHashId } from '@/lib/id-utils';
import type {
  WasteTransferRequest,
  WasteTransferItemOffering,
  WasteType,
  WasteCategory,
} from '@/types';

interface WasteItemWithDetails extends WasteTransferItemOffering {
  wasteType?: WasteType;
  wasteCategory?: WasteCategory;
}

export default function TransactionOutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id: encodedId } = params as { id: string };
  const [transaction, setTransaction] = useState<WasteTransferRequest | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setUserId] = useState<string | null>(null);
  const [wasteItems, setWasteItems] = useState<WasteItemWithDetails[]>([]);
  const [wasteItemsLoading, setWasteItemsLoading] = useState(false);
  const [wasteTypesMap, setWasteTypesMap] = useState<{
    [key: string]: WasteType;
  }>({});
  const [wasteCategoriesMap, setWasteCategoriesMap] = useState<{
    [key: string]: WasteCategory;
  }>({});
  const [destinationUserName, setDestinationUserName] = useState<string>('-');
  // const [destinationPhone, setDestinationPhone] = useState<string>('-');
  const [destinationLocation, setDestinationLocation] = useState<string>('-');

  // Decode ID
  const realId = decodeId(encodedId);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current user id
        const uid = await currentUserAPI.getUserId();
        setUserId(uid);

        // Fetch transaction detail
        if (!realId) {
          setError('ID transaksi tidak valid.');
          setTransaction(null);
          return;
        }

        const response =
          await wasteTransferRequestAPI.getWasteTransferRequestById(realId);

        const institution = response.data.destination_user.institution;
        // const destinationPhone = response.data.destination_user.phone_number;
        const destinationLocation = [
          response.data.source_user.address,
          response.data.source_user.city,
          response.data.source_user.province,
        ]
          .filter(Boolean)
          .join(', ');

        if (!response.data || response.data.source_user_id !== uid) {
          setError(
            'Transaksi tidak ditemukan atau Anda tidak berhak mengakses.'
          );
          setTransaction(null);
        } else {
          setTransaction(response.data);
          // setDestinationPhone(destinationPhone || '-');
          setDestinationLocation(destinationLocation || '-');
          setDestinationUserName(institution || 'Tidak diketahui');
          await fetchWasteItems(response.data.id);
        }
      } catch (error) {
        console.error('Error fetching transaction detail:', error);
        setError('Gagal memuat detail transaksi.');
        setTransaction(null);
      } finally {
        setLoading(false);
      }
    };

    if (realId) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realId]);

  const fetchWasteItems = async (transferFormId: string) => {
    setWasteItemsLoading(true);
    try {
      // Fetch all item offerings for this transfer form
      const itemsResponse =
        await wasteTransferItemOfferingsAPI.getOfferingsByTransferForm(
          transferFormId,
          { page: 1, size: 100 }
        );

      const items = itemsResponse.data;
      setWasteItems(items);

      // Get unique waste type IDs from the items
      const wasteTypeIds = [
        ...new Set(items.map((item) => item.waste_type_id)),
      ].filter(Boolean);

      if (wasteTypeIds.length > 0) {
        // Fetch waste types details one by one and build the map
        const wasteTypePromises = wasteTypeIds.map(async (id) => {
          try {
            const res = await wasteTypeAPI.getWasteTypeById(id);
            return { id, data: res.data };
          } catch (error) {
            console.error(`Failed to fetch waste type ${id}:`, error);
            return {
              id,
              data: {
                id,
                category_id: '',
                name: 'Unknown Type',
                description: '',
              },
            };
          }
        });

        const wasteTypeResults = await Promise.all(wasteTypePromises);

        const wasteTypesData = wasteTypeResults.reduce(
          (acc, result) => {
            acc[result.id] = result.data;
            return acc;
          },
          {} as Record<string, WasteType>
        );

        setWasteTypesMap(wasteTypesData);

        // Get category IDs from waste types
        const categoryIds = [
          ...new Set(
            Object.values(wasteTypesData)
              .map((wt) => wt.category_id)
              .filter(Boolean)
          ),
        ];

        if (categoryIds.length > 0) {
          // Fetch waste categories details one by one and build the map
          const categoryPromises = categoryIds.map(async (id) => {
            try {
              const res = await wasteCategoryAPI.getWasteCategoryById(id);
              return { id, data: res.data };
            } catch (error) {
              console.error(`Failed to fetch waste category ${id}:`, error);
              return {
                id,
                data: {
                  id,
                  name: 'Unknown Category',
                  description: '',
                },
              };
            }
          });

          const categoryResults = await Promise.all(categoryPromises);

          const categoriesData = categoryResults.reduce(
            (acc, result) => {
              acc[result.id] = result.data;
              return acc;
            },
            {} as Record<string, WasteCategory>
          );

          setWasteCategoriesMap(categoriesData);
        }
      }
    } catch (error) {
      console.error('Error fetching waste items:', error);
      setWasteItems([]);
    } finally {
      setWasteItemsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Format status for display
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'text-yellow-600 bg-yellow-50' },
      assigned: { text: 'Ditugaskan', color: 'text-blue-600 bg-blue-50' },
      collecting: {
        text: 'Pengambilan',
        color: 'text-purple-600 bg-purple-50',
      },
      completed: { text: 'Selesai', color: 'text-green-600 bg-green-50' },
      cancelled: { text: 'Dibatalkan', color: 'text-red-600 bg-red-50' },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        text: status,
        color: 'text-gray-600 bg-gray-50',
      }
    );
  };

  // Format time display (remove timezone and show only HH:MM)
  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return timeString.replace(/\+\d{2}:\d{2}$/, '').substring(0, 5);
  };

  // Calculate total price from waste items
  const calculateTotalPrice = () => {
    return wasteItems.reduce((total, item) => {
      return total + item.accepted_weight * item.accepted_price_per_kgs;
    }, 0);
  };

  // Calculate total accepted weight
  const calculateTotalAcceptedWeight = () => {
    return wasteItems.reduce((total, item) => {
      return total + item.accepted_weight;
    }, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>Memuat detail transaksi...</span>
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
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!transaction) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center text-gray-600'>
          <CircleDollarSign className='mx-auto h-12 w-12 text-gray-400' />
          <p className='mt-2'>Data transaksi tidak ditemukan</p>
          <button
            onClick={handleBack}
            className='mt-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200'
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusDisplay(transaction.status);
  const hashId = generateHashId(transaction.id);
  const totalPrice = calculateTotalPrice();
  const totalAcceptedWeight = calculateTotalAcceptedWeight();

  return (
    <div className='space-y-6 font-poppins'>
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
            <CircleDollarSign className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Detail Transaksi Keluar
            </h1>
            <p className='mt-1 text-gray-600'>
              Informasi lengkap transaksi {hashId}
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
                <DollarSign className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Harga
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  Rp{' '}
                  {(transaction.status === 'completed'
                    ? transaction.total_price
                    : totalPrice
                  ).toLocaleString('id-ID')}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <CheckCircle className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Status
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                    <span className={`inline-flex rounded-full px-2 text-sm ${status.color}`}>
                    {status.text}
                    </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Calendar className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Tanggal Janji
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                    {transaction.appointment_date
                    ? new Date(transaction.appointment_date).toLocaleDateString(
                      'id-ID',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                      )
                    : '-'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Transaction Card */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='p-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Transaction Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Transaksi
              </h3>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    ID Transaksi
                  </p>
                  <p className='text-gray-900'>{hashId || 'Tidak tersedia'}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Tipe Tujuan
                  </p>
                  <div className='mt-1'>
                    {transaction.form_type === 'industry_request'
                      ? 'Industri'
                      : transaction.form_type === 'waste_bank_request'
                        ? 'Bank Sampah'
                        : transaction.form_type}
                  </div>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Nama Tujuan
                  </p>
                  <p className='text-gray-900'>{destinationUserName}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Telp. Tujuan
                  </p>
                  <p className='text-gray-900'>
                    {/* {destinationPhone} */}
                    {transaction.destination_phone_number || '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Status</p>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs ${status.color}`}
                  >
                    {status.text}
                  </span>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Total Harga
                  </p>
                  <p className='text-lg font-bold text-emerald-600'>
                    Rp{' '}
                    {(transaction.status === 'completed'
                      ? transaction.total_price
                      : totalPrice
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Janji Temu
              </h3>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Tanggal</p>
                  <p className='text-gray-900'>
                    {transaction.appointment_date
                      ? new Date(
                          transaction.appointment_date
                        ).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Waktu</p>
                  <p className='text-gray-900'>
                    {formatTime(transaction.appointment_start_time)} -{' '}
                    {formatTime(transaction.appointment_end_time)}
                  </p>
                </div>
                {transaction.appointment_location && (
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Lokasi</p>
                    <p className='text-gray-900'>{destinationLocation}</p>
                  </div>
                )}
                <div>
                  <p className='text-sm font-medium text-gray-500'>Dibuat</p>
                  <p className='text-gray-900'>
                    {transaction.created_at
                      ? new Date(transaction.created_at).toLocaleDateString(
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
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Terakhir Update
                  </p>
                  <p className='text-gray-900'>
                    {transaction.updated_at
                      ? new Date(transaction.updated_at).toLocaleDateString(
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

      {/* Waste Items Information */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='p-6'>
          <div className='mb-6 flex items-center gap-3'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Informasi Sampah
            </h3>
          </div>

          {wasteItemsLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='flex items-center gap-2 text-gray-600'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>Memuat informasi sampah...</span>
              </div>
            </div>
          ) : wasteItems.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              <Package className='mx-auto h-12 w-12 text-gray-300' />
              <p className='mt-2'>Tidak ada item sampah ditemukan</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {wasteItems.map((item, index) => (
                <div
                  key={item.id}
                  className='rounded-lg border border-gray-200 bg-gray-50 p-4'
                >
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Informasi Tipe Sampah */}
                    <div>
                      <h4 className='mb-2 font-medium text-gray-900'>
                        Item #{index + 1}
                      </h4>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Tipe Sampah
                          </p>
                          <p className='text-gray-900'>
                            {wasteTypesMap[item.waste_type_id]?.name ||
                              'Tidak diketahui'}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Kategori
                          </p>
                          <p className='text-gray-900'>
                            {wasteTypesMap[item.waste_type_id]?.category_id
                              ? wasteCategoriesMap[
                                  wasteTypesMap[item.waste_type_id].category_id
                                ]?.name || 'Tidak diketahui'
                              : 'Tidak diketahui'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Kuantitas & Berat */}
                    <div>
                      <h4 className='mb-2 font-medium text-gray-900'>
                        Kuantitas & Berat
                      </h4>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Berat Ditawarkan
                          </p>
                          <p className='text-gray-900'>
                            {item.offering_weight.toLocaleString('id-ID', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{' '}
                            kg
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Berat Diterima (Tujuan)
                          </p>
                          <p className='text-gray-900'>
                            {transaction.status === 'completed'
                              ? item.verified_weight > 0
                                ? `${item.verified_weight.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`
                                : 'Belum diverifikasi'
                              : item.accepted_weight > 0
                                ? `${item.accepted_weight.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`
                                : 'Belum diterima'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Harga */}
                    <div>
                      <h4 className='mb-2 font-medium text-gray-900'>
                        Informasi Harga
                      </h4>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Harga Ditawarkan per Kg
                          </p>
                          <p className='text-gray-900'>
                            Rp{' '}
                            {item.offering_price_per_kgs.toLocaleString(
                              'id-ID'
                            )}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Harga Diterima per Kg (Tujuan)
                          </p>
                          <p className='text-gray-900'>
                            {item.accepted_price_per_kgs > 0
                              ? `Rp ${item.accepted_price_per_kgs.toLocaleString('id-ID')}`
                              : 'Belum ditentukan'}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Subtotal
                          </p>
                          <p className='font-medium text-emerald-600'>
                            Rp{' '}
                            {(transaction.status === 'completed'
                              ? Math.floor(
                                  item.verified_weight *
                                    item.accepted_price_per_kgs
                                )
                              : Math.floor(
                                  item.accepted_weight *
                                    item.accepted_price_per_kgs
                                )
                            ).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {transaction.notes && (
                <div className='border-y border-gray-200 py-4'>
                  <p className='mb-1 text-sm font-medium text-gray-500'>
                    Catatan
                  </p>
                  <p className='text-sm text-gray-700'>{transaction.notes}</p>
                </div>
              )}

              {/* Summary */}
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium text-emerald-800'>
                      Total Item Sampah
                    </p>
                    <p className='text-sm text-emerald-600'>
                      {wasteItems.length} jenis sampah
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-emerald-800'>
                      Total Berat Diterima
                    </p>
                    <p className='text-sm text-emerald-600'>
                      {(() => {
                        const value =
                          transaction.status === 'completed'
                            ? wasteItems.reduce((total, item) => total + item.verified_weight, 0)
                            : totalAcceptedWeight;
                        const formatted = value % 1 === 0
                          ? value.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
                          : value.toFixed(2).replace('.', ',');
                        return formatted;
                      })()}{' '}
                      kg
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-emerald-800'>Total Nilai</p>
                    <p className='text-lg font-bold text-emerald-700'>
                      Rp{' '}
                      {(transaction.status === 'completed'
                        ? transaction.total_price
                        : totalPrice
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
