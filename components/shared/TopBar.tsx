"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  CalendarRange,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const PRESETS = [
  { key: "today", label: "اليوم" },
  { key: "7d", label: "آخر 7 أيام" },
  { key: "30d", label: "آخر 30 يوماً" },
] as const;

function formatDate(d: Date) {
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

function PeriodPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePeriod = searchParams.get("period") ?? "today";
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const isCustom = activePeriod === "custom";

  function applyPreset(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", key);
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function applyCustom(r: DateRange | undefined) {
    setRange(r);
    if (r?.from && r?.to) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", "custom");
      params.set("from", r.from.toISOString().slice(0, 10));
      params.set("to", r.to.toISOString().slice(0, 10));
      router.push(`${pathname}?${params.toString()}`);
      setOpen(false);
    }
  }

  let label: string =
    PRESETS.find((p) => p.key === activePeriod)?.label ?? "اليوم";
  if (isCustom) {
    const f = searchParams.get("from");
    const t = searchParams.get("to");
    if (f && t) {
      label = `${formatDate(new Date(f))} – ${formatDate(new Date(t))}`;
    } else {
      label = "نطاق مخصص";
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        }>
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <span>{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="center" className="w-auto p-0" sideOffset={8}>
        <div className="flex flex-col sm:flex-row">
          {/* Preset list */}
          <div className="border-b sm:border-b-0 sm:border-e border-border p-3 flex flex-row sm:flex-col gap-1 min-w-35">
            <p className="text-xs font-medium text-muted-foreground px-2 pb-1 hidden sm:block">
              فترات سريعة
            </p>
            {PRESETS.map(({ key, label: l }) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={cn(
                  "w-full text-start text-sm px-2 py-1.5 rounded-md transition-colors cursor-pointer",
                  activePeriod === key && !isCustom
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}>
                {l}
              </button>
            ))}
          </div>

          {/* Calendar range */}
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground px-1 pb-2">
              نطاق مخصص
            </p>
            <Calendar
              mode="range"
              selected={range}
              onSelect={applyCustom}
              numberOfMonths={1}
              disabled={{ after: new Date() }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-11 w-11 cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      suppressHydrationWarning>
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
          : "bg-muted text-muted-foreground"
      )}
    >
      {isAdmin ? "مدير" : "كاشير"}
    </span>
  );
}

interface TopBarProps {
  user: { id: string; username: string; fullName: string; role: string };
  onMobileMenuOpen: () => void;
}

export function TopBar({ user, onMobileMenuOpen }: TopBarProps) {
  return (
    <header className="h-14 shrink-0 flex items-center gap-3 border-b border-border bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-11 w-11 cursor-pointer"
        onClick={onMobileMenuOpen}
        aria-label="فتح القائمة">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex justify-start">
        <PeriodPicker />
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="قائمة الحساب"
              />
            }>
            <User className="h-5 w-5 shrink-0" />
            <span className="hidden sm:inline truncate max-w-30">
              {user.fullName}
            </span>
            <RoleBadge role={user.role} />
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
              onClick={() => {
                window.location.href = "/profile";
              }}>
              <User className="h-4 w-4 me-2" />
              ملفي الشخصي
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4 me-2" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
