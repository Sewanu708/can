"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PreviewRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface DataPreviewTableProps {
  data: PreviewRow[];
  columns: string[];
  selectedRows: Set<number>;
  onRowSelectionChange: (selectedRows: Set<number>) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function DataPreviewTable({
  data,
  columns,
  selectedRows,
  onRowSelectionChange,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: DataPreviewTableProps) {
  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      data.forEach(row => newSelectedRows.add(row._rowIndex));
    } else {
      data.forEach(row => newSelectedRows.delete(row._rowIndex));
    }
    onRowSelectionChange(newSelectedRows);
  };

  const handleRowSelect = (rowIndex: number, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowIndex);
    } else {
      newSelectedRows.delete(rowIndex);
    }
    onRowSelectionChange(newSelectedRows);
  };

  const isAllOnPageSelected = data.length > 0 && data.every(row => selectedRows.has(row._rowIndex));

  const renderPagination = () => {
    const pageNumbers = [];
    const visiblePages = 2; 

    if (totalPages <= 1) return null;

    // Always show first page
    pageNumbers.push(1);

    if (currentPage > visiblePages + 2) {
      pageNumbers.push(-1); // Ellipsis
    }

    let startPage = Math.max(2, currentPage - visiblePages);
    let endPage = Math.min(totalPages - 1, currentPage + visiblePages);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (currentPage < totalPages - visiblePages - 1) {
      pageNumbers.push(-1); // Ellipsis
    }

    // Always show last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    const uniquePageNumbers = [...new Set(pageNumbers)];

    return uniquePageNumbers.map((page, index) =>
      page === -1 ? (
        <PaginationItem key={`ellipsis-${index}`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            onClick={e => {
              e.preventDefault();
              onPageChange(page);
            }}
            isActive={currentPage === page}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllOnPageSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows on this page"
                />
              </TableHead>
              <TableHead className="w-[80px]">#</TableHead>
              {columns.map(col => (
                <TableHead key={col}>{col}</TableHead>
              ))}
              <TableHead className="w-[50px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 3} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 3} className="h-24 text-center">
                  No data to display.
                </TableCell>
              </TableRow>
            ) : (
              data.map(row => (
                <TableRow
                  key={row._rowIndex}
                  className={cn({
                    "bg-green-50/50": row._isValid,
                    "bg-red-50/50": !row._isValid,
                  })}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(row._rowIndex)}
                      onCheckedChange={checked => handleRowSelect(row._rowIndex, !!checked)}
                    />
                  </TableCell>
                  <TableCell>{row._rowIndex}</TableCell>
                  {columns.map(col => (
                    <TableCell key={col}>{row[col]}</TableCell>
                  ))}
                  <TableCell>
                    {row._isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{row._errors?.join(', ')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={e => {
                e.preventDefault();
                onPageChange(Math.max(1, currentPage - 1));
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {renderPagination()}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={e => {
                e.preventDefault();
                onPageChange(Math.min(totalPages, currentPage + 1));
              }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
