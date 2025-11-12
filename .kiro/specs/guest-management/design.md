# Guest Management Feature Design

## Overview

The Guest Management feature provides a comprehensive interface for administrators to manage wedding guest lists within the multi-tenant wedding invitation system. The feature integrates seamlessly into the existing tenant detail page as a dedicated tab, following the established architectural patterns of the application.

This design leverages the existing secure repository pattern, React Query for data management, and Ant Design components for the UI. The feature supports CRUD operations, bulk import/export via CSV and Excel files, filtering, searching, and real-time statistics display.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tenant Detail Page                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Guest Management Tab                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Guest Statistics Summary                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │    Actions: Add, Import, Export, Search         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Guest List Table (Paginated)            │  │  │
│  │  │    - Name, Relationship, Attendance, Message    │  │  │
│  │  │    - Actions: Edit, Delete                      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│  - GuestsTab Component                                    │
│  - GuestForm Modal                                        │
│  - GuestImportModal                                       │
│  - GuestStatistics Component                              │
│  - GuestTable Component                                   │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                    Service Layer                          │
│  - guest.hooks.ts (React Query hooks)                    │
│  - guest.requests.ts (API calls)                         │
│  - guest.types.ts (TypeScript interfaces)                │
│  - guest.constants.ts (Query keys, constants)            │
│  - guest-import.service.ts (File parsing)                │
│  - guest-export.service.ts (File generation)             │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                    API Layer                              │
│  - /api/tenants/[id]/guests (GET, POST)                 │
│  - /api/tenants/[id]/guests/[guestId] (GET, PUT, DELETE)│
│  - /api/tenants/[id]/guests/stats (GET)                 │
│  - /api/tenants/[id]/guests/import (POST)               │
│  - /api/tenants/[id]/guests/export (GET)                │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                Repository Layer (Existing)                │
│  - SecureGuestRepository                                  │
│  - Tenant-based data isolation                           │
│  - Security context validation                           │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                    Database Layer                         │
│  - guests table (PostgreSQL via Neon)                    │
└──────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. GuestsTab (Main Container)

**Location**: `src/features/tenants/components/TenantDetailTabs/GuestsTab/GuestsTab.tsx`

**Responsibilities**:

- Orchestrate all guest management functionality
- Display guest statistics summary
- Render guest table with pagination
- Handle search and filter state
- Coordinate modals for add, edit, import

**Props**:

```typescript
interface GuestsTabProps {
  tenantId: number;
}
```

**State Management**:

- Uses React Query hooks for data fetching
- Local state for search/filter parameters
- Modal visibility states

#### 2. GuestStatistics

**Location**: `src/features/tenants/components/TenantDetailTabs/GuestsTab/GuestStatistics.tsx`

**Responsibilities**:

- Display attendance statistics (yes, no, maybe counts)
- Show total guest count
- Visual representation using Ant Design Statistic components

**Props**:

```typescript
interface GuestStatisticsProps {
  tenantId: number;
}
```

#### 3. GuestTable

**Location**: `src/features/tenants/components/TenantDetailTabs/GuestsTab/GuestTable.tsx`

**Responsibilities**:

- Render paginated guest list
- Provide row-level actions (edit, delete)
- Display loading and empty states

**Props**:

```typescript
interface GuestTableProps {
  tenantId: number;
  guests: IGuest[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (guest: IGuest) => void;
  onDelete: (guest: IGuest) => void;
}
```

#### 4. GuestFormModal

**Location**: `src/features/tenants/components/TenantDetailTabs/GuestsTab/GuestFormModal.tsx`

**Responsibilities**:

- Create and edit guest forms
- Form validation using Formik and Yup
- Handle form submission

**Props**:

