// Types & Interfaces for Collector Management
export type CollectorStatus = 'active' | 'inactive';

export interface CollectorManagement {
  id: string;
  waste_bank_id: string;
  collector_id: string;
  status: CollectorStatus;
  collector?: {
    id: string;
    username: string;
    email: string;
    phone_number?: string;
    avatar_url?: string;
    address?: string;
    city?: string;
    province?: string;
  };
}

export interface CollectorManagementResponse {
  success: boolean;
  message: string;
  data: {
    collector_management: CollectorManagement;
  };
}

export interface CollectorManagementListResponse {
  success: boolean;
  message: string;
  data: {
    collector_managements: CollectorManagement[];
    pagination?: {
      page: number;
      size: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface CollectorManagementParams {
  waste_bank_id?: string;
  collector_id?: string;
  status?: CollectorStatus;
  page?: number;
  size?: number;
}

export interface CreateCollectorManagementRequest {
  waste_bank_id: string;
  collector_id: string;
  status?: CollectorStatus;
}

export interface UpdateCollectorManagementRequest {
  status: CollectorStatus;
}
