'use client';

export default function SettingsPage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Pengaturan</h1>
        <p className='mt-2 text-gray-600'>Kelola pengaturan aplikasi Anda.</p>
      </div>

      <div className='space-y-6'>
        {/* Notification Settings */}
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold text-gray-800'>
            Notifikasi
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Notifikasi Pickup</p>
                <p className='text-sm text-gray-600'>
                  Terima notifikasi jadwal pickup
                </p>
              </div>
              <label className='relative inline-flex cursor-pointer items-center'>
                <input
                  type='checkbox'
                  defaultChecked
                  className='peer sr-only'
                />
                <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[""] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300'></div>
              </label>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Notifikasi Poin</p>
                <p className='text-sm text-gray-600'>
                  Terima notifikasi perolehan poin
                </p>
              </div>
              <label className='relative inline-flex cursor-pointer items-center'>
                <input
                  type='checkbox'
                  defaultChecked
                  className='peer sr-only'
                />
                <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[""] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300'></div>
              </label>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Notifikasi Promo</p>
                <p className='text-sm text-gray-600'>
                  Terima notifikasi promo dan penawaran
                </p>
              </div>
              <label className='relative inline-flex cursor-pointer items-center'>
                <input type='checkbox' className='peer sr-only' />
                <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[""] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300'></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold text-gray-800'>Privasi</h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Profil Publik</p>
                <p className='text-sm text-gray-600'>
                  Izinkan orang lain melihat profil Anda
                </p>
              </div>
              <label className='relative inline-flex cursor-pointer items-center'>
                <input type='checkbox' className='peer sr-only' />
                <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[""] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300'></div>
              </label>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Bagikan Data Lokasi</p>
                <p className='text-sm text-gray-600'>
                  Izinkan aplikasi menggunakan lokasi
                </p>
              </div>
              <label className='relative inline-flex cursor-pointer items-center'>
                <input
                  type='checkbox'
                  defaultChecked
                  className='peer sr-only'
                />
                <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[""] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300'></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold text-gray-800'>Akun</h3>
          <div className='space-y-3'>
            <button className='w-full rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50'>
              Ubah Password
            </button>
            <button className='w-full rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50'>
              Unduh Data Saya
            </button>
            <button className='w-full rounded-lg px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50'>
              Hapus Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
