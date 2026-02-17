"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/drills", label: "Drills" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 border-r border-slate-800 bg-slate-900 text-slate-50">
      <div className="p-4">
        <h2 className="text-lg font-bold">Project Ace</h2>
      </div>
      <nav className="flex flex-col p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-2 rounded-md font-medium text-base", // Changed to text-base from text-lg to fit common link sizes, considering max text-lg
              pathname === item.href
                ? "bg-indigo-900/20 text-indigo-400 border-r-2 border-indigo-500"
                : "hover:bg-slate-800"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}