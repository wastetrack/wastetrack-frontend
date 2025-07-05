import { Award } from 'lucide-react';
import { TIER_DISPLAY_NAMES, calculateNextTierProgress } from '@/constants';
import type { CustomerProfile } from '@/services/api/customer';

interface HeroSectionProps {
  customerProfile: CustomerProfile;
  points: number;
}

export default function HeroSection({ customerProfile, points }: HeroSectionProps) {
  const tierProgress = calculateNextTierProgress(points);

  return (
    <div className="relative p-4 sm:p-6 overflow-hidden text-white rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700">
      <div className="relative z-10">
        <h1 className="text-left sm:text-center text-sm sm:text-2xl font-thin">
          Selamat datang kembali,
        </h1>
        <p className="mb-4 text-left sm:text-center text-lg sm:text-2xl font-semibold">
          {customerProfile?.user?.username || 'Pengguna'}
        </p>

        {/* Rewards Display */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
            <div>
              <p className="text-xl text-left font-bold">{points} poin</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {tierProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-emerald-100">
              <span>{TIER_DISPLAY_NAMES[tierProgress.currentTier].toUpperCase()}</span>
              <span>{TIER_DISPLAY_NAMES[tierProgress.nextTier].toUpperCase()}</span>
            </div>
            <div className="w-full h-2 overflow-hidden rounded-full bg-emerald-200/30">
              <div
                className="h-full transition-all duration-500 bg-emerald-300"
                style={{ width: `${tierProgress.progress}%` }}
              />
            </div>
            <p className="text-xs text-emerald-100">
              {tierProgress.remaining} poin untuk ke tingkat {TIER_DISPLAY_NAMES[tierProgress.nextTier]}
            </p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8 rounded-full bg-emerald-400 opacity-20" />
      <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-8 translate-y-8 rounded-full bg-emerald-400 opacity-20" />
    </div>
  );
}
