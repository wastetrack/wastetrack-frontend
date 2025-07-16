export interface WasteDropRequestItem {
  id: string;
  request_id: string;
  waste_type_id: string;
  quantity: number;
  verified_weight: number;
  verified_subtotal: number;
}

export interface WasteDropRequestItemListParams {
  request_id: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PagingInfo {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
}

export interface WasteDropRequestItemListResponse {
  data: WasteDropRequestItem[];
  paging: PagingInfo;
}

export interface WasteDropRequestItemDetailResponse {
  data: WasteDropRequestItem;
}
