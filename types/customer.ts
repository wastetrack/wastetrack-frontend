// Customer domain types - All customer-related types in one place

// ============================================================================
// DASHBOARD TYPES
// ============================================================================
export interface Impact {
  carbonReduced: number;
  waterSaved: number;
  treesPreserved: number;
}

export interface Waste {
  total: number;
}

export interface Pickups {
  pending: number;
  completed: number;
  cancelled: number;
}

export interface Stats {
  points: number;
  impact: Impact;
  waste: Waste;
  pickups: Pickups;
}

// ============================================================================
// PICKUP TYPES
// ============================================================================
export type PickupStatus =
  | 'pending'
  | 'completed'
  | 'in_progress'
  | 'assigned'
  | 'cancelled';

export interface Pickup {
  id: string;
  status: PickupStatus;
  wasteQuantities?: Record<string, number>;
  quantity?: number;
  date: string;
  time: string;
}

// Status display mappings
export const PICKUP_STATUS_TEXT: Record<PickupStatus, string> = {
  pending: 'Menunggu',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  in_progress: 'Proses',
  assigned: 'Ditugaskan',
};

export const PICKUP_STATUS_STYLES: Record<PickupStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  completed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  in_progress: 'bg-orange-100 text-orange-800 border border-orange-200',
  assigned: 'bg-blue-100 text-blue-800 border border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
};

// ============================================================================
// FORM TYPES
// ============================================================================
export interface CustomerFormData {
  username?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  province?: string;
}

// ============================================================================
// UI STATE TYPES (formerly in ui.ts)
// ============================================================================
export interface CustomerDashboardState {
  profile: Record<string, unknown> | null; // Generic profile object
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================
export interface CustomerLocation {
  latitude: number;
  longitude: number;
}

export interface CustomerPreferences {
  notifications: boolean;
  newsletter: boolean;
  language: 'id' | 'en';
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================
export interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    email: string;
    points: number;
  };
  onClick?: (id: string) => void;
  showActions?: boolean;
}
