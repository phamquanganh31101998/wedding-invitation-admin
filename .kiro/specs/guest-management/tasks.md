# Implementation Plan

## Backend Infrastructure (Already Complete)

✅ Database schema for guests table exists
✅ SecureGuestRepository with full CRUD operations implemented
✅ API routes for basic guest operations (GET, POST, PUT, DELETE) implemented
✅ API route for guest statistics implemented
✅ Tenant isolation and security validation in place

## Frontend Implementation Tasks

- [x] 1. Create guest services layer
  - Create TypeScript types and interfaces for guest data
  - Implement API request functions for all guest endpoints
  - Create React Query hooks for data fetching and mutations
  - Define query keys and constants for caching
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 1.1 Create guest.types.ts
  - Define IGuest, IGuestCreateRequest, IGuestUpdateRequest interfaces
  - Define IGuestListParams, IGuestListResponse, IGuestStats interfaces
  - Define IGuestImportResult and IGuestImportRow interfaces for import/export
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.1, 8.1_

- [x] 1.2 Create guest.constants.ts
  - Define React Query keys for guest data caching
  - Define GUEST_ATTENDANCE_OPTIONS constant
  - Define import file size and format constants
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.8, 7.9_

- [x] 1.3 Create guest.requests.ts
  - Implement getGuestList function for fetching paginated guests
  - Implement createGuest, updateGuest, deleteGuest functions
  - Implement getGuestStats function
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 1.4 Create guest.hooks.ts
  - Implement useGetGuestList hook with React Query
  - Implement useGetGuestStats hook
  - Implement useCreateGuest, useUpdateGuest, useDeleteGuest mutation hooks
  - Configure proper cache invalidation on mutations
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 2. Create GuestsTab main container component
  - Create GuestsTab component that orchestrates all guest functionality
  - Implement state management for search, filters, and pagination
  - Integrate guest statistics display
  - Integrate guest table with actions
  - Handle modal visibility states for add/edit/import
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 3. Create GuestStatistics component
  - Display total guest count
  - Display attendance breakdown (yes, no, maybe counts)
  - Use Ant Design Statistic components for visual presentation
  - Handle loading and error states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 9.4_

- [x] 4. Create GuestTable component
  - Implement table with columns: name, relationship, attendance, message, timestamps
  - Add sortable columns functionality
  - Implement pagination controls
  - Add row-level action buttons (edit, delete)
  - Display loading skeleton during data fetch
  - Show empty state when no guests exist
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.2, 9.5_

- [x] 5. Create GuestFormModal component
  - Create modal for adding and editing guests
  - Implement form with Formik and Yup validation
  - Add form fields: name (required), relationship (required), attendance (required), message (optional)
  - Validate name length (1-100 chars) and relationship length (1-50 chars)
  - Handle form submission with proper error handling
  - Show success/error messages using Ant Design message component
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.5, 3.6, 9.3_

- [x] 6. Implement search and filter functionality
  - Add search input for filtering by name or relationship
  - Add attendance filter dropdown
  - Implement debounced search to reduce API calls
  - Update GuestsTab to pass filters to guest list query
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7. Create import/export infrastructure
  - Install required dependencies: papaparse, @types/papaparse, xlsx
  - Create guest-import.service.ts for parsing CSV/Excel files
  - Create guest-export.service.ts for generating Excel files
  - _Requirements: 7.1, 7.2, 7.8, 7.9, 8.1, 8.2, 8.3_

- [x] 7.1 Implement guest-import.service.ts
  - Create parseGuestFile function to handle CSV and Excel parsing
  - Implement validateGuestRow function for row-level validation
  - Validate file format and size (5MB limit)
  - Return structured data with validation errors
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 7.9_

- [x] 7.2 Implement guest-export.service.ts
  - Create generateGuestExport function using xlsx library
  - Format guest data with proper columns
  - Include tenant wedding information in export
  - Generate descriptive filename with tenant names and date
  - Implement downloadGuestExport helper function
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 8. Create API routes for import/export
  - Create POST /api/tenants/[id]/guests/import route
  - Create GET /api/tenants/[id]/guests/export route
  - Implement file upload handling with multipart/form-data
  - Implement Excel file generation and download response
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 8.1 Create import API route
  - Handle multipart/form-data file upload
  - Parse uploaded file using guest-import.service
  - Validate all rows before importing
  - Create guest records for valid rows using SecureGuestRepository
  - Return import summary with success/failure counts and error details
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 8.2 Create export API route
  - Fetch guests using SecureGuestRepository with applied filters
  - Fetch tenant information for export metadata
  - Generate Excel file using guest-export.service
  - Return file as downloadable blob with proper headers
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 9. Create GuestImportModal component
  - Create modal with file upload interface
  - Display file format requirements and size limits
  - Show import preview after file selection
  - Display validation errors with row numbers
  - Show import results (success/failure counts)
  - Trigger guest list refresh on successful import
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 9.3_

- [x] 10. Add export functionality to GuestsTab
  - Add export button to GuestsTab actions
  - Implement useExportGuests hook in guest.hooks.ts
  - Trigger file download on export button click
  - Apply current filters to export
  - Show loading state during export generation
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.3_

- [x] 11. Integrate GuestsTab into TenantDetailTabs
  - Add GuestsTab to the tab items array in TenantDetailTabs component
  - Pass tenantId prop to GuestsTab
  - Position Guests tab between Files and Settings tabs
  - _Requirements: 9.1_

- [x] 12. Add delete confirmation and error handling
  - Implement confirmation modal before deleting guests
  - Add error boundaries for graceful error handling
  - Display user-friendly error messages for all operations
  - Implement retry mechanisms for failed operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.6_

- [x] 13. Implement optimistic updates and loading states
  - Add optimistic updates for create, update, delete mutations
  - Show loading skeletons in table during data fetch
  - Display loading indicators in statistics cards
  - Show loading states in modals during form submission
  - _Requirements: 1.5, 5.4, 9.5_

- [x] 14. Polish UI and responsive design
  - Ensure all components are responsive on mobile and tablet
  - Apply consistent spacing and styling using Ant Design
  - Add proper loading states and transitions
  - Implement proper empty states with helpful messages
  - Add tooltips and help text where needed
  - _Requirements: 1.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
