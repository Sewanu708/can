import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>An overview of your recent drill performance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50">
          <p className="text-slate-400">Chart Goes Here</p>
        </div>
      </CardContent>
    </Card>
  );
}
