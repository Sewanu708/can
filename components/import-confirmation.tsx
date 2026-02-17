"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ImportConfirmationProps {
  totalRows: number;
  selectedRows: number;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
  open: boolean;
}

export function ImportConfirmation({
  totalRows,
  selectedRows,
  onConfirm,
  onCancel,
  isImporting,
  open,
}: ImportConfirmationProps) {
  const skippedRows = totalRows - selectedRows;

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Import</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to import contacts. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total selected rows:</span>
            <span className="font-medium">{selectedRows.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rows to be skipped:</span>
            <span className="font-medium">{skippedRows.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total contacts to import:</span>
            <span>{selectedRows.toLocaleString()}</span>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isImporting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Contacts"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
