// Tier thresholds and configuration
export const TIER_THRESHOLDS = {
  rookie: { min: 0, max: 499, next: 'bronze' },
  bronze: { min: 500, max: 999, next: 'silver' },
  silver: { min: 1000, max: 2499, next: 'gold' },
  gold: { min: 2500, max: 4999, next: 'platinum' },
  platinum: { min: 5000, max: Infinity, next: null }
} as const;

// Type for tier names
export type TierName = keyof typeof TIER_THRESHOLDS;

// Helper function to get current tier based on points
export const getCurrentTier = (points: number): TierName => {
  const tiers = Object.entries(TIER_THRESHOLDS) as [TierName, typeof TIER_THRESHOLDS[TierName]][];
  
  for (const [tierName, tierData] of tiers) {
    if (points >= tierData.min && points <= tierData.max) {
      return tierName;
    }
  }
  
  return 'rookie'; // fallback
};

// Helper function to calculate next tier progress
export const calculateNextTierProgress = (points: number) => {
  const currentTier = getCurrentTier(points);
  const currentTierData = TIER_THRESHOLDS[currentTier];
  
  // If already at highest tier (platinum)
  if (!currentTierData.next) {
    return null;
  }
  
  const nextTierName = currentTierData.next as TierName;
  const nextTierData = TIER_THRESHOLDS[nextTierName];
  
  const progress = ((points - currentTierData.min) / (nextTierData.min - currentTierData.min)) * 100;
  const remaining = nextTierData.min - points;
  
  return {
    currentTier,
    nextTier: nextTierName,
    progress: Math.min(progress, 100),
    remaining: Math.max(remaining, 0),
    pointsInCurrentTier: points - currentTierData.min,
    pointsNeededForNext: nextTierData.min - currentTierData.min
  };
};

// Tier display names in Indonesian
export const TIER_DISPLAY_NAMES: Record<TierName, string> = {
  rookie: 'Pemula',
  bronze: 'Perunggu',
  silver: 'Perak',
  gold: 'Emas',
  platinum: 'Platinum'
};

// Tier colors for UI
export const TIER_COLORS: Record<TierName, { bg: string; text: string; border: string }> = {
  rookie: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  bronze: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  silver: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  platinum: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' }
};
