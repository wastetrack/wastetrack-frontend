'use client';

export default function HistoryPage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Riwayat Tabungan</h1>
        <p className='mt-2 text-gray-600'>Lihat riwayat penyetoran dan penukaran poin Anda.</p>
      </div>
      
      <div className='space-y-6'>
        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <h3 className='text-sm font-medium text-gray-600 mb-1'>Total Poin Diperoleh</h3>
            <p className='text-2xl font-bold text-emerald-600'>2,450</p>
          </div>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <h3 className='text-sm font-medium text-gray-600 mb-1'>Poin Digunakan</h3>
            <p className='text-2xl font-bold text-red-600'>1,200</p>
          </div>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <h3 className='text-sm font-medium text-gray-600 mb-1'>Saldo Saat Ini</h3>
            <p className='text-2xl font-bold text-blue-600'>1,250</p>
          </div>
        </div>
        
        {/* Transaction History */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Riwayat Transaksi</h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between py-3 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center'>
                  <span className='text-emerald-600 text-sm'>+</span>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>Penyetoran Sampah Plastik</p>
                  <p className='text-sm text-gray-500'>2 hari yang lalu • 15:30</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-emerald-600'>+25 Poin</p>
                <p className='text-sm text-gray-500'>2.5 kg</p>
              </div>
            </div>
            
            <div className='flex items-center justify-between py-3 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                  <span className='text-red-600 text-sm'>-</span>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>Penukaran Voucher Belanja</p>
                  <p className='text-sm text-gray-500'>3 hari yang lalu • 10:15</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-red-600'>-100 Poin</p>
                <p className='text-sm text-gray-500'>Voucher 20k</p>
              </div>
            </div>
            
            <div className='flex items-center justify-between py-3 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center'>
                  <span className='text-emerald-600 text-sm'>+</span>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>Penyetoran Sampah Organik</p>
                  <p className='text-sm text-gray-500'>5 hari yang lalu • 08:45</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-emerald-600'>+15 Poin</p>
                <p className='text-sm text-gray-500'>3.0 kg</p>
              </div>
            </div>
            
            <div className='flex items-center justify-between py-3'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center'>
                  <span className='text-emerald-600 text-sm'>+</span>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>Penyetoran Sampah Kertas</p>
                  <p className='text-sm text-gray-500'>1 minggu yang lalu • 14:20</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-emerald-600'>+30 Poin</p>
                <p className='text-sm text-gray-500'>1.5 kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
