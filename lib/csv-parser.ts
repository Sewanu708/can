// lib/csv-parser.ts
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

export interface ParseOptions {
  maxRows?: number;
  skipEmptyLines?: boolean;
}

/**
 * Parse CSV file from a stream
 */
export async function parseCSVStream(
  stream: Readable,
  onRow: (row: Record<string, any>, index: number) => void | Promise<void>,
  options: ParseOptions = {}
): Promise<{ totalRows: number; columns: string[] }> {
  return new Promise((resolve, reject) => {
    const parser = parse({
      columns: true, // Use first row as column names
      skip_empty_lines: options.skipEmptyLines !== false,
      trim: true,
    });

    let totalRows = 0;
    let columns: string[] = [];

    parser.on('readable', async function () {
      let row;
      while ((row = parser.read()) !== null) {
        if (totalRows === 0) {
          columns = Object.keys(row);
        }

        if (options.maxRows && totalRows >= options.maxRows) {
          parser.destroy();
          break;
        }

        await onRow(row, totalRows);
        totalRows++;
      }
    });

    parser.on('error', (err) => reject(err));
    parser.on('end', () => resolve({ totalRows, columns }));

    stream.pipe(parser);
  });
}

/**
 * Parse entire CSV into memory (for smaller files)
 */
export async function parseCSV(
  stream: Readable
): Promise<{ rows: Record<string, any>[]; columns: string[] }> {
  const rows: Record<string, any>[] = [];
  let columns: string[] = [];

  await parseCSVStream(stream, (row, index) => {
    if (index === 0) {
      columns = Object.keys(row);
    }
    rows.push(row);
  });

  return { rows, columns };
}

/**
 * Parse Excel file from buffer
 */
export async function parseExcel(
  buffer: Buffer
): Promise<{ rows: Record<string, any>[]; columns: string[] }> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON (with header row as keys)
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];
  
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  
  return { rows, columns };
}

/**
 * Auto-detect file type and parse accordingly
 */
export async function parseFile(
  fileStream: Readable,
  fileExtension: string
): Promise<{ rows: Record<string, any>[]; columns: string[] }> {
  const ext = fileExtension.toLowerCase();

  if (ext === '.csv' || ext === 'csv') {
    return await parseCSV(fileStream);
  } else if (ext === '.xlsx' || ext === 'xlsx' || ext === '.xls' || ext === 'xls') {
    // For Excel, we need to read the entire stream into a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return await parseExcel(buffer);
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}
