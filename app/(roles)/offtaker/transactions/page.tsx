'use client';

import { useState } from 'react';

type TransactionStatus = 'completed' | 'pending' | 'cancelled';

interface Transaction {
  id: string;
  date: string;
  supplier: string;
  wasteType: string;
  quantity: number;
  unit: string;
  pricePerKg: number;
  totalAmount: number;
  status: TransactionStatus;
  paymentMethod: string;
}

// Dummy data
const dummyTransactions: Transaction[] = [
  {
    id: 'TRX-001',
    date: '2025-01-15',
    supplier: 'Bank Sampah Mawar',
    wasteType: 'Plastik PET',
    quantity: 250,
    unit: 'kg',
    pricePerKg: 3500,
    totalAmount: 875000,
    status: 'completed',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'TRX-002',
    date: '2025-01-14',
    supplier: 'Kolektor Sampah Sejahtera',
    wasteType: 'Kardus',
    quantity: 180,
    unit: 'kg',
    pricePerKg: 2800,
    totalAmount: 504000,
    status: 'pending',
    paymentMethod: 'Cash',
  },
  {
    id: 'TRX-003',
    date: '2025-01-13',
    supplier: 'Bank Sampah Melati',
    wasteType: 'Aluminium',
    quantity: 45,
    unit: 'kg',
    pricePerKg: 15000,
    totalAmount: 675000,
    status: 'completed',
    paymentMethod: 'E-Wallet',
  },
  {
    id: 'TRX-004',
    date: '2025-01-12',
    supplier: 'Pengumpul Sampah Mandiri',
    wasteType: 'Kertas Bekas',
    quantity: 320,
    unit: 'kg',
    pricePerKg: 1500,
    totalAmount: 480000,
    status: 'cancelled',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'TRX-005',
    date: '2025-01-11',
    supplier: 'Bank Sampah Hijau',
    wasteType: 'Botol Kaca',
    quantity: 120,
    unit: 'kg',
    pricePerKg: 800,
    totalAmount: 96000,
    status: 'completed',
    paymentMethod: 'Cash',
  },
];

const statusColors: Record<TransactionStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = dummyTransactions.filter((transaction) => {
    const matchesFilter = filter === 'all' || transaction.status === filter;
    const matchesSearch =
      transaction.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = filteredTransactions.reduce(
    (sum, tx) => sum + tx.totalAmount,
    0
  );
  const completedTransactions = filteredTransactions.filter(
    (tx) => tx.status === 'completed'
  ).length;

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>
          Transaksi Pembelian Sampah
        </h1>
        <p className='text-gray-600'>
          Kelola dan pantau semua transaksi pembelian sampah
        </p>
      </div>

      {/* Stats Cards */}
      <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Total Transaksi
          </h3>
          <p className='text-2xl font-bold text-gray-900'>
            {filteredTransactions.length}
          </p>
        </div>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Transaksi Selesai
          </h3>
          <p className='text-2xl font-bold text-green-600'>
            {completedTransactions}
          </p>
        </div>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Total Nilai
          </h3>
          <p className='text-2xl font-bold text-blue-600'>
            Rp {totalAmount.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='mb-6 rounded-lg border bg-white p-4 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Cari transaksi...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex gap-2'>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className='rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Semua Status</option>
              <option value='completed'>Selesai</option>
              <option value='pending'>Pending</option>
              <option value='cancelled'>Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='overflow-hidden rounded-lg border bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='border-b bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  ID Transaksi
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Tanggal
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Pemasok
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jenis Sampah
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jumlah
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Total
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                    {transaction.id}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    {new Date(transaction.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    {transaction.supplier}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    {transaction.wasteType}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    {transaction.quantity} {transaction.unit}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                    Rp {transaction.totalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[transaction.status]}`}
                    >
                      {transaction.status === 'completed'
                        ? 'Selesai'
                        : transaction.status === 'pending'
                          ? 'Pending'
                          : 'Dibatalkan'}
                    </span>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    <div className='flex gap-2'>
                      <button className='text-blue-600 hover:text-blue-900'>
                        Detail
                      </button>
                      {transaction.status === 'pending' && (
                        <button className='text-green-600 hover:text-green-900'>
                          Konfirmasi
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-500'>Tidak ada transaksi yang ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
