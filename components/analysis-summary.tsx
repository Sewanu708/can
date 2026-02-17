"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  List,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { AnalysisSummary as AnalysisSummaryType} from "@/lib/types";

interface AnalysisSummaryProps {
  summary: AnalysisSummaryType;
}

export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const validPercentage =
    summary.totalRows > 0
      ? ((summary.validRows / summary.totalRows) * 100).toFixed(1)
      : 0;
  const invalidPercentage =
    summary.totalRows > 0
      ? ((summary.invalidRows / summary.totalRows) * 100).toFixed(1)
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <CardTitle>Analysis Complete</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <List className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Rows
              </p>
              <p className="text-2xl font-bold">
                {summary.totalRows.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Valid Rows
              </p>
              <p className="text-2xl font-bold">
                {summary.validRows.toLocaleString()} ({validPercentage}%)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Invalid Rows
              </p>
              <p className="text-2xl font-bold">
                {summary.invalidRows.toLocaleString()} ({invalidPercentage}%)
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium">Columns Detected ({summary.columns.length})</h4>
          <div className="flex flex-wrap gap-2">
            {summary.columns.map((col) => (
              <Badge key={col} variant="secondary">
                {col}
              </Badge>
            ))}
          </div>
        </div>

        <Collapsible onOpenChange={setIsDetailsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-0">
              {isDetailsOpen ? (
                <ChevronUp className="mr-2 h-4 w-4" />
              ) : (
                <ChevronDown className="mr-2 h-4 w-4" />
              )}
              Show Column Details
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column Name</TableHead>
                    <TableHead className="text-right">Filled</TableHead>
                    <TableHead className="text-right">Empty</TableHead>
                    <TableHead className="text-right">Unique</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(summary.columnSummary).map(
                    ([column, stats]) => (
                      <TableRow key={column}>
                        <TableCell className="font-medium">{column}</TableCell>
                        <TableCell className="text-right">
                          {stats.filled.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {stats.empty.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {stats.unique.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
