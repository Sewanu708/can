'use client'
import { useState, useCallback } from "react";
import { SYSTEM_FIELDS } from "@/lib/system-fields";
import {
  AnalysisSummary as AnalysisSummaryType,
  PreviewRow,
} from "@/lib/types";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useAnalysis } from "@/hooks/use-analysis";
import { useImport } from "@/hooks/use-import";
import { UploadZone } from "@/components/upload-zone";
import { FileUploadCard } from "@/components/file-upload-card";
import { ProgressIndicator } from "@/components/progress-indicator";
import { AnalysisSummary } from "@/components/analysis-summary";
import { ColumnMapper } from "@/components/column-mapper";
import { DataPreviewTable } from "@/components/data-preview-table";
import { ErrorList, ValidationError } from "@/components/error-list";
import { ImportConfirmation } from "@/components/import-confirmation";
import { ImportSuccess } from "@/components/import-success";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PREVIEW_PAGE_SIZE } from "@/lib/constants";

const STEPS = [
  { id: 1, title: "Upload" },
  { id: 2, title: "Analyze" },
  { id: 3, title: "Map" },
  { id: 4, title: "Preview" },
  { id: 5, title: "Import" },
];

export default function ImportPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [s3Key, setS3Key] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [previewTotalPages, setPreviewTotalPages] = useState(0);
  const [previewCurrentPage, setPreviewCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const { uploadFile, isUploading, uploadProgress } = useFileUpload();
  const {
    status: analysisStatus,
    progress: analysisProgress,
    summary: analysisSummary,
    startAnalysis,
    reset: resetAnalysis,
  } = useAnalysis();
  const {
    startImport,
    isImporting,
    result: importResult,
    reset: resetImport,
  } = useImport();

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const result = await uploadFile(selectedFile);
    if (result) {
      setFileId(result.fileId);
      setS3Key(result.s3Key);
      goToStep(2);
      startAnalysis(result.fileId, result.s3Key);
    }
  };

  const handleMappingContinue = async () => {
    if (!fileId) return;
    await fetch("/api/map-columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, mapping: columnMapping }),
    });
    fetchPreviewData(1);
    goToStep(4);
  };    

  const fetchPreviewData = async (page: number) => {
    if (!fileId) return;

    setIsPreviewLoading(true);
    try {
      const response = await fetch(`/api/preview?fileId=${fileId}&page=${page}`);
      const data = await response.json();

      const errors: ValidationError[] = [];
      const initialSelected = new Set<number>();

      data.rows.forEach((row: PreviewRow) => {
        if (row._isValid) {
          initialSelected.add(row._rowIndex);
        } else if (row._errors) {
          row._errors.forEach((message) => {
            errors.push({
              rowIndex: row._rowIndex,
              message,
              field:
                Object.keys(row).find((k) => row[k] === message) || "unknown",
            });
          });
        }
      });

      setPreviewData(data.rows);
      setValidationErrors(errors);
      setSelectedRows(initialSelected);
      setPreviewTotalPages(Math.ceil(data.total / PREVIEW_PAGE_SIZE));
      setPreviewCurrentPage(page);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!fileId || !analysisSummary) return;
    const excludedRows = Array.from(
      { length: analysisSummary.totalRows },
      (_, i) => i + 1
    ).filter((rowIndex) => !selectedRows.has(rowIndex));

    await startImport(fileId, excludedRows);
    setShowConfirmation(false);
    goToStep(5);
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setFile(null);
    setFileId(null);
    setS3Key(null);
    setColumnMapping({});
    setPreviewData([]);
    setSelectedRows(new Set());
    setValidationErrors([]);
    setIsPreviewLoading(false);
    resetAnalysis();
    resetImport();
  };

  const handleViewErrorRow = (rowIndex: number) => {
    const page = Math.ceil(rowIndex / PREVIEW_PAGE_SIZE);
    fetchPreviewData(page);
  };

  const handleColumnMappingChange = useCallback(
    (newMapping: Record<string, string>) => {
      setColumnMapping(newMapping);
    },
    []
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            {!file ? (
              <UploadZone
                onFileSelected={handleFileSelect}
                isUploading={isUploading}
              />
            ) : (
              <FileUploadCard
                fileName={file.name}
                fileSize={file.size}
                onRemove={resetWizard}
              />
            )}
            {isUploading && (
              <ProgressIndicator
                progress={uploadProgress}
                status="Uploading file..."
              />
            )}
          </div>
        );
      case 2:
        return (
          <div>
            {analysisStatus === "analyzing" && analysisProgress && (
              <ProgressIndicator
                progress={
                  (analysisProgress.processed / (analysisProgress.total || 1)) *
                  100
                }
                status={`Analyzing file... ${analysisProgress.processed} / ${analysisProgress.total} rows`}
              />
            )}
            {analysisStatus === "complete" && analysisSummary && (
              <AnalysisSummary summary={analysisSummary} />
            )}
          </div>
        );
      case 3:
        return (
          analysisSummary && (
            <ColumnMapper
              detectedColumns={analysisSummary.columns}
              systemFields={SYSTEM_FIELDS}
              onMappingChange={handleColumnMappingChange}
              onContinue={handleMappingContinue}
            />
          )
        );
      case 4:
        return (
          analysisSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DataPreviewTable
                  data={previewData}
                  columns={analysisSummary.columns.filter(
                    (c) => columnMapping[c]
                  )}
                  selectedRows={selectedRows}
                  onRowSelectionChange={setSelectedRows}
                  currentPage={previewCurrentPage}
                  totalPages={previewTotalPages}
                  onPageChange={fetchPreviewData}
                  isLoading={isPreviewLoading}
                />
              </div>
              <div>
                <ErrorList
                  errors={validationErrors}
                  onViewRow={handleViewErrorRow}
                />
              </div>
            </div>
          )
        );
      case 5:
        return (
          importResult && (
            <ImportSuccess
              imported={importResult.imported}
              skipped={importResult.skipped}
              onImportAnother={resetWizard}
            />
          )
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Contacts</h1>
        <p className="text-muted-foreground">
          Follow the steps to import your contacts from a file.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "border-2 border-primary bg-primary/10"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <p
                className={`mt-2 text-sm ${
                  currentStep >= step.id ? "font-medium" : ""
                }`}
              >
                {step.title}
              </p>
            </div>
            {index < STEPS.length - 1 && <Separator className="mx-4 w-16" />}
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end gap-4">
        {currentStep > 1 && currentStep < 5 && (
          <Button
            variant="outline"
            onClick={() => goToStep((currentStep - 1) as number)}
          >
            Back
          </Button>
        )}
        {currentStep < 4 && analysisStatus === "complete" && (
          <Button onClick={() => goToStep((currentStep + 1) as number)}>
            Next
          </Button>
        )}
        {currentStep === 4 && (
          <Button onClick={() => setShowConfirmation(true)}>
            Import {selectedRows.size} Contacts
          </Button>
        )}
      </div>

      {analysisSummary && (
        <ImportConfirmation
          open={showConfirmation}
          isImporting={isImporting}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={handleImportConfirm}
          selectedRows={selectedRows.size}
          totalRows={analysisSummary.totalRows}
        />
      )}
    </div>
  );
}
