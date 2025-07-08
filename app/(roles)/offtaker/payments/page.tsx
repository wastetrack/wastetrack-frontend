'use client';

import { useState } from 'react';

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface Payment {
  id: string;
  transactionId: string;
  supplier: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  description: string;
}

// Dummy data pembayaran
const dummyPayments: Payment[] = [
  {
    id: 'PAY-001',
    transactionId: 'TRX-001',
    supplier: 'Bank Sampah Mawar',
    amount: 875000,
    method: 'Bank Transfer',
    status: 'completed',
    dueDate: '2025-01-20',
    paidDate: '2025-01-18',
    description: 'Pembayaran untuk pembelian Plastik PET 250kg',
  },
  {
    id: 'PAY-002',
    transactionId: 'TRX-002',
    supplier: 'Kolektor Sampah Sejahtera',
    amount: 504000,
    method: 'Cash',
    status: 'pending',
    dueDate: '2025-01-22',
    description: 'Pembayaran untuk pembelian Kardus 180kg',
  },
  {
    id: 'PAY-003',
    transactionId: 'TRX-003',
    supplier: 'Bank Sampah Melati',
    amount: 675000,
    method: 'E-Wallet',
    status: 'processing',
    dueDate: '2025-01-25',
    description: 'Pembayaran untuk pembelian Aluminium 45kg',
  },
  {
    id: 'PAY-004',
    transactionId: 'TRX-004',
    supplier: 'Pengumpul Sampah Mandiri',
    amount: 480000,
    method: 'Bank Transfer',
    status: 'failed',
    dueDate: '2025-01-15',
    description: 'Pembayaran untuk pembelian Kertas Bekas 320kg',
  },
  {
    id: 'PAY-005',
    transactionId: 'TRX-005',
    supplier: 'Bank Sampah Hijau',
    amount: 96000,
    method: 'Cash',
    status: 'completed',
    dueDate: '2025-01-18',
    paidDate: '2025-01-17',
    description: 'Pembayaran untuk pembelian Botol Kaca 120kg',
  },
];

const statusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const statusLabels: Record<PaymentStatus, string> = {
  pending: 'Menunggu',
  processing: 'Diproses',
  completed: 'Selesai',
  failed: 'Gagal',
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const filteredPayments = dummyPayments.filter((payment) => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch =
      payment.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPending = dummyPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCompleted = dummyPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const overduePeayments = dummyPayments.filter(
    (p) => p.status === 'pending' && new Date(p.dueDate) < new Date()
  ).length;

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>
          Manajemen Pembayaran
        </h1>
        <p className='text-gray-600'>Kelola pembayaran kepada pemasok sampah</p>
      </div>

      {/* Stats Cards */}
      <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Total Pending
          </h3>
          <p className='text-2xl font-bold text-yellow-600'>
            Rp {totalPending.toLocaleString('id-ID')}
          </p>
          <p className='mt-1 text-sm text-gray-500'>
            {dummyPayments.filter((p) => p.status === 'pending').length}{' '}
            pembayaran
          </p>
        </div>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Total Dibayar
          </h3>
          <p className='text-2xl font-bold text-green-600'>
            Rp {totalCompleted.toLocaleString('id-ID')}
          </p>
          <p className='mt-1 text-sm text-gray-500'>
            {dummyPayments.filter((p) => p.status === 'completed').length}{' '}
            pembayaran
          </p>
        </div>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>Terlambat</h3>
          <p className='text-2xl font-bold text-red-600'>{overduePeayments}</p>
          <p className='mt-1 text-sm text-gray-500'>pembayaran</p>
        </div>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Dalam Proses
          </h3>
          <p className='text-2xl font-bold text-blue-600'>
            {dummyPayments.filter((p) => p.status === 'processing').length}
          </p>
          <p className='mt-1 text-sm text-gray-500'>pembayaran</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='mb-6 rounded-lg border bg-white p-4 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Cari pembayaran...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex gap-2'>
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as PaymentStatus | 'all')
              }
              className='rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Semua Status</option>
              <option value='pending'>Menunggu</option>
              <option value='processing'>Diproses</option>
              <option value='completed'>Selesai</option>
              <option value='failed'>Gagal</option>
            </select>
            <button className='rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
              💳 Proses Pembayaran
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className='overflow-hidden rounded-lg border bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='border-b bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  ID Pembayaran
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Transaksi
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Pemasok
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jumlah
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Metode
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jatuh Tempo
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                    {payment.id}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    {payment.transactionId}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    {payment.supplier}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    {payment.method}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                    {payment.status === 'pending' &&
                      new Date(payment.dueDate) < new Date() && (
                        <span className='block text-xs text-red-600'>
                          Terlambat
                        </span>
                      )}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[payment.status]}`}
                    >
                      {statusLabels[payment.status]}
                    </span>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className='text-blue-600 hover:text-blue-900'
                      >
                        Detail
                      </button>
                      {payment.status === 'pending' && (
                        <button className='text-green-600 hover:text-green-900'>
                          Bayar
                        </button>
                      )}
                      {payment.status === 'failed' && (
                        <button className='text-orange-600 hover:text-orange-900'>
                          Coba Lagi
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-500'>Tidak ada pembayaran yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='mx-4 w-full max-w-md rounded-lg bg-white p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Detail Pembayaran
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>ID Pembayaran:</span>
                <span className='text-sm font-medium'>
                  {selectedPayment.id}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>ID Transaksi:</span>
                <span className='text-sm font-medium'>
                  {selectedPayment.transactionId}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Pemasok:</span>
                <span className='text-sm font-medium'>
                  {selectedPayment.supplier}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Jumlah:</span>
                <span className='text-sm font-medium'>
                  Rp {selectedPayment.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Metode:</span>
                <span className='text-sm font-medium'>
                  {selectedPayment.method}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Jatuh Tempo:</span>
                <span className='text-sm font-medium'>
                  {new Date(selectedPayment.dueDate).toLocaleDateString(
                    'id-ID'
                  )}
                </span>
              </div>
              {selectedPayment.paidDate && (
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Tanggal Bayar:</span>
                  <span className='text-sm font-medium'>
                    {new Date(selectedPayment.paidDate).toLocaleDateString(
                      'id-ID'
                    )}
                  </span>
                </div>
              )}
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Status:</span>
                <span
                  className={`rounded-full px-2 py-1 text-sm font-medium ${statusColors[selectedPayment.status]}`}
                >
                  {statusLabels[selectedPayment.status]}
                </span>
              </div>
              <div className='border-t pt-2'>
                <span className='text-sm text-gray-600'>Deskripsi:</span>
                <p className='mt-1 text-sm text-gray-900'>
                  {selectedPayment.description}
                </p>
              </div>
            </div>

            <div className='mt-6 flex gap-2'>
              {selectedPayment.status === 'pending' && (
                <button className='flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                  Proses Pembayaran
                </button>
              )}
              {selectedPayment.status === 'completed' && (
                <button className='flex-1 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'>
                  Unduh Receipt
                </button>
              )}
              <button
                onClick={() => setSelectedPayment(null)}
                className='flex-1 rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700'
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
