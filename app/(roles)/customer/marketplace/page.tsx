'use client';

export default function MarketplacePage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Marketplace</h1>
        <p className='mt-2 text-gray-600'>Tukar poin Anda dengan berbagai hadiah menarik.</p>
      </div>
      
      <div className='space-y-6'>
        {/* Points Balance */}
        <div className='bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white'>
          <h3 className='text-lg font-semibold mb-2'>Saldo Poin Anda</h3>
          <p className='text-3xl font-bold'>1,250 Poin</p>
        </div>
        
        {/* Rewards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <div className='w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center'>
              <span className='text-gray-400 text-2xl'>🎁</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-1'>Voucher Belanja 50k</h4>
            <p className='text-sm text-gray-600 mb-3'>Voucher belanja untuk minimarket</p>
            <div className='flex items-center justify-between'>
              <span className='text-emerald-600 font-semibold'>500 Poin</span>
              <button className='px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700'>
                Tukar
              </button>
            </div>
          </div>
          
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <div className='w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center'>
              <span className='text-gray-400 text-2xl'>☕</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-1'>Voucher Kopi</h4>
            <p className='text-sm text-gray-600 mb-3'>Gratis kopi di café partner</p>
            <div className='flex items-center justify-between'>
              <span className='text-emerald-600 font-semibold'>200 Poin</span>
              <button className='px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700'>
                Tukar
              </button>
            </div>
          </div>
          
          <div className='bg-white rounded-lg shadow-sm border p-4'>
            <div className='w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center'>
              <span className='text-gray-400 text-2xl'>🌱</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-1'>Bibit Tanaman</h4>
            <p className='text-sm text-gray-600 mb-3'>Bibit tanaman untuk taman Anda</p>
            <div className='flex items-center justify-between'>
              <span className='text-emerald-600 font-semibold'>300 Poin</span>
              <button className='px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700'>
                Tukar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
