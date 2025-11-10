import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/tenants/import-sample - Download sample CSV file for guest import
 */
export async function GET() {
  try {
    // Read the sample CSV file from public directory
    const filePath = join(process.cwd(), 'public', 'import-sample.csv');
    const csvContent = await readFile(filePath, 'utf-8');

    // Create response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': 'attachment; filename="import-sample.csv"',
        'Content-Length': Buffer.byteLength(csvContent).toString(),
      },
    });
  } catch (error) {
    console.error('Error reading sample file:', error);
    return NextResponse.json(
      { error: 'Failed to load sample file' },
      { status: 500 }
    );
  }
}
