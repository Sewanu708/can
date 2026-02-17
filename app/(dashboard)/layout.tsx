import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user.email) return <main>{children}</main>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <div className="flex flex-col pl-64">
        <Navbar />
        <main className="flex-grow p-6">{children}</main>
      </div>
    </div>
  );
}
