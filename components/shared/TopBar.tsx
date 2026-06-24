"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Menu, Sun, Moon, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PERIODS = [
  { key: "today", label: "اليوم" },
  { key: "7d", label: "7 أيام" },
  { key: "30d", label: "30 يوماً" },
] as const;

interface TopBarProps {
  user: { id: string; username: string; fullName: string; role: string };
  onMobileMenuOpen: () => void;
}

function PeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("period") ?? "today";

  function setPeriod(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", key);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
      {PERIODS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setPeriod(key)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] min-w-[60px]",
            active === key
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-11 w-11 cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full",
        isAdmin
          ? "bg-primary/10 text-primary"
          : "bg-secondary/10 text-secondary"
      )}
    >
      {isAdmin ? "مدير" : "كاشير"}
    </span>
  );
}

export function TopBar({ user, onMobileMenuOpen }: TopBarProps) {
  return (
    <header className="h-14 shrink-0 flex items-center gap-3 border-b border-border bg-card px-4">
      {/* Hamburger (mobile only) */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-11 w-11 cursor-pointer"
        onClick={onMobileMenuOpen}
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Period filter */}
      <div className="flex-1 flex justify-center">
        <PeriodFilter />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="h-11 gap-2 px-3 cursor-pointer"
              aria-label="قائمة الحساب"
            >
              <User className="h-5 w-5 shrink-0" />
              <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px]">
                {user.fullName}
              </span>
              <RoleBadge role={user.role} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{user.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  @{user.username}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => { window.location.href = "/profile"; }}
            >
              <User className="h-4 w-4 me-2" />
              ملفي الشخصي
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 me-2" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
