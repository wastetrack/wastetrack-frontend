import { Award } from 'lucide-react';
import { TIER_DISPLAY_NAMES, calculateNextTierProgress } from '@/constants';
import type { CustomerProfile } from '@/services/api/customer';

interface HeroSectionProps {
  customerProfile: CustomerProfile;
  points: number;
}

export default function HeroSection({
  customerProfile,
  points,
}: HeroSectionProps) {
  const tierProgress = calculateNextTierProgress(points);

  return (
    <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 p-4 text-white sm:rounded-2xl sm:p-6'>
      <div className='relative z-10'>
        <h1 className='text-left text-sm font-thin sm:text-center sm:text-2xl'>
          Selamat datang kembali,
        </h1>
        <p className='mb-4 text-left text-lg font-semibold sm:text-center sm:text-2xl'>
          {customerProfile?.user?.username || 'Pengguna'}
        </p>

        {/* Rewards Display */}
        <div className='mb-4 flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Award className='h-5 w-5 text-yellow-300 sm:h-6 sm:w-6' />
            <div>
              <p className='text-left text-xl font-bold'>{points} poin</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {tierProgress && (
          <div className='space-y-2'>
            <div className='flex justify-between text-xs text-emerald-100'>
              <span>
                {TIER_DISPLAY_NAMES[tierProgress.currentTier].toUpperCase()}
              </span>
              <span>
                {TIER_DISPLAY_NAMES[tierProgress.nextTier].toUpperCase()}
              </span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-emerald-200/30'>
              <div
                className='h-full bg-emerald-300 transition-all duration-500'
                style={{ width: `${tierProgress.progress}%` }}
              />
            </div>
            <p className='text-xs text-emerald-100'>
              {tierProgress.remaining} poin untuk ke tingkat{' '}
              {TIER_DISPLAY_NAMES[tierProgress.nextTier]}
            </p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className='absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-16 transform rounded-full bg-emerald-400 opacity-20' />
      <div className='absolute bottom-0 left-0 h-24 w-24 -translate-x-8 translate-y-8 transform rounded-full bg-emerald-400 opacity-20' />
    </div>
  );
}
