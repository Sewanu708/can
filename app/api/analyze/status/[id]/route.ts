import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS, AnalysisSummary, AnalysisProgress } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;

    console.log('found!!!!!!!!!!')


    const progress = await storage.get<AnalysisProgress>(
      STORAGE_KEYS.progress(fileId)
    );

    if (!progress) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // If still analyzing, return progress
    if (progress.status === "analyzing") {
      return NextResponse.json({
        status: "analyzing",
        progress,
      });
    }

    // If error, return error
    if (progress.status === "error") {
      return NextResponse.json({
        status: "error",
        message: (progress as any).message || "Analysis failed",
      });
    }

    // If complete, return summary
    if (progress.status === "complete") {
      const summary = await storage.get<AnalysisSummary>(
        STORAGE_KEYS.analysis(fileId)
      );

      if (!summary) {
        return NextResponse.json(
          { error: "Analysis results not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: "complete",
        summary,
      });
    }

    return NextResponse.json({ error: "Unknown status" }, { status: 500 });
  } catch (error) {
    console.error("Status route error:", error);
    return NextResponse.json(
      { error: "Failed to get analysis status" },
      { status: 500 }
    );
  }
}
