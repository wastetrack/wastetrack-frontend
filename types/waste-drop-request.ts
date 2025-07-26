export interface AppointmentLocation {
  latitude: number;
  longitude: number;
}

interface Customer {
  address: string;
  balance: number;
  city: string;
  created_at: string;
  email: string;
  id: string;
  is_email_verified: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  phone_number: string;
  points: number;
  province: string;
  role: string;
  updated_at: string;
  username: string;
}

interface WasteBank {
  address: string;
  balance: number;
  city: string;
  created_at: string;
  email: string;
  id: string;
  institution: string;
  is_email_verified: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  phone_number: string;
  points: number;
  province: string;
  role: string;
  updated_at: string;
  username: string;
  waste_bank_id: string;
}

export interface WasteDropRequest {
  id: string;
  delivery_type: 'pickup' | 'dropoff';
  customer_id: string;
  user_phone_number: string;
  waste_bank_id: string;
  assigned_collector_id?: string;
  total_price: number;
  status: 'pending' | 'assigned' | 'collecting' | 'completed' | 'cancelled'; // FIXED
  appointment_location?: AppointmentLocation;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;
  notes?: string;
  distance?: number;
  created_at: string;
  updated_at: string;

  customer: Customer;
  waste_bank: WasteBank;
}

// Query Parameters untuk GET requests
export interface WasteDropRequestListParams {
  // Filtering
  delivery_type?: 'pickup' | 'dropoff';
  customer_id?: string;
  waste_bank_id?: string;
  assigned_collector_id?: string;
  status?: 'pending' | 'assigned' | 'collecting' | 'completed' | 'cancelled';

  // Date/Time filtering
  appointment_date?: string; // YYYY-MM-DD
  appointment_date_from?: string; // Option 2: Specific appointment date
  appointment_date_to?: string;

  appointment_start_time?: string; // HH:MM:SS
  appointment_end_time?: string; // HH:MM:SS

  // Location filtering
  latitude?: number;
  longitude?: number;
  // radius?: number; // dalam kilometer

  // Pagination
  page?: number;
  size?: number;

  // Sorting
  sort_by?: 'created_at' | 'appointment_date' | 'status' | 'total_price';
  order_dir?: 'asc' | 'desc';

  // Date range filtering
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
}

// Response types
export interface WasteDropRequestListResponse {
  data: WasteDropRequest[];
  paging?: {
    page: number;
    size: number;
    total: number;
    total_pages: number;
  };
  meta?: {
    filters_applied: Record<string, unknown>;
    total_count: number;
  };
}

export interface WasteDropRequestDetailResponse {
  data: WasteDropRequest;
}

// ============================================================================
// WASTEBANK DROP REQUEST TYPES (ONLY FOR WASTEBANK)
// ============================================================================
export interface WasteDropRequestStatusUpdateParams {
  status: 'assigned' | 'collecting' | 'pending' | 'cancelled';
}

export interface UpdateWasteDropRequestStatusResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface AssignCollectorResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

// ============================================================================
// WASTEBANK DROP REQUEST TYPES (ONLY FOR COLLECTOR)
// ============================================================================
export interface CompleteWasteDropRequestParams {
  items: {
    waste_type_ids: string[];
    weights: number[];
  };
}

export interface CompleteWasteDropRequestResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: string;
    completed_at: string;
    items: {
      waste_type_ids: string[];
      weights: number[];
    };
  };
}
