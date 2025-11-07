export interface IGuest {
  id: number;
  tenantId: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGuestCreateRequest {
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
}

export interface IGuestUpdateRequest {
  name?: string;
  relationship?: string;
  attendance?: 'yes' | 'no' | 'maybe';
  message?: string;
}

export interface IGuestListParams {
  page?: number;
  limit?: number;
  attendance?: 'yes' | 'no' | 'maybe';
  search?: string;
}

export interface IGuestListResponse {
  guests: IGuest[];
  total: number;
  page: number;
  limit: number;
}

export interface IGuestStats {
  total: number;
  attending: number;
  notAttending: number;
  maybe: number;
}

export interface IGuestImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    errors: string[];
  }>;
}

export interface IGuestImportRow {
  name: string;
  relationship: string;
  attendance: string;
  message?: string;
}
