export interface AppointmentLocationTransfer {
  latitude: number;
  longitude: number;
}

export interface WasteTransferItems {
  waste_type_ids: string[];
  offering_weights: number[];
  offering_prices_per_kgs: number[];
}

export interface CreateWasteTransferRequestParams {
  source_user_id: string;
  destination_user_id: string;
  form_type: 'industry_request' | 'waste_bank_request';
  source_phone_number: string;
  destination_phone_number: string;
  image_url: string;
  appointment_location: AppointmentLocationTransfer;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;
  notes: string;
  items: WasteTransferItems;
}

export interface AssignCollectorItem {
  waste_type_id: string;
  accepted_weight: number;
  accepted_price_per_kgs: number;
}

export interface AssignCollectorParams {
  assigned_collector_id: string;
  items: AssignCollectorItem[];
}

export interface WasteTransferStatusUpdateParams {
  status: 'collecting' | 'cancelled';
}

export interface CompleteTransferItems {
  waste_type_ids: string[];
  weights: number[];
}

export interface CompleteWasteTransferParams {
  items: CompleteTransferItems;
}

export interface CreateWasteTransferResponse {
  id: string;
  source_user_id: string;
  destination_user_id: string;
  form_type: 'industry_request' | 'waste_bank_request';
  total_weight: number;
  total_price: number;
  status: string;
  image_url: string;
  notes: string;
  source_phone_number: string;
  destination_phone_number: string;
  appointment_start_time: string;
  appointment_end_time: string;
  appointment_date: string;
  appointment_location: AppointmentLocationTransfer;
  created_at: string;
  updated_at: string;
  distance: number;
}

export interface AssignCollectorToTransferResponse {
  id: string;
  source_user_id: string;
  destination_user_id: string;
  form_type: 'industry_request' | 'waste_bank_request';
  total_weight: number;
  status: string;
  image_url: string;
  notes: string;
  source_phone_number: string;
  destination_phone_number: string;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;
  appointment_location: AppointmentLocationTransfer;
  created_at: string;
  updated_at: string;
  source_user: string; // Assuming UserResponse is a string ID
  destination_user: string; // Assuming UserResponse is a string ID
  items: AssignCollectorItem[];
  distance: number;
}

export interface UpdateTransferStatusResponse {
  id: string;
  source_user_id: string;
  destination_user_id: string;
  form_type: 'industry_request' | 'waste_bank_request';
  total_weight: number;
  total_price: number;
  status: string;
  image_url: string;
  notes: string;
  source_phone_number: string;
  destination_phone_number: string;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;
  appointment_location: AppointmentLocationTransfer;
  created_at: string;
  updated_at: string;
  distance: number;
}

export interface CompleteWasteTransferResponse {
  message: string;
  // Add other response fields as needed
}

// ===========================================
// GET
// ===========================================

export interface GetWasteTransferRequestsParams {
  source_user_id?: string;
  destination_user_id?: string;
  form_type?: 'industry_request' | 'waste_bank_request';
  status?: string;
  appointment_start_time?: string;
  appointment_end_time?: string;
  page?: number;
  size?: number;
  latitude?: number;
  longitude?: number;
}

export interface WasteTransferRequest {
  id: string;
  source_user_id: string;
  destination_user_id: string;
  form_type: 'industry_request' | 'waste_bank_request';
  source_phone_number: string;
  destination_phone_number: string;
  image_url: string;
  total_weight: number;
  total_price: number;
  appointment_location: AppointmentLocationTransfer;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;
  notes: string;
  status: string;
  items: WasteTransferItems;
  assigned_collector_id?: string;
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

export interface GetWasteTransferRequestsResponse {
  data: WasteTransferRequest[];
  pagination: {
    page: number;
    size: number;
    total: number;
    total_pages: number;
  };
}

export interface GetWasteTransferRequestByIdResponse {
  data: WasteTransferRequest;
}
