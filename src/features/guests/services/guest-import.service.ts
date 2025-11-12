import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { IGuestImportRow } from './guest.types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const REQUIRED_COLUMNS = ['name', 'relationship', 'attendance'];
const VALID_ATTENDANCE_VALUES = ['yes', 'no', 'maybe'];

interface ParseResult {
  data: IGuestImportRow[];
  errors: Array<{ row: number; errors: string[] }>;
}

/**
 * Validates a single guest row from the import file
 */
export const validateGuestRow = (
  row: IGuestImportRow,
  rowIndex: number
): string[] => {
  const errors: string[] = [];

  // Validate name
  if (
    !row.name ||
    typeof row.name !== 'string' ||
    row.name.trim().length === 0
  ) {
    errors.push('Name is required');
  } else if (row.name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  // Validate relationship
  if (
    !row.relationship ||
    typeof row.relationship !== 'string' ||
    row.relationship.trim().length === 0
  ) {
    errors.push('Relationship is required');
  } else if (row.relationship.trim().length > 50) {
    errors.push('Relationship must not exceed 50 characters');
  }

  // Validate attendance
  if (!row.attendance || typeof row.attendance !== 'string') {
    errors.push('Attendance is required');
  } else {
    const attendanceLower = row.attendance.toLowerCase().trim();
    if (!VALID_ATTENDANCE_VALUES.includes(attendanceLower)) {
      errors.push(
        `Attendance must be one of: ${VALID_ATTENDANCE_VALUES.join(', ')}`
      );
    }
  }

  // Validate message (optional, but check length if provided)
  if (
    row.message &&
    typeof row.message === 'string' &&
    row.message.trim().length > 1000
  ) {
    errors.push('Message must not exceed 1000 characters');
  }

  return errors;
};

/**
 * Parses a CSV file and returns structured guest data with validation errors
 */
const parseCSVFile = (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results) => {
        const data: IGuestImportRow[] = [];
        const errors: Array<{ row: number; errors: string[] }> = [];

        // Check if required columns exist
        const headers = results.meta.fields || [];
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !headers.includes(col)
        );

        if (missingColumns.length > 0) {
          errors.push({
            row: 0,
            errors: [`Missing required columns: ${missingColumns.join(', ')}`],
          });
          resolve({ data: [], errors });
          return;
        }

        // Process each row
        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because index is 0-based and header is row 1

          const guestRow: IGuestImportRow = {
            name: row.name?.trim() || '',
            relationship: row.relationship?.trim() || '',
            attendance: row.attendance?.trim().toLowerCase() || '',
            message: row.message?.trim() || undefined,
          };

          const rowErrors = validateGuestRow(guestRow, rowNumber);

          if (rowErrors.length > 0) {
            errors.push({ row: rowNumber, errors: rowErrors });
          } else {
            data.push(guestRow);
          }
        });

        resolve({ data, errors });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [
            { row: 0, errors: [`Failed to parse CSV: ${error.message}`] },
          ],
        });
      },
    });
  });
};

/**
 * Parses an Excel file and returns structured guest data with validation errors
 */
const parseExcelFile = async (file: File): Promise<ParseResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return {
        data: [],
        errors: [{ row: 0, errors: ['Excel file is empty'] }],
      };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (jsonData.length === 0) {
      return {
        data: [],
        errors: [{ row: 0, errors: ['Excel file contains no data'] }],
      };
    }

    const data: IGuestImportRow[] = [];
    const errors: Array<{ row: number; errors: string[] }> = [];

    // Check if required columns exist (case-insensitive)
    const firstRow: any = jsonData[0];
    const headers = Object.keys(firstRow).map((h) => h.toLowerCase().trim());
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      errors.push({
        row: 0,
        errors: [`Missing required columns: ${missingColumns.join(', ')}`],
      });
      return { data: [], errors };
    }

    // Process each row
    jsonData.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // +2 because index is 0-based and header is row 1

      // Normalize keys to lowercase
      const normalizedRow: any = {};
      Object.keys(row).forEach((key) => {
        normalizedRow[key.toLowerCase().trim()] = row[key];
      });

      const guestRow: IGuestImportRow = {
        name: String(normalizedRow.name || '').trim(),
        relationship: String(normalizedRow.relationship || '').trim(),
        attendance: String(normalizedRow.attendance || '')
          .trim()
          .toLowerCase(),
        message: normalizedRow.message
          ? String(normalizedRow.message).trim()
          : undefined,
      };

      const rowErrors = validateGuestRow(guestRow, rowNumber);

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors });
      } else {
        data.push(guestRow);
      }
    });

    return { data, errors };
  } catch (error) {
    return {
      data: [],
      errors: [
        {
          row: 0,
          errors: [
            `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ],
        },
      ],
    };
  }
};

/**
 * Main function to parse guest import files (CSV or Excel)
 * Validates file format, size, and content
 */
export const parseGuestFile = async (file: File): Promise<ParseResult> => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      data: [],
      errors: [
        {
          row: 0,
          errors: [
            `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          ],
        },
      ],
    };
  }

  // Validate file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      data: [],
      errors: [
        {
          row: 0,
          errors: [
            `Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
          ],
        },
      ],
    };
  }

  // Parse based on file type
  if (fileName.endsWith('.csv')) {
    return parseCSVFile(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelFile(file);
  }

  return {
    data: [],
    errors: [{ row: 0, errors: ['Unsupported file format'] }],
  };
};
