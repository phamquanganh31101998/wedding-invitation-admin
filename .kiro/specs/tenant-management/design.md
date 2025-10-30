# Tenant Management Design Document

## Overview

The Tenant Management feature provides a comprehensive administrative interface for managing wedding tenant spaces within the multi-tenant Wedding Invitation Administrator system. The design leverages the existing Next.js App Router architecture, Ant Design components, and Neon PostgreSQL database to deliver a scalable and user-friendly tenant management experience.

The system builds upon the existing tenant schema and extends it with enhanced management capabilities, status tracking, and theme configuration options while maintaining strict data isolation between tenants.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Tenant Management Pages                                    │
│  ├── /dashboard/tenants (List View with Create Form)        │
│  └── /dashboard/tenants/[id] (Detail View with Edit Form)   │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                 │
│  ├── /api/tenants (CRUD Operations)                         │
│  └── /api/tenants/[id] (Individual Tenant Operations)       │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├── Tenant Service (Business Rules)                        │
│  ├── Theme Service (Color Validation & Management)          │
│  └── Validation Service (Data Integrity)                    │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer                                          │
│  └── Tenant Repository (Database Operations)                │
├─────────────────────────────────────────────────────────────┤
│                    Neon PostgreSQL Database                 │
│  └── tenants (Enhanced Schema)                              │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

The existing tenants table already contains all necessary fields for tenant management:

```sql
-- No schema changes required
-- The current tenants table structure supports all tenant management features
-- Fields: id, slug, bride_name, groom_name, wedding_date, venue_name, venue_address,
--         venue_map_link, theme_primary_color, theme_secondary_color, is_active,
--         email, phone, created_at, updated_at
```

## Components and Interfaces

### Core Components

#### 1. TenantListPage Component

- **Purpose**: Display paginated list of all tenants with integrated creation form
- **Location**: `src/app/dashboard/tenants/page.tsx`
- **Features**:
  - Ant Design Table with sorting and pagination
  - Search by tenant slug, bride/groom names
  - Filter by status (active/inactive)
  - Quick actions (view)
  - Integrated create form in modal or drawer
  - Formik-based creation form with Yup validation
  - Real-time slug generation from bride/groom names

#### 2. TenantDetailView Component

- **Purpose**: Comprehensive view of tenant information with integrated editing
- **Location**: `src/app/dashboard/tenants/[id]/page.tsx`
- **Features**:
  - Tabbed interface (Overview, Theme, RSVPs)
  - Status management controls
  - Inline editing capabilities for all tenant fields
  - Pre-populated edit forms with current values
  - Theme preview functionality
  - Validation with conflict detection

### TypeScript Interfaces

```typescript
interface Tenant {
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

interface TenantCreateRequest {
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

interface TenantUpdateRequest extends Partial<TenantCreateRequest> {
  is_active?: boolean;
}

interface TenantListResponse {
  tenants: Tenant[];
  total: number;
  page: number;
  limit: number;
}
```

## Data Models

### Tenant Service Layer

```typescript
class TenantService {
  // Core CRUD operations
  async createTenant(data: TenantCreateRequest): Promise<Tenant>;
  async getTenantById(id: number): Promise<Tenant | null>;
  async getTenantBySlug(slug: string): Promise<Tenant | null>;
  async updateTenant(id: number, data: TenantUpdateRequest): Promise<Tenant>;
  async deleteTenant(id: number): Promise<void>;

  // List and search operations
  async listTenants(
    filters: TenantFilters,
    pagination: Pagination
  ): Promise<TenantListResponse>;
  async searchTenants(query: string): Promise<Tenant[]>;

  // Status management
  async updateTenantStatus(id: number, isActive: boolean): Promise<Tenant>;
  async deactivateTenant(id: number): Promise<Tenant>;
  async reactivateTenant(id: number): Promise<Tenant>;

  // Utility methods
  async generateUniqueSlug(
    brideName: string,
    groomName: string
  ): Promise<string>;
  async validateTenantData(
    data: TenantCreateRequest | TenantUpdateRequest
  ): Promise<ValidationResult>;
}
```

### Repository Pattern

```typescript
class TenantRepository {
  async create(tenant: TenantCreateRequest): Promise<Tenant>;
  async findById(id: number): Promise<Tenant | null>;
  async findBySlug(slug: string): Promise<Tenant | null>;
  async update(id: number, data: TenantUpdateRequest): Promise<Tenant>;
  async delete(id: number): Promise<void>;
  async findMany(
    filters: TenantFilters,
    pagination: Pagination
  ): Promise<TenantListResponse>;
  async updateStatus(id: number, isActive: boolean): Promise<Tenant>;
}
```

## Error Handling

### Error Types and Responses

```typescript
enum TenantErrorCode {
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  DUPLICATE_SLUG = 'DUPLICATE_SLUG',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

interface TenantError {
  code: TenantErrorCode;
  message: string;
  details?: Record<string, any>;
}
```

### Error Handling Strategy

1. **API Level**: Standardized error responses with appropriate HTTP status codes
2. **Service Level**: Business logic validation with detailed error messages
3. **Repository Level**: Database constraint handling and connection error management
4. **UI Level**: User-friendly error messages with actionable guidance

### Validation Rules

- **Bride/Groom Names**: Required, 2-100 characters, no special characters except hyphens and apostrophes
- **Wedding Date**: Required, must be a valid future date (with option to override for past events)
- **Venue Information**: Venue name required (2-200 characters), address required
- **Theme Colors**: Valid hex color codes, contrast validation for accessibility
- **Contact Information**: Valid email format, phone number format validation
- **Slug Generation**: Automatic generation with uniqueness validation and conflict resolution
