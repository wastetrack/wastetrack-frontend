// Waste Type Types
export interface WasteType {
  id: string;
  category_id: string;
  name: string;
  description: string;
}

export interface WasteTypesListParams {
  page?: number;
  size?: number;
  category_id?: string;
  subcategory_id?: string;
}

export interface WasteTypesListResponse {
  success: boolean;
  message: string;
  data: {
    items: WasteType[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
  };
}

export interface WasteTypeDetailResponse {
  success: boolean;
  message: string;
  data: WasteType;
}
