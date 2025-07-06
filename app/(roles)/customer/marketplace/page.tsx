'use client';

export default function MarketplacePage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Marketplace</h1>
        <p className='mt-2 text-gray-600'>
          Tukar poin Anda dengan berbagai hadiah menarik.
        </p>
      </div>

      <div className='space-y-6'>
        {/* Points Balance */}
        <div className='rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white'>
          <h3 className='mb-2 text-lg font-semibold'>Saldo Poin Anda</h3>
          <p className='text-3xl font-bold'>1,250 Poin</p>
        </div>

        {/* Rewards Grid */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-lg border bg-white p-4 shadow-sm'>
            <div className='mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-gray-100'>
              <span className='text-2xl text-gray-400'>🎁</span>
            </div>
            <h4 className='mb-1 font-semibold text-gray-800'>
              Voucher Belanja 50k
            </h4>
            <p className='mb-3 text-sm text-gray-600'>
              Voucher belanja untuk minimarket
            </p>
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-emerald-600'>500 Poin</span>
              <button className='rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700'>
                Tukar
              </button>
            </div>
          </div>

          <div className='rounded-lg border bg-white p-4 shadow-sm'>
            <div className='mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-gray-100'>
              <span className='text-2xl text-gray-400'>☕</span>
            </div>
            <h4 className='mb-1 font-semibold text-gray-800'>Voucher Kopi</h4>
            <p className='mb-3 text-sm text-gray-600'>
              Gratis kopi di café partner
            </p>
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-emerald-600'>200 Poin</span>
              <button className='rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700'>
                Tukar
              </button>
            </div>
          </div>

          <div className='rounded-lg border bg-white p-4 shadow-sm'>
            <div className='mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-gray-100'>
              <span className='text-2xl text-gray-400'>🌱</span>
            </div>
            <h4 className='mb-1 font-semibold text-gray-800'>Bibit Tanaman</h4>
            <p className='mb-3 text-sm text-gray-600'>
              Bibit tanaman untuk taman Anda
            </p>
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-emerald-600'>300 Poin</span>
              <button className='rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700'>
                Tukar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
