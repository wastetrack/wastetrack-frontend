// Waste Price Types
export interface WastePrice {
  id: string;
  waste_type_id: string;
  waste_bank_id: string;
  custom_price_per_kgs: number;
  created_at: string;
  updated_at: string;
  waste_type?: {
    id: string;
    name: string;
    category_id: string;
    description: string;
    waste_category?: {
      id: string;
      name: string;
      description: string;
    };
  };
  waste_bank?: {
    id: string;
    name: string;
    // other user fields
  };
}

export interface WastePricesListParams {
  page?: number;
  size?: number;
  waste_bank_id?: string;
  waste_type_id?: string;
}

export interface WastePricesListResponse {
  success: boolean;
  message: string;
  data: {
    items: WastePrice[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
  };
}

// Alternative response type for when API returns data directly as array
export interface WastePricesArrayResponse {
  success: boolean;
  message: string;
  data: WastePrice[];
}

export interface WastePriceDetailResponse {
  success: boolean;
  message: string;
  data: WastePrice;
}

export interface CreateWastePriceRequest {
  waste_type_id: string;
  waste_bank_id: string;
  custom_price_per_kgs: number;
}

export interface UpdateWastePriceRequest {
  custom_price_per_kgs?: number;
}

export interface CreateWastePriceResponse {
  success: boolean;
  message: string;
  data: WastePrice;
}

export interface UpdateWastePriceResponse {
  success: boolean;
  message: string;
  data: WastePrice;
}

export interface DeleteWastePriceResponse {
  success: boolean;
  message: string;
}
