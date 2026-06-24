"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  Scissors,
  Tags,
  ScrollText,
  UsersRound,
  Settings,
  UserCog,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/overview", icon: LayoutDashboard, label: "نظرة عامة" },
  { href: "/transactions", icon: ReceiptText, label: "المعاملات" },
  { href: "/workers", icon: Scissors, label: "العمال" },
  { href: "/services", icon: Tags, label: "الخدمات" },
  { href: "/logs", icon: ScrollText, label: "سجل العمليات" },
  { href: "/users", icon: UsersRound, label: "المستخدمون" },
  { href: "/settings", icon: Settings, label: "الإعدادات" },
  { href: "/profile", icon: UserCog, label: "ملفي الشخصي" },
];

interface AppSidebarProps {
  user: { id: string; username: string; fullName: string; role: string };
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer",
        "hover:bg-accent hover:text-accent-foreground",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-4 border-b border-border",
        collapsed && "justify-center px-2"
      )}
    >
      <div className="relative h-10 w-10 shrink-0">
        <Image src="/logo.png" alt="Fe5oo BARBERSHOP" fill className="object-contain" />
      </div>
      {!collapsed && (
        <span className="font-heading font-bold text-lg text-foreground truncate">
          Fe5oo
        </span>
      )}
    </div>
  );
}

function SidebarNav({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2 flex-1">
      {navLinks.map((link) => (
        <div key={link.href} onClick={onClose}>
          <NavItem
            href={link.href}
            icon={link.icon}
            label={link.label}
            active={pathname === link.href || pathname.startsWith(link.href + "/")}
            collapsed={collapsed}
          />
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar({ mobileOpen, onMobileOpenChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen border-s border-border bg-card transition-all duration-150 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarBrand collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} />
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-9 cursor-pointer"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {collapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="right" className="w-72 p-0 flex flex-col">
          <SheetHeader className="border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <SheetTitle className="font-heading font-bold text-lg">
                Fe5oo BARBERSHOP
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMobileOpenChange(false)}
                aria-label="إغلاق القائمة"
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <SidebarNav collapsed={false} onClose={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
