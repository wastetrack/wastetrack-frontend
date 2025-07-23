import { AppointmentLocation } from '@/types';
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
  appointment_location: AppointmentLocation;
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
  assigned_collector_id: string | null; // null if no collector is assigned
  items: AssignCollectorItem[];
}

export interface WasteTransferStatusUpdateParams {
  status: 'collecting' | 'cancelled' | 'completed';
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
  appointment_location: AppointmentLocation;
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
  appointment_location: AppointmentLocation;
  assigned_collector_id: string;
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
  appointment_location: AppointmentLocation;
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

interface User {
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
}

// Updated main interface
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
  appointment_location: AppointmentLocation;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;
  notes: string;
  status: string;
  items: WasteTransferItems;
  assigned_collector_id?: string;
  created_at: string;
  updated_at: string;
  destination_user: User;
  source_user: User;
  distance: number; // Jarak dalam kilometer
}
export interface GetWasteTransferRequestsResponse {
  data: WasteTransferRequest[];
  paging: {
    page: number;
    size: number;
    total: number;
    total_pages: number;
  };
}

export interface GetWasteTransferRequestByIdResponse {
  data: WasteTransferRequest;
}
