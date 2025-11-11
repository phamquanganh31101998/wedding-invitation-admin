# Import Result Download Feature

## Overview

Updated the guest import feature to return an Excel file with two sheets containing success and failed rows, and added a download button in the UI.

## Changes Made

### 1. API Route (`src/app/api/tenants/[id]/guests/import/route.ts`)

- Added `xlsx` library import
- Modified the import logic to track success and failed rows separately
- Create an Excel workbook with two sheets:
  - **Success sheet**: Contains all successfully imported guests
  - **Failed sheet**: Contains all failed rows with error messages
- Return the Excel file as a blob with custom headers:
  - `X-Import-Success`: Number of successfully imported guests
  - `X-Import-Failed`: Number of failed imports
  - `Content-Disposition`: Filename for download

### 2. Guest Requests (`src/features/guests/services/guest.requests.ts`)

- Updated `importGuests` function to:
  - Handle blob response instead of JSON
  - Extract import statistics from response headers
  - Return both statistics and the result file blob

### 3. Guest Import Modal (`src/features/guests/components/GuestImportModal.tsx`)

- Added `resultFile` to the import result state
- Created `handleDownloadResult` function to download the Excel file
- Updated the UI to show:
  - Number of successfully imported guests
  - Number of failed imports
  - A "Download import result" link button
  - Helper text explaining the file contains two sheets

## How It Works

1. User uploads a CSV/Excel file
2. API processes the file and attempts to import each row
3. API creates an Excel file with two sheets:
   - Success: All rows that were imported successfully
   - Failed: All rows that failed with error messages
4. API returns the Excel file with statistics in headers
5. UI displays the statistics and provides a download button
6. User can download the result file to review what succeeded and what failed

## File Format

The result Excel file contains:

**Success Sheet:**

- name
- relationship
- attendance
- message

**Failed Sheet:**

- name
- relationship
- attendance
- message
- error (reason for failure)

## Benefits

- Users can easily see which guests were imported successfully
- Failed rows include error messages for easy debugging
- Users can fix failed rows and re-import them
- Complete audit trail of the import process
