export interface AppointmentLocation {
  latitude: number;
  longitude: number;
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
  created_at: string;
  updated_at: string;
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
  appointment_date?: string;       // YYYY-MM-DD
  appointment_date_from?: string;   // Option 2: Specific appointment date
  appointment_date_to?: string;

  appointment_start_time?: string; // HH:MM:SS
  appointment_end_time?: string; // HH:MM:SS
  
  // Location filtering
  latitude?: number;
  longitude?: number;
  radius?: number; // dalam kilometer
  
  // Pagination
  page?: number;
  size?: number;
  
  // Sorting
  sort_by?: 'created_at' | 'appointment_date' | 'status' | 'total_price';
  sort_order?: 'asc' | 'desc';
  
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