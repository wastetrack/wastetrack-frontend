// Waste Category Types
export interface WasteCategory {
  id: string;
  name: string;
  description: string;
}

export interface WasteCategoriesListParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface WasteCategoriesListResponse {
  success: boolean;
  message: string;
  data: {
    items: WasteCategory[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
  };
}

export interface WasteCategoryDetailResponse {
  success: boolean;
  message: string;
  data: WasteCategory;
}
