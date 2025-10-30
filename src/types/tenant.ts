// Tenant Management Types and Interfaces

// Database types (snake_case) - used by repositories and services
export interface Tenant {
  id: number;
  slug: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  venue_map_link?: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  is_active: boolean;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantCreateRequest {
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  venue_map_link?: string;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  email?: string;
  phone?: string;
}

export interface TenantUpdateRequest extends Partial<TenantCreateRequest> {
  is_active?: boolean;
}

// Frontend types (camelCase) - used by UI components
export interface TenantUI {
  id: number;
  slug: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueMapLink?: string;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  isActive: boolean;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCreateRequestUI {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueMapLink?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  email?: string;
  phone?: string;
}

export interface TenantUpdateRequestUI extends Partial<TenantCreateRequestUI> {
  isActive?: boolean;
}

export interface TenantListResponse {
  tenants: Tenant[];
  total: number;
  page: number;
  limit: number;
}

export interface TenantFilters {
  search?: string;
  is_active?: boolean;
  wedding_date_from?: string;
  wedding_date_to?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export enum TenantErrorCode {
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  DUPLICATE_SLUG = 'DUPLICATE_SLUG',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CROSS_TENANT_ACCESS_DENIED = 'CROSS_TENANT_ACCESS_DENIED',
}

export interface TenantError {
  code: TenantErrorCode;
  message: string;
  details?: Record<string, any>;
}
