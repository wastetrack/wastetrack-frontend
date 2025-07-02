'use client';

export default function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg'>
        <h1 className='mb-4 text-3xl font-bold text-gray-800'>Wastetrack</h1>
        <p className='mb-6 font-medium text-gray-600'>
          Sistem Manajemen Limbah yang Okegas Okegas
        </p>
        <div className='space-y-3'>
          <button
            onClick={() => (window.location.href = '/login')}
            className='w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600'
          >
            Mulai Sekarang
          </button>
          <button className='w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50'>
            Pelajari Lebih Lanjut
          </button>
        </div>
        <p className='mt-6 text-sm text-gray-500'>
          Dibuat dengan Next.js & Tailwind CSS
        </p>
      </div>
    </div>
  );
}
