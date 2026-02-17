"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ImportSuccessProps {
  imported: number;
  skipped: number;
  onViewContacts?: () => void;
  onImportAnother?: () => void;
}

export function ImportSuccess({
  imported,
  skipped,
  onViewContacts,
  onImportAnother,
}: ImportSuccessProps) {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl mt-4">Import Successful!</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="text-muted-foreground">
          <p>
            <span className="font-bold text-primary">{imported.toLocaleString()}</span> contacts have been successfully imported.
          </p>
          <p>
            <span className="font-bold">{skipped.toLocaleString()}</span> rows were skipped.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          {onViewContacts && (
            <Button onClick={onViewContacts}>
              View Contacts
            </Button>
          )}
          {onImportAnother && (
            <Button variant="outline" onClick={onImportAnother}>
              Import Another File
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
