import { Recycle, Droplet, Trees, Package } from 'lucide-react';
import type { Impact, Waste } from '@/types';

interface EnvironmentalImpactProps {
  impact: Impact;
  waste: Waste;
}

export default function EnvironmentalImpact({
  impact,
  waste,
}: EnvironmentalImpactProps) {
  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID', { maximumFractionDigits: 1 });
  };

  return (
    <div className='rounded-xl sm:bg-white sm:p-4 sm:shadow-sm'>
      <h2 className='mb-2 text-lg font-semibold text-gray-700'>
        Dampak Lingkungan
      </h2>
      <div className='grid grid-cols-2 gap-3 text-left'>
        <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:bg-emerald-50'>
          <Recycle className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
          <div>
            <p className='text-xs text-gray-600'>CO₂ Berkurang</p>
            <p className='text-md sm-text-emerald-700 font-bold text-emerald-600'>
              {formatNumber(impact.carbonReduced || 0)} kg
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:bg-emerald-50'>
          <Droplet className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
          <div>
            <p className='text-xs text-gray-600'>Air Terhemat</p>
            <p className='text-md font-bold text-emerald-600 sm:text-emerald-700'>
              {formatNumber(impact.waterSaved || 0)} L
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:bg-emerald-50'>
          <Trees className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
          <div>
            <p className='text-xs text-gray-600'>Pohon</p>
            <p className='text-md font-bold text-emerald-600 sm:text-emerald-700'>
              {formatNumber(impact.treesPreserved || 0)}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:bg-emerald-50'>
          <Package className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
          <div>
            <p className='text-xs text-gray-600'>Sampah</p>
            <p className='text-md font-bold text-emerald-600 sm:text-emerald-700'>
              {waste.total || 0}{' '}
              <span className='text-[10px] font-medium'>kantong</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
