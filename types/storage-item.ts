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
}

export interface StorageItemDetailResponse {
  data: StorageItem;
}
