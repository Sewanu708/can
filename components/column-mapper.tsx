"use client";

import { useState, useEffect } from 'react';
import { SystemField } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ColumnMapperProps {
  detectedColumns: string[];
  systemFields: SystemField[];
  initialMapping?: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  onContinue: () => void;
}

function autoMatchColumn(csvColumn: string, systemFields: SystemField[]): string | null {
  const normalized = csvColumn.toLowerCase().replace(/[^a-z]/g, '');
  if (!normalized) return null;

  for (const field of systemFields) {
    const fieldNormalized = field.key.toLowerCase();
    if (normalized.includes(fieldNormalized) || fieldNormalized.includes(normalized)) {
      return field.key;
    }
  }
  return null;
}

export function ColumnMapper({
  detectedColumns,
  systemFields,
  initialMapping = {},
  onMappingChange,
  onContinue,
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Serialize dependencies to prevent infinite loops from unstable references
  const detectedColumnsJson = JSON.stringify(detectedColumns);
  const systemFieldsJson = JSON.stringify(systemFields);
  const initialMappingJson = JSON.stringify(initialMapping);

  useEffect(() => {
    const autoMapping: Record<string, string> = {};
    const usedSystemFields = new Set<string>();

    detectedColumns.forEach(col => {
      const matchedField = autoMatchColumn(col, systemFields);
      if (matchedField && !usedSystemFields.has(matchedField)) {
        autoMapping[col] = matchedField;
        usedSystemFields.add(matchedField);
      }
    });
    
    const newMapping = { ...autoMapping, ...initialMapping };
    
    setMapping(prev => {
      if (JSON.stringify(prev) === JSON.stringify(newMapping)) return prev;
      return newMapping;
    }); 
    onMappingChange(newMapping);
  }, [detectedColumnsJson, systemFieldsJson, initialMappingJson]);

  const handleMappingChange = (csvColumn: string, systemFieldKey: string) => {
    const newMapping = { ...mapping };
    if (systemFieldKey === 'skip') {
      delete newMapping[csvColumn];
    } else {
      newMapping[csvColumn] = systemFieldKey;
    }
    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  const requiredFields = systemFields.filter(f => f.required);
  const mappedSystemFields = new Set(Object.values(mapping));
  const unmappedRequiredFields = requiredFields.filter(f => !mappedSystemFields.has(f.key));
  const isContinueDisabled = unmappedRequiredFields.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        <div className="font-semibold">Your Columns</div>
        <div className="font-semibold">System Fields</div>
      </div>

      {detectedColumns.map(col => (
        <div key={col} className="grid grid-cols-1 items-center gap-x-8 gap-y-2 md:grid-cols-2">
          <Label htmlFor={`select-${col}`}>{col}</Label>
          <Select
            value={mapping[col] || 'skip'}
            onValueChange={value => handleMappingChange(col, value)}
          >
            <SelectTrigger id={`select-${col}`}>
              <SelectValue placeholder="Select a field..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Skip this column</SelectItem>
              {systemFields.map(field => (
                <SelectItem key={field.key} value={field.key} disabled={mappedSystemFields.has(field.key) && mapping[col] !== field.key}>
                  {field.label} {field.required && '*'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {isContinueDisabled && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Required fields missing</AlertTitle>
          <AlertDescription>
            Please map the following required fields: {unmappedRequiredFields.map(f => f.label).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={onContinue} disabled={isContinueDisabled}>
          Continue
        </Button>
      </div>
    </div>
  );
}
