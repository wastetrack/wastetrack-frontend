'use client';

export default function DetectPage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Deteksi Sampah</h1>
        <p className='mt-2 text-gray-600'>Gunakan kamera untuk mendeteksi jenis sampah dan mendapatkan informasi.</p>
      </div>
      
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='text-center'>
          <div className='mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4'>
            <span className='text-gray-400 text-4xl'>📷</span>
          </div>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>Deteksi Sampah</h3>
          <p className='text-gray-600 mb-4'>Ambil foto sampah untuk mengetahui jenisnya</p>
          <button className='px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'>
            Buka Kamera
          </button>
        </div>
      </div>
    </div>
  );
}
