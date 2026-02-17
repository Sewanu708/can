export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = ['.csv', '.xlsx', '.xls'];
export const ACCEPTED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const PREVIEW_PAGE_SIZE = 100;
export const ANALYSIS_POLL_INTERVAL_MS = 2000;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
  INVALID_FILE_TYPE: 'Please upload a CSV or Excel file',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  ANALYSIS_FAILED: 'Failed to analyze file. Please try again.',
  IMPORT_FAILED: 'Failed to import contacts. Please try again.',
};
