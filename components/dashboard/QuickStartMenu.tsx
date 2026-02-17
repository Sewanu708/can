import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickStartMenu() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Start</CardTitle>
        <CardDescription>Begin a new drill session.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        <Button variant="outline">Start Quant Drill</Button>
        <Button variant="outline">Start Verbal Drill</Button>
        <Button variant="default">Start Mixed Drill</Button>
      </CardContent>
    </Card>
  );
}