```typescript
interface GuestFormModalProps {
  tenantId: number;
  guest?: IGuest; // undefined for create, defined for edit
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Form Fields**:

- Name (required, max 100 chars)
- Relationship (required, max 50 chars)
- Attendance (required, select: yes/no/maybe)
- Message (optional, textarea)

#### 5. GuestImportModal

**Location**: `src/features/tenants/components/TenantDetailTabs/GuestsTab/GuestImportModal.tsx`

**Responsibilities**:

- File upload interface
- Display import preview
- Show validation errors
- Display import results

**Props**:

```typescript
interface GuestImportModalProps {
  tenantId: number;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

### Service Layer

#### guest.types.ts

```typescript
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
```

#### guest.constants.ts

```typescript
export const guestKeys = {
  all: ['guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (tenantId: number, params?: IGuestListParams) =>
    [...guestKeys.lists(), tenantId, params] as const,
  details: () => [...guestKeys.all, 'detail'] as const,
  detail: (tenantId: number, guestId: number) =>
    [...guestKeys.details(), tenantId, guestId] as const,
  stats: (tenantId: number) => [...guestKeys.all, 'stats', tenantId] as const,
};

export const GUEST_ATTENDANCE_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Maybe', value: 'maybe' },
];

export const IMPORT_FILE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const IMPORT_ACCEPTED_FORMATS = ['.csv', '.xlsx', '.xls'];
```

#### guest.requests.ts

```typescript
// GET /api/tenants/[id]/guests
export const getGuestList = async (
  tenantId: number,
  params?: IGuestListParams
): Promise<IGuestListResponse>;

// POST /api/tenants/[id]/guests
export const createGuest = async (
  tenantId: number,
  data: IGuestCreateRequest
): Promise<IGuest>;

// GET /api/tenants/[id]/guests/[guestId]
export const getGuestDetail = async (
  tenantId: number,
  guestId: number
): Promise<IGuest>;

// PUT /api/tenants/[id]/guests/[guestId]
export const updateGuest = async (
  tenantId: number,
  guestId: number,
  data: IGuestUpdateRequest
): Promise<IGuest>;

// DELETE /api/tenants/[id]/guests/[guestId]
export const deleteGuest = async (
  tenantId: number,
  guestId: number
): Promise<void>;

// GET /api/tenants/[id]/guests/stats
export const getGuestStats = async (
  tenantId: number
): Promise<IGuestStats>;

// POST /api/tenants/[id]/guests/import
export const importGuests = async (
  tenantId: number,
  file: File
): Promise<IGuestImportResult>;

// GET /api/tenants/[id]/guests/export
export const exportGuests = async (
  tenantId: number,
  params?: IGuestListParams
): Promise<Blob>;
```

#### guest.hooks.ts

```typescript
// Fetch guest list with pagination and filters
export const useGetGuestList = (
  tenantId: number,
  params?: IGuestListParams
);

// Fetch guest statistics
export const useGetGuestStats = (tenantId: number);

// Create guest mutation
export const useCreateGuest = (tenantId: number);

// Update guest mutation
export const useUpdateGuest = (tenantId: number);

// Delete guest mutation
export const useDeleteGuest = (tenantId: number);

// Import guests mutation
export const useImportGuests = (tenantId: number);

// Export guests (trigger download)
export const useExportGuests = (tenantId: number);
```

#### guest-import.service.ts

**Responsibilities**:

- Parse CSV files using PapaParse library
- Parse Excel files using xlsx library
- Validate file format and size
- Validate each row against schema
- Return structured import data with errors

**Key Functions**:

```typescript
export const parseGuestFile = async (
  file: File
): Promise<{
  data: IGuestImportRow[];
  errors: Array<{ row: number; errors: string[] }>;
}>;

export const validateGuestRow = (
  row: IGuestImportRow,
  rowIndex: number
): string[];
```

#### guest-export.service.ts

**Responsibilities**:

- Generate Excel files using xlsx library
- Format guest data for export
- Include tenant information in export
- Generate descriptive filename

**Key Functions**:

```typescript
export const generateGuestExport = (
  guests: IGuest[],
  tenantInfo: { brideName: string; groomName: string; weddingDate: string }
): Blob;

export const downloadGuestExport = (blob: Blob, filename: string): void;
```

### API Routes

#### GET /api/tenants/[id]/guests

**Purpose**: List guests with pagination and filters
**Handler**: Existing route at `src/app/api/tenants/[id]/guests/route.ts`
**Query Parameters**:

- page (number)
- limit (number)
- attendance (yes|no|maybe)
- search (string)

**Response**:

```json
{
  "success": true,
  "data": {
    "guests": [...],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /api/tenants/[id]/guests

**Purpose**: Create a new guest
**Handler**: Existing route at `src/app/api/tenants/[id]/guests/route.ts`
**Request Body**:

```json
{
  "name": "John Doe",
  "relationship": "Friend",
  "attendance": "yes",
  "message": "Looking forward to it!"
}
```

#### GET /api/tenants/[id]/guests/stats

**Purpose**: Get guest statistics
**Handler**: Existing route at `src/app/api/tenants/[id]/guests/stats/route.ts`
**Response**:

```json
{
  "success": true,
  "data": {
    "total": 100,
    "attending": 75,
    "notAttending": 15,
    "maybe": 10
  }
}
```

#### GET /api/tenants/[id]/guests/[guestId]

**Purpose**: Get single guest details
**Handler**: Existing route at `src/app/api/tenants/[id]/guests/[guestId]/route.ts`

#### PUT /api/tenants/[id]/guests/[guestId]

**Purpose**: Update guest information
**Handler**: Existing route at `src/app/api/tenants/[id]/guests/[guestId]/route.ts`

#### DELETE /api/tenants/[id]/guests/[guestId]

**Purpose**: Delete a guest
**Handler**: Existing route at `src/app/api/tenants/[id]/guests/[guestId]/route.ts`

#### POST /api/tenants/[id]/guests/import

**Purpose**: Import guests from CSV/Excel file
**Handler**: New route to be created
**Request**: multipart/form-data with file
**Response**:

```json
{
  "success": true,
  "data": {
    "imported": 95,
    "failed": 5,
    "errors": [
      {
        "row": 3,
        "errors": ["Invalid attendance value"]
      }
    ]
  }
}
```

#### GET /api/tenants/[id]/guests/export

**Purpose**: Export guests to Excel file
**Handler**: New route to be created
**Query Parameters**: Same as list endpoint (for filtering)
**Response**: Excel file download

## Data Models

### Guest Model (Database)

Already defined in schema.sql:

```sql
CREATE TABLE guests (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  attendance VARCHAR(10) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT guests_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT guests_attendance_check
    CHECK (attendance IN ('yes', 'no', 'maybe'))
);
```

### Guest Interface (TypeScript)

Already defined in SecureGuestRepository:

```typescript
interface Guest {
  id: number;
  tenant_id: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
  created_at: string;
  updated_at: string;
}
```

### Import File Format

**CSV Format**:

```csv
name,relationship,attendance,message
John Doe,Friend,yes,Looking forward to it!
Jane Smith,Family,no,
Bob Johnson,Colleague,maybe,Will try to make it
```

**Excel Format**:
Same columns as CSV, with headers in first row.

## Error Handling

### Frontend Error Handling

- Use Ant Design message component for user feedback
- Display validation errors inline in forms
- Show error states in tables and statistics
- Provide retry mechanisms for failed operations

### API Error Handling

- Leverage existing TenantErrorCode enum
- Return structured error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid guest data"
  }
}
```

### Import Error Handling

- Validate file format before parsing
- Collect all row-level errors
- Allow partial imports (import valid rows, report errors)
- Provide detailed error messages with row numbers

### Common Error Scenarios

1. **Authentication Errors**: 401 - User not authenticated
2. **Authorization Errors**: 403 - User cannot access tenant
3. **Validation Errors**: 400 - Invalid input data
4. **Not Found Errors**: 404 - Guest or tenant not found
5. **Database Errors**: 500 - Database operation failed
6. **File Upload Errors**: 400 - Invalid file format or size

## Testing Strategy

### Unit Testing Focus

- Validation functions in guest-import.service.ts
- Data transformation functions in guest-export.service.ts
- Form validation schemas

### Integration Testing Focus

- API route handlers with mock database
- File upload and parsing flow
- Export file generation

### Manual Testing Checklist

- Create guest with all fields
- Create guest with minimal fields
- Edit guest information
- Delete guest
- Search guests by name
- Filter guests by attendance
- Import CSV file with valid data
- Import CSV file with errors
- Import Excel file
- Export guests to Excel
- Pagination functionality
- Statistics accuracy

## Security Considerations

### Tenant Isolation

- All operations enforce tenant_id from URL
- SecureGuestRepository validates tenant access
- No cross-tenant data leakage

### Authentication

- All routes require NextAuth session
- Session validation in every API handler

### Input Validation

- Server-side validation for all inputs
- SQL injection prevention via parameterized queries
- File upload size limits (5MB)
- File type validation (CSV, XLSX, XLS only)

### Data Sanitization

- Use existing sanitizeQueryParams from tenant-security
- Escape special characters in search queries
- Validate attendance enum values

## Performance Considerations

### Database Optimization

- Existing indexes on tenant_id and attendance
- Pagination to limit result sets
- Efficient COUNT queries for statistics

### Frontend Optimization

- React Query caching for guest lists
- Debounced search input
- Lazy loading for large guest lists
- Optimistic updates for mutations

### File Processing

- Stream processing for large CSV files
- Chunked imports for better UX
- Background processing for exports (if needed)

## Dependencies

### New Dependencies to Add

```json
{
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.7",
  "xlsx": "^0.18.5"
}
```

### Existing Dependencies Used

- @tanstack/react-query (data fetching)
- antd (UI components)
- formik (form management)
- yup (validation)
- next-auth (authentication)

## Implementation Notes

### Integration with Existing Code

1. Add GuestsTab to TenantDetailTabs component
2. Follow existing patterns from FilesTab and OverviewTab
3. Use existing SecureGuestRepository (no changes needed)
4. Leverage existing API routes where possible

### File Structure

```
src/features/tenants/components/TenantDetailTabs/GuestsTab/
├── GuestsTab.tsx
├── GuestStatistics.tsx
├── GuestTable.tsx
├── GuestFormModal.tsx
├── GuestImportModal.tsx
└── index.ts

src/features/guests/services/
├── guest.types.ts
├── guest.constants.ts
├── guest.requests.ts
├── guest.hooks.ts
├── guest-import.service.ts
├── guest-export.service.ts
└── index.ts

src/app/api/tenants/[id]/guests/
├── import/
│   └── route.ts
└── export/
    └── route.ts
```

### Reusable Components

- Leverage existing FileUpload component pattern
- Use DashboardBreadcrumb pattern for navigation
- Follow EditableField pattern from OverviewTab

## Future Enhancements (Out of Scope)

- Bulk email invitations to guests
- QR code generation for guests
- Guest check-in functionality
- Guest dietary preferences
- Plus-one guest management
- Guest seating arrangements
