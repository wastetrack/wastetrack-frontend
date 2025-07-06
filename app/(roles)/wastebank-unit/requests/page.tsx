'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  MapPin,
  Clock,
  Phone,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
} from 'lucide-react';

interface PickupRequest {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  address: string;
  wasteTypes: string[];
  estimatedWeight: number;
  requestDate: string;
  preferredPickupDate: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  collectorId?: number;
  collectorName?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Mock data - replace with actual API call
  const pickupRequests: PickupRequest[] = [
    {
      id: 1,
      customerId: 201,
      customerName: 'PT. Indofood Sukses Makmur',
      customerPhone: '+62812-3456-7890',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      wasteTypes: ['Plastik', 'Kardus'],
      estimatedWeight: 150,
      requestDate: '2025-01-06',
      preferredPickupDate: '2025-01-08',
      status: 'pending',
      priority: 'high',
      notes: 'Sampah sudah dipilah, akses mudah',
    },
    {
      id: 2,
      customerId: 202,
      customerName: 'Toko Sinar Jaya',
      customerPhone: '+62813-9876-5432',
      address: 'Jl. Diponegoro No. 45, Surabaya',
      wasteTypes: ['Kertas', 'Plastik'],
      estimatedWeight: 75,
      requestDate: '2025-01-05',
      preferredPickupDate: '2025-01-07',
      status: 'assigned',
      collectorId: 101,
      collectorName: 'Ahmad Subandi',
      priority: 'medium',
    },
    {
      id: 3,
      customerId: 203,
      customerName: 'CV. Maju Bersama',
      customerPhone: '+62814-5555-1234',
      address: 'Jl. Pahlawan No. 78, Malang',
      wasteTypes: ['Logam', 'Plastik'],
      estimatedWeight: 200,
      requestDate: '2025-01-04',
      preferredPickupDate: '2025-01-06',
      status: 'in_progress',
      collectorId: 102,
      collectorName: 'Siti Rahayu',
      priority: 'high',
    },
    {
      id: 4,
      customerId: 204,
      customerName: 'Restoran Padang Sederhana',
      customerPhone: '+62815-7777-8888',
      address: 'Jl. Gatot Subroto No. 12, Jakarta',
      wasteTypes: ['Plastik'],
      estimatedWeight: 30,
      requestDate: '2025-01-03',
      preferredPickupDate: '2025-01-05',
      status: 'completed',
      collectorId: 103,
      collectorName: 'Bambang Wijaya',
      priority: 'low',
    },
    {
      id: 5,
      customerId: 205,
      customerName: 'Hotel Grand Indonesia',
      customerPhone: '+62816-9999-0000',
      address: 'Jl. MH Thamrin No. 1, Jakarta Pusat',
      wasteTypes: ['Kertas', 'Plastik', 'Logam'],
      estimatedWeight: 300,
      requestDate: '2025-01-02',
      preferredPickupDate: '2025-01-04',
      status: 'cancelled',
      priority: 'medium',
      notes: 'Dibatalkan karena akses terbatas',
    },
  ];

  const filteredRequests = pickupRequests.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.wasteTypes.some((type) =>
        type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;
    const matchesPriority =
      selectedPriority === 'all' || item.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: PickupRequest['status']) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Menunggu',
        icon: AlertCircle,
      },
      assigned: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Ditugaskan',
        icon: Users,
      },
      in_progress: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Berlangsung',
        icon: Clock,
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Selesai',
        icon: CheckCircle,
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Dibatalkan',
        icon: XCircle,
      },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      >
        <IconComponent className='mr-1 h-3 w-3' />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    const priorityConfig = {
      low: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Rendah' },
      medium: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Sedang' },
      high: { bg: 'bg-red-100', text: 'text-red-800', label: 'Tinggi' },
    };

    const config = priorityConfig[priority];
    return (
      <span
        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate statistics
  const pendingRequests = pickupRequests.filter(
    (item) => item.status === 'pending'
  ).length;
  const inProgressRequests = pickupRequests.filter(
    (item) => item.status === 'in_progress'
  ).length;
  const completedRequests = pickupRequests.filter(
    (item) => item.status === 'completed'
  ).length;
  const totalWeight = pickupRequests
    .filter((item) => item.status === 'completed')
    .reduce((sum, item) => sum + item.estimatedWeight, 0);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Permintaan Pengambilan
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola permintaan pengambilan sampah dari nasabah
          </p>
        </div>
        <button className='flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-emerald-700'>
          <Plus className='h-4 w-4' />
          <span>Tambah Permintaan</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-yellow-100 p-2'>
              <AlertCircle className='h-6 w-6 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Menunggu</p>
              <p className='text-2xl font-bold text-gray-900'>
                {pendingRequests}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-purple-100 p-2'>
              <Clock className='h-6 w-6 text-purple-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Berlangsung</p>
              <p className='text-2xl font-bold text-gray-900'>
                {inProgressRequests}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-green-100 p-2'>
              <CheckCircle className='h-6 w-6 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Selesai</p>
              <p className='text-2xl font-bold text-gray-900'>
                {completedRequests}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-emerald-100 p-2'>
              <Package className='h-6 w-6 text-emerald-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Terkumpul
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalWeight} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='rounded-lg border border-gray-200 bg-white p-6'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          {/* Search */}
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <input
              type='text'
              placeholder='Cari nama nasabah, alamat, atau jenis sampah...'
              className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className='rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value='all'>Semua Status</option>
            <option value='pending'>Menunggu</option>
            <option value='assigned'>Ditugaskan</option>
            <option value='in_progress'>Berlangsung</option>
            <option value='completed'>Selesai</option>
            <option value='cancelled'>Dibatalkan</option>
          </select>

          {/* Priority Filter */}
          <select
            className='rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value='all'>Semua Prioritas</option>
            <option value='high'>Tinggi</option>
            <option value='medium'>Sedang</option>
            <option value='low'>Rendah</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Nasabah
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Lokasi
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jenis Sampah
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Estimasi Berat
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Tanggal Diinginkan
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Prioritas
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Kolektor
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {filteredRequests.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {item.customerName}
                    </div>
                    <div className='flex items-center text-sm text-gray-500'>
                      <Phone className='mr-1 h-3 w-3' />
                      {item.customerPhone}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-start text-sm text-gray-900'>
                      <MapPin className='mr-1 mt-0.5 h-3 w-3 flex-shrink-0' />
                      <span className='max-w-xs truncate'>{item.address}</span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-wrap gap-1'>
                      {item.wasteTypes.map((type, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800'
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {item.estimatedWeight} kg
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {formatDate(item.preferredPickupDate)}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    {getPriorityBadge(item.priority)}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    {getStatusBadge(item.status)}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {item.collectorName || '-'}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-right'>
                    <div className='flex items-center justify-end space-x-2'>
                      <button
                        className='p-1 text-blue-600 hover:text-blue-900'
                        title='Lihat Detail'
                      >
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        className='p-1 text-emerald-600 hover:text-emerald-900'
                        title='Kelola'
                      >
                        <Package className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className='py-12 text-center'>
            <Package className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              Tidak ada data
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {searchTerm ||
              selectedStatus !== 'all' ||
              selectedPriority !== 'all'
                ? 'Tidak ada permintaan yang sesuai dengan filter.'
                : 'Belum ada permintaan pengambilan yang diterima.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
