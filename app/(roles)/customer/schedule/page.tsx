'use client';

export default function SchedulePage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Jadwal Penyetoran</h1>
        <p className='mt-2 text-gray-600'>Atur jadwal penyetoran sampah Anda.</p>
      </div>
      
      <div className='space-y-6'>
        {/* Quick Schedule */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Jadwal Cepat</h3>
          <button className='w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'>
            Jadwalkan Pickup Hari Ini
          </button>
        </div>
        
        {/* Upcoming Schedules */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Jadwal Mendatang</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div>
                <p className='font-medium text-gray-800'>Sampah Organik</p>
                <p className='text-sm text-gray-500'>Besok, 08:00 - 10:00</p>
              </div>
              <span className='text-green-600 text-sm font-medium'>Terjadwal</span>
            </div>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div>
                <p className='font-medium text-gray-800'>Sampah Plastik</p>
                <p className='text-sm text-gray-500'>Jumat, 14:00 - 16:00</p>
              </div>
              <span className='text-green-600 text-sm font-medium'>Terjadwal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
