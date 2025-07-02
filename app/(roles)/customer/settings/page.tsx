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
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Notifikasi</h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Notifikasi Pickup</p>
                <p className='text-sm text-gray-600'>Terima notifikasi jadwal pickup</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' defaultChecked className='sr-only peer' />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600'></div>
              </label>
            </div>
            
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Notifikasi Poin</p>
                <p className='text-sm text-gray-600'>Terima notifikasi perolehan poin</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' defaultChecked className='sr-only peer' />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600'></div>
              </label>
            </div>
            
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Notifikasi Promo</p>
                <p className='text-sm text-gray-600'>Terima notifikasi promo dan penawaran</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600'></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Privacy Settings */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Privasi</h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Profil Publik</p>
                <p className='text-sm text-gray-600'>Izinkan orang lain melihat profil Anda</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600'></div>
              </label>
            </div>
            
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-gray-800'>Bagikan Data Lokasi</p>
                <p className='text-sm text-gray-600'>Izinkan aplikasi menggunakan lokasi</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' defaultChecked className='sr-only peer' />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600'></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Account Settings */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Akun</h3>
          <div className='space-y-3'>
            <button className='w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
              Ubah Password
            </button>
            <button className='w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'>
              Unduh Data Saya
            </button>
            <button className='w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors'>
              Hapus Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
