'use client';

export default function SchedulePage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Jadwal Penyetoran</h1>
        <p className='mt-2 text-gray-600'>
          Atur jadwal penyetoran sampah Anda.
        </p>
      </div>

      <div className='space-y-6'>
        {/* Quick Schedule */}
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold text-gray-800'>
            Jadwal Cepat
          </h3>
          <button className='w-full rounded-lg bg-emerald-600 px-4 py-3 text-white transition-colors hover:bg-emerald-700'>
            Jadwalkan Pickup Hari Ini
          </button>
        </div>

        {/* Upcoming Schedules */}
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold text-gray-800'>
            Jadwal Mendatang
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
              <div>
                <p className='font-medium text-gray-800'>Sampah Organik</p>
                <p className='text-sm text-gray-500'>Besok, 08:00 - 10:00</p>
              </div>
              <span className='text-sm font-medium text-green-600'>
                Terjadwal
              </span>
            </div>
            <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
              <div>
                <p className='font-medium text-gray-800'>Sampah Plastik</p>
                <p className='text-sm text-gray-500'>Jumat, 14:00 - 16:00</p>
              </div>
              <span className='text-sm font-medium text-green-600'>
                Terjadwal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
