"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { TopBar } from "@/components/shared/TopBar";

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar user={user} onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
