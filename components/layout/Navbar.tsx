"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getTitle(pathname: string): string {
  const segment = pathname.split("/").pop() || "dashboard";
  if (segment === "dashboard") return "Dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Navbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <nav className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6 text-slate-50">
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      <div>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}