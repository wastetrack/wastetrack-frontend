// ===========================================
// USER LIST TYPES & INTERFACES
// ===========================================

export interface UserListParams {
  page?: number;
  size?: number;
  role?: string;
  province?: string;
  institution?: string;
}

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: string;
  phone_number: string;
  institution: string;
  address: string;
  city: string;
  province: string;
  points: number;
  balance: number;
  location: {
    latitude: number;
    longitude: number;
  };
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  data: {
    users: UserListItem[];
    pagination: {
      page: number;
      size: number;
      total: number;
      total_pages: number;
    };
  };
  message?: string;
}

export interface FlatUserListResponse {
  data: UserListItem[];
  paging: {
    page: number;
    size: number;
    total_item: number;
    total_page: number;
  };
  message?: string;
}


// ===========================================
// INSTITUTION AUTOCOMPLETE TYPES
// ===========================================

export interface InstitutionSuggestion {
  id: string;
  institution: string;
  role: string;
  address: string;
  city: string;
  province: string;
}

export interface InstitutionSearchParams {
  role: string;
  query?: string;
  limit?: number;
}

export interface InstitutionSearchResponse {
  data: {
    institutions: InstitutionSuggestion[];
  };
  message?: string;
}
