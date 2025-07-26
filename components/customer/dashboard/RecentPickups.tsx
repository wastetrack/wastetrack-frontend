import { Package } from 'lucide-react';
import type { Pickup, Pickups, PickupStatus } from '@/types';
import { PICKUP_STATUS_TEXT, PICKUP_STATUS_STYLES } from '@/types';

interface RecentPickupsProps {
  pickups: Pickups;
  displayedPickups: Pickup[];
  recentPickups: Pickup[];
  onViewAllPickups: () => void;
}

export default function RecentPickups({
  displayedPickups,
  recentPickups,
  onViewAllPickups,
}: RecentPickupsProps) {
  const formatDate = (pickup: Pickup): string => {
    const date = new Date(pickup.date);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // console.log('Data recentPickups:', recentPickups);

  const getStatusText = (status: PickupStatus): string => {
    return PICKUP_STATUS_TEXT[status] || status;
  };

  const getStatusStyle = (status: PickupStatus): string => {
    const baseStyle = 'px-2 rounded-full text-[8px] capitalize';
    const statusStyle =
      PICKUP_STATUS_STYLES[status] ||
      'bg-gray-100 text-gray-800 border border-gray-200';
    return `${baseStyle} ${statusStyle}`;
  };

  return (
    <div className='sm:rounded-xl sm:bg-white sm:p-4 sm:pt-4 sm:shadow-sm'>
      <h2 className='mb-2 text-lg font-semibold text-gray-800'>
        Riwayat Terbaru
      </h2>

      {displayedPickups.length > 0 ? (
        <div className='space-y-2'>
          {displayedPickups.map((pickup) => (
            <button
              key={pickup.id}
              type='button'
              onClick={onViewAllPickups}
              className='shadow-xs flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:shadow-sm'
            >
              <div className='flex gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50'>
                  <Package className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
                </div>
                <div>
                  <p className='text-left text-sm font-medium text-gray-800'>
                    {pickup.delivery_type === 'pickup'
                      ? 'Penjemputan'
                      : 'Antar sendiri'}
                  </p>
                  <p className='text-xs text-gray-500'></p>
                  <p className='text-xs text-gray-500'>
                    {formatDate(pickup)} • {pickup.time}
                  </p>
                </div>
              </div>
              <span className={getStatusStyle(pickup.status)}>
                {getStatusText(pickup.status)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className='rounded-lg border border-gray-50 bg-white py-6 text-center shadow-sm'>
          <p className='text-sm text-gray-500'>
            Belum ada pengambilan yang dijadwalkan
          </p>
        </div>
      )}

      {recentPickups.length > 3 && (
        <div className='p-2 text-center'>
          <button
            onClick={onViewAllPickups}
            className='inline-flex items-center bg-transparent text-xs text-emerald-600 hover:text-emerald-700'
          >
            Lihat selengkapnya
          </button>
        </div>
      )}
    </div>
  );
}
