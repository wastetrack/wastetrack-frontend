import { Recycle, Droplet, Trees, Package } from 'lucide-react';
import type { Impact, Waste } from '@/types';

interface EnvironmentalImpactProps {
  impact: Impact;
  waste: Waste;
}

export default function EnvironmentalImpact({ impact, waste }: EnvironmentalImpactProps) {
  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID', { maximumFractionDigits: 1 });
  };

  return (
    <div className="sm:p-4 sm:bg-white sm:shadow-sm rounded-xl">
      <h2 className="mb-2 text-lg font-semibold text-gray-700">Dampak Lingkungan</h2>
      <div className="text-left grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white sm:bg-emerald-50 border border-emerald-200">
          <Recycle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-500 sm:text-emerald-600">CO₂ Berkurang</p>
            <p className="text-md font-bold text-emerald-600 sm-text-emerald-700">
              {formatNumber(impact.carbonReduced || 0)} kg
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white sm:bg-emerald-50 border border-emerald-200">
          <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-500 sm:text-emerald-600">Air Terhemat</p>
            <p className="text-md font-bold text-emerald-600 sm:text-emerald-700">
              {formatNumber(impact.waterSaved || 0)} L
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white sm:bg-emerald-50 border border-emerald-200">
          <Trees className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-500 sm:text-emerald-600">Pohon</p>
            <p className="text-md font-bold text-emerald-600 sm:text-emerald-700">
              {formatNumber(impact.treesPreserved || 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white sm:bg-emerald-50 border border-emerald-200">
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-500 sm:text-emerald-600">Sampah</p>
            <p className="text-md font-bold text-emerald-600 sm:text-emerald-700">
              {waste.total || 0} ktg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
