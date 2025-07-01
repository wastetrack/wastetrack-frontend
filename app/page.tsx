"use client";


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Wastetrack
        </h1>
        <p className="text-gray-600 font-medium mb-6">
          Sistem Manajemen Limbah yang Okegas Okegas
        </p>
        <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/login'} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Mulai Sekarang
            </button>
          <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors">
            Pelajari Lebih Lanjut
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Dibuat dengan Next.js & Tailwind CSS
        </p>
      </div>
    </div>
  )
}