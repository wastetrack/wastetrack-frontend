'use client';

export default function DetectPage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Deteksi Sampah</h1>
        <p className='mt-2 text-gray-600'>
          Gunakan kamera untuk mendeteksi jenis sampah dan mendapatkan
          informasi.
        </p>
      </div>

      <div className='rounded-lg border bg-white p-6 shadow-sm'>
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100'>
            <span className='text-4xl text-gray-400'>📷</span>
          </div>
          <h3 className='mb-2 text-lg font-semibold text-gray-800'>
            Deteksi Sampah
          </h3>
          <p className='mb-4 text-gray-600'>
            Ambil foto sampah untuk mengetahui jenisnya
          </p>
          <button className='rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700'>
            Buka Kamera
          </button>
        </div>
      </div>
    </div>
  );
}
