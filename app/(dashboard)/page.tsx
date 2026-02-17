import { QuickStartMenu } from "@/components/dashboard/QuickStartMenu";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatCard } from "@/components/dashboard/StatCard";
import LandingPage from "@/components/unauth";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user.email)  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Content Area */}
      <div className="lg:col-span-2">
        <RecentActivity />
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6 lg:col-span-1">
        <StatCard label="Total Drills" value="125" />
        <StatCard label="Avg. Speed" value="45s" />
        <StatCard label="Accuracy" value="82%" />
        <QuickStartMenu />
      </div>
    </div>
  );

  return  <LandingPage/>
}
