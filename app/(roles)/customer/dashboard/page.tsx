'use client';

export default function CustomerDashboard() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Dashboard Pelanggan</h1>
        <p className='mt-2 text-gray-600'>Selamat datang di dashboard pelanggan WasteTrack.</p>
      </div>
      
      {/* Dashboard Content */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Quick Stats */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>Total Poin</h3>
          <p className='text-3xl font-bold text-emerald-600'>1,250</p>
          <p className='text-sm text-gray-500 mt-1'>+50 poin hari ini</p>
        </div>
        
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>Sampah Disetor</h3>
          <p className='text-3xl font-bold text-blue-600'>24.5 kg</p>
          <p className='text-sm text-gray-500 mt-1'>Bulan ini</p>
        </div>
        
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>Pickup Terjadwal</h3>
          <p className='text-3xl font-bold text-orange-600'>3</p>
          <p className='text-sm text-gray-500 mt-1'>Minggu ini</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className='mt-8 bg-white rounded-lg shadow-sm border p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Aktivitas Terbaru</h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-2 border-b border-gray-100'>
            <div>
              <p className='font-medium text-gray-800'>Penyetoran Sampah Plastik</p>
              <p className='text-sm text-gray-500'>2 hari yang lalu</p>
            </div>
            <span className='text-emerald-600 font-semibold'>+25 poin</span>
          </div>
          <div className='flex items-center justify-between py-2 border-b border-gray-100'>
            <div>
              <p className='font-medium text-gray-800'>Pickup Sampah Organik</p>
              <p className='text-sm text-gray-500'>5 hari yang lalu</p>
            </div>
            <span className='text-emerald-600 font-semibold'>+15 poin</span>
          </div>
          <div className='flex items-center justify-between py-2'>
            <div>
              <p className='font-medium text-gray-800'>Tukar Poin dengan Voucher</p>
              <p className='text-sm text-gray-500'>1 minggu yang lalu</p>
            </div>
            <span className='text-red-600 font-semibold'>-100 poin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
