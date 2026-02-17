"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { DrillLog } from "@/app/types";
import DrillConfigModal from "@/components/drill/config";
import { DrillConfigSchema } from "@/lib/schema";
import { useRouter } from "next/navigation";

export default function DrillPage() {
  const [drillLogs, setDrillLogs] = useState<DrillLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDrillLogs = async () => {
      try {
        const data = await apiClient.getDrillLogs();
        setDrillLogs(data);
      } catch (error) {
        setError("Failed to fetch drill logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrillLogs();
  }, []);

  const handleDrillConfigSubmit = (data: DrillConfigSchema) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    router.push(`/drill?${params.toString()}`);
  };
  
  return (
    <div className="flex min-h-screen flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Drill Logs</h1>
        <Button onClick={() => setIsModalOpen(true)}>New Drill</Button>
      </div>

      <div className="rounded-md border">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Time Taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drillLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.submitted_at), "PPP")}
                  </TableCell>
                  <TableCell>{log.mode}</TableCell>
                  <TableCell>
                    {log.score}/{log.total_questions}
                  </TableCell>
                  <TableCell>{log.total_time_spent}s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DrillConfigModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleDrillConfigSubmit}
      />
    </div>
  );
}

