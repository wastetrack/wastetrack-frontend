import { WasteType } from './waste-type';

// ==================================
// GET
// ==================================
export interface StorageItemListParams {
  storage_id?: string;
  waste_type_id?: string;
  order_by_weight_kgs?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface StorageItemListResponse {
  data: StorageItem[];
  paging: {
    page: number;
    size: number;
    total_item: number;
    total_pages: number;
  };
}

export interface StorageItem {
  id: string;
  storage_id: string;
  waste_type_id: string;
  weight_kgs: number;
  created_at: string;
  updated_at: string;
  waste_type: WasteType;
}

export interface StorageItemDetailResponse {
  data: StorageItem;
}

// ===================================
// POST PUT WASTEBANK STORAGE ITEM
// ===================================
// Interface untuk create storage item (POST)
export interface CreateStorageItemParams {
  storage_id: string;
  waste_type_id: string;
  weight_kgs: number;
}

// Interface untuk update storage item (PUT)
export interface UpdateStorageItemParams {
  storage_id: string;
  weight_kgs: number;
}

// Interface untuk deduct weight (PUT deduct-weight)
export interface DeductWeightParams {
  storage_id: string;
  weight_kgs: number;
}

// Interface untuk response storage item
export interface StorageItemResponse {
  id: string;
  storage_id: string;
  waste_type_id: string;
  weight_kgs: number;
  created_at?: string;
  updated_at?: string;
}

// Interface untuk API responses
export interface CreateStorageItemResponse {
  message?: string;
  data: StorageItemResponse;
}

export interface UpdateStorageItemResponse {
  message?: string;
  data: StorageItemResponse;
}

export interface DeductWeightResponse {
  message?: string;
  data: StorageItemResponse;
}

export interface DeleteStorageItemResponse {
  message?: string;
}
