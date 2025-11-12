import * as XLSX from 'xlsx';
import { IGuest } from './guest.types';

interface TenantInfo {
  brideName: string;
  groomName: string;
  weddingDate: string;
}

/**
 * Formats a date string for use in filenames
 */
const formatDateForFilename = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return 'unknown-date';
  }
};

/**
 * Formats a date-time string for display in Excel
 */
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

/**
 * Generates an Excel file from guest data
 * Includes tenant wedding information and properly formatted columns
 */
export const generateGuestExport = (
  guests: IGuest[],
  tenantInfo: TenantInfo
): Blob => {
  // Prepare data for Excel export
  const exportData = guests.map((guest) => ({
    Name: guest.name,
    Relationship: guest.relationship,
    Attendance:
      guest.attendance.charAt(0).toUpperCase() + guest.attendance.slice(1),
    Message: guest.message || '',
    'Created At': formatDateTime(guest.createdAt),
    'Updated At': formatDateTime(guest.updatedAt),
  }));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Add wedding information as a separate sheet
  const infoData = [
    ['Wedding Information'],
    ['Bride', tenantInfo.brideName],
    ['Groom', tenantInfo.groomName],
    ['Wedding Date', tenantInfo.weddingDate],
    [''],
    ['Export Date', new Date().toLocaleString('en-US')],
    ['Total Guests', guests.length.toString()],
  ];

  const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Wedding Info');

  // Add guest data as the main sheet
  const guestSheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 25 }, // Name
    { wch: 20 }, // Relationship
    { wch: 12 }, // Attendance
    { wch: 40 }, // Message
    { wch: 20 }, // Created At
    { wch: 20 }, // Updated At
  ];
  guestSheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, guestSheet, 'Guest List');

  // Generate Excel file as array buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  // Convert to Blob
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

/**
 * Generates a descriptive filename for the export
 * Format: {BrideName}-{GroomName}-Guests-{Date}.xlsx
 */
export const generateExportFilename = (tenantInfo: TenantInfo): string => {
  const brideName = tenantInfo.brideName.replace(/\s+/g, '-');
  const groomName = tenantInfo.groomName.replace(/\s+/g, '-');
  const exportDate = formatDateForFilename(new Date().toISOString());

  return `${brideName}-${groomName}-Guests-${exportDate}.xlsx`;
};

/**
 * Triggers a download of the Excel file in the browser
 */
export const downloadGuestExport = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
