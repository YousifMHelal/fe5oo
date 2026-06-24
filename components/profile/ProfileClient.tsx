"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validators";
import { changePassword } from "@/actions/profile";
import { PageHeader } from "@/components/shared/PageHeader";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ProfileClientProps {
  user: { id: string; username: string; fullName: string; role: string };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function onSubmit(data: ChangePasswordInput) {
    startTransition(async () => {
      try {
        await changePassword(data);
        toast.success("تم تغيير كلمة المرور بنجاح");
        form.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  return (
    <>
      <PageHeader title="ملفي الشخصي" />

      <div className="max-w-lg space-y-6">
        {/* User info */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">معلومات الحساب</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">الاسم الكامل</span>
            <span className="font-medium">{user.fullName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">اسم المستخدم</span>
            <span className="font-mono text-sm" dir="ltr">@{user.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">الدور</span>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Change password */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">تغيير كلمة المرور</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="currentPassword" render={({ field }) => (
                <FormItem><FormLabel>كلمة المرور الحالية</FormLabel><FormControl><Input type="password" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="newPassword" render={({ field }) => (
                <FormItem><FormLabel>كلمة المرور الجديدة</FormLabel><FormControl><Input type="password" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>تأكيد كلمة المرور</FormLabel><FormControl><Input type="password" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={isPending} className="cursor-pointer">
                {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                تغيير كلمة المرور
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
