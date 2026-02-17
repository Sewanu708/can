import { AnalysisSummary, PreviewRow, ImportResult } from "./types";

export async function mockUploadFile(
  file: File
): Promise<{ fileId: string; s3Key: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    fileId: `file_${Date.now()}`,
    s3Key: `uploads/${Date.now()}-${file.name}`,
  };
}

export async function mockAnalyzeFile(
  fileId: string
): Promise<AnalysisSummary> {
  // Simulate analysis delay
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return {
    totalRows: 1250,
    validRows: 1180,
    invalidRows: 70,
    columns: [
      "Email Address",
      "First Name",
      "Last Name",
      "Phone Number",
      "Company",
      "Job Title",
      "City",
      "State",
    ],
    columnSummary: {
      "Email Address": { filled: 1240, empty: 10, unique: 1235 },
      "First Name": { filled: 1250, empty: 0, unique: 450 },
      "Last Name": { filled: 1248, empty: 2, unique: 890 },
      "Phone Number": { filled: 980, empty: 270, unique: 975 },
      Company: { filled: 1100, empty: 150, unique: 450 },
      "Job Title": { filled: 1050, empty: 200, unique: 320 },
      City: { filled: 1200, empty: 50, unique: 180 },
      State: { filled: 1220, empty: 30, unique: 48 },
    },
    fileId,
    s3Key: "",
    sampleRows: [],
  };
}

export async function mockGetPreviewData(
  fileId: string,
  page: number
): Promise<{
  rows: PreviewRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock preview data
  const pageSize = 100;
  const startIdx = (page - 1) * pageSize;
  const rows: PreviewRow[] = [];

  for (let i = 0; i < pageSize; i++) {
    const rowIndex = startIdx + i + 1;
    const isValid = true; // 95% valid

    rows.push({
      _rowIndex: rowIndex,
      _isValid: isValid,
      _errors: isValid ? undefined : ["Invalid email format"],
      email: isValid ? `user${rowIndex}@example.com` : `invalid${rowIndex}`,
      firstName: `FirstName${rowIndex}`,
      lastName: `LastName${rowIndex}`,
      phone: `555-${String(rowIndex).padStart(4, "0")}`,
      company: `Company ${rowIndex % 50}`,
      title: `Job Title ${rowIndex % 20}`,
    });
  }

  return {
    rows,
    total: 1250,
    page,
    pageSize,
  };
}

export async function mockImportContacts(
  fileId: string,
  excludedRows: number[]
): Promise<ImportResult> {
  // Simulate import delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    success: true,
    imported: 1180,
    skipped: 70,
  };
}
