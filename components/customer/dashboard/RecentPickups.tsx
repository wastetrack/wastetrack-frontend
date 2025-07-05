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
  pickups, 
  displayedPickups, 
  recentPickups, 
  onViewAllPickups 
}: RecentPickupsProps) {
  const formatDate = (pickup: Pickup): string => {
    const date = new Date(pickup.date);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const getStatusText = (status: PickupStatus): string => {
    return PICKUP_STATUS_TEXT[status] || status;
  };

  const getStatusStyle = (status: PickupStatus): string => {
    const baseStyle = 'px-2 rounded-full text-[8px] capitalize';
    const statusStyle = PICKUP_STATUS_STYLES[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
    return `${baseStyle} ${statusStyle}`;
  };

  return (
    <div className="pt-4 sm:p-4 sm:bg-white sm:shadow-sm sm:rounded-xl">
      <h2 className="mb-2 text-lg font-semibold text-gray-800">Pengambilan Terbaru</h2>
      
      {pickups.pending > 0 && (
        <span className="px-2 py-1 text-xs text-yellow-600 rounded-full bg-yellow-50">
          {pickups.pending} menunggu
        </span>
      )}
      
      {displayedPickups.length > 0 ? (
        <div className="space-y-2">
          {displayedPickups.map((pickup) => (
            <div
              key={pickup.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white shadow-xs sm:shadow-sm border border-gray-50 hover:border-emerald-100 transition-colors"
            >
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-50">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-left font-medium text-gray-800">
                    {pickup.wasteQuantities ?
                      Object.values(pickup.wasteQuantities).reduce((total, qty) => total + qty, 0)
                      : pickup.quantity || 0} kantong
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(pickup)} • {pickup.time}
                  </p>
                </div>
              </div>
              <span className={getStatusStyle(pickup.status)}>
                {getStatusText(pickup.status)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center bg-white rounded-lg shadow-sm border border-gray-50">
          <p className="text-sm text-gray-500">Belum ada pengambilan yang dijadwalkan</p>
        </div>
      )}

      {recentPickups.length > 3 && (
        <div className="text-center p-2">
          <button
            onClick={onViewAllPickups}
            className="bg-transparent text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center"
          >
            Lihat selengkapnya
          </button>
        </div>
      )}
    </div>
  );
}
