"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  Upload,
  Download,
  ArrowLeftRight,
  Mail,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const navItems = [
  { href: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/classes" as const, label: "Classes", icon: GraduationCap },
  { href: "/dashboard/students" as const, label: "Students", icon: Users },
  { href: "/dashboard/instructors" as const, label: "Instructors", icon: UserCheck },
  { href: "/dashboard/import" as const, label: "Import", icon: Upload },
  { href: "/dashboard/export" as const, label: "Export", icon: Download },
  { href: "/dashboard/transfers" as const, label: "Transfers", icon: ArrowLeftRight },
  { href: "/dashboard/emails" as const, label: "Emails", icon: Mail },
];

const locationOptions = [
  { value: "", label: "All Locations" },
  { value: "EMILSON", label: "Emilson" },
  { value: "HALE", label: "Hale" },
];

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLocation = searchParams.get("location") || "";

  function handleLocationChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("location", value);
    } else {
      params.delete("location");
    }
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(url as any);
  }

  return (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">OnDeck</h1>
      </div>

      {/* Location Filter */}
      <div className="px-3 mb-4">
        <div className="flex items-center gap-2 px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <MapPin className="h-3 w-3" />
          Location
        </div>
        <div className="flex flex-col gap-1">
          {locationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleLocationChange(opt.value)}
              className={cn(
                "text-left rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                currentLocation === opt.value && "bg-accent text-accent-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 mb-2">
        <div className="border-t" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          // Preserve location param in nav links
          const params = new URLSearchParams();
          if (currentLocation) {
            params.set("location", currentLocation);
          }
          const href =
            params.toString() ? `${item.href}?${params.toString()}` : item.href;

          return (
            <Link
              key={item.href}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={href as any}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-card flex flex-col">
        <Suspense fallback={null}>
          <SidebarContent />
        </Suspense>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
