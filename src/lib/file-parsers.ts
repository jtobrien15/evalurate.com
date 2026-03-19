import * as XLSX from "xlsx";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;

/**
 * Parse a CSV string into rows of string arrays.
 * Handles quoted fields (including commas and newlines within quotes)
 * and double-quote escaping ("").
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current.trim());
        current = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        row.push(current.trim());
        current = "";
        if (row.some((cell) => cell !== "")) {
          rows.push(row);
        }
        row = [];
        if (char === "\r") i++; // skip \n in \r\n
      } else {
        current += char;
      }
    }
  }

  // Push last field and row
  if (current !== "" || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse an Excel (.xlsx/.xls) file buffer into rows of string arrays.
 * Reads the first sheet and converts all cell values to strings.
 */
export function parseExcel(buffer: ArrayBuffer): string[][] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }
  const sheet = workbook.Sheets[firstSheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Convert all cell values to trimmed strings
  return raw
    .map((row) => row.map((cell) => (cell != null ? String(cell).trim() : "")))
    .filter((row) => row.some((cell) => cell !== ""));
}

/**
 * Parse a PDF file buffer into rows of string arrays.
 * Best-effort extraction: finds the header row by looking for common column
 * names ("first name", "last name"), then splits subsequent lines by
 * whitespace/tab boundaries.
 *
 * SGA PDFs typically render tabular data with consistent spacing.
 * This parser uses a two-pass approach:
 *   1. Find the header row to determine column count
 *   2. Split data rows to match that column count
 */
export async function parsePDF(buffer: ArrayBuffer): Promise<string[][]> {
  const data = await pdfParse(Buffer.from(buffer));
  const text = data.text;

  const lines: string[] = text
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  // Try to find the header row by looking for known column names
  const headerIndicators = ["first name", "last name", "email", "firstname", "lastname"];
  let headerIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    const matchCount = headerIndicators.filter((ind) => lower.includes(ind)).length;
    if (matchCount >= 2) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    // Fallback: treat the first line as header
    headerIdx = 0;
  }

  const rows: string[][] = [];

  // Split lines into columns using two-or-more whitespace as delimiter.
  // PDF text extraction often produces multi-space gaps between columns.
  for (let i = headerIdx; i < lines.length; i++) {
    const cells: string[] = lines[i]
      .split(/\s{2,}|\t/)
      .map((cell: string) => cell.trim())
      .filter((cell: string) => cell.length > 0);

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}
