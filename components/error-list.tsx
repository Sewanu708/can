"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "./ui/button";

export interface ValidationError {
  rowIndex: number;
  field: string;
  message: string;
  value?: string;
}

interface ErrorListProps {
  errors: ValidationError[];
  onViewRow?: (rowIndex: number) => void;
}

export function ErrorList({ errors, onViewRow }: ErrorListProps) {
  const groupedErrors = errors.reduce((acc, error) => {
    const key = error.message;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  if (errors.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No validation errors found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">Validation Errors ({errors.length})</h3>
        <ScrollArea className="h-96 w-full rounded-md border">
            <Accordion type="multiple" className="p-4">
            {Object.entries(groupedErrors).map(([message, errors]) => (
                <AccordionItem key={message} value={message}>
                <AccordionTrigger>
                    <div className="flex items-center justify-between w-full">
                        <span className="text-left">{message}</span>
                        <Badge variant="destructive" className="ml-2">{errors.length}</Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                    {errors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                        <p>Row {error.rowIndex}: <span className="italic text-muted-foreground">"{error.value}"</span></p>
                        {onViewRow && (
                            <Button variant="link" size="sm" onClick={() => onViewRow(error.rowIndex)}>
                            View
                            </Button>
                        )}
                        </div>
                    ))}
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        </ScrollArea>
    </div>
  );
}
