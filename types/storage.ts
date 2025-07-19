// ===================================
// GET
// ===================================
export interface StorageListParams {
  user_id?: string;
  is_for_recycled_material?: boolean;
  page?: number;
  size?: number;
}

export interface StorageListResponse {
  data: Storage[];
  paging: {
    page: number;
    size: number;
    total_item: number;
    total_pages: number;
  };
}

export interface Storage {
  id: string;
  user_id: string;
  length: number; // in mm
  width: number; // in mm
  height: number; // in mm
  is_for_recycled_material: boolean;
}

export interface StorageDetailResponse {
  data: Storage;
}
