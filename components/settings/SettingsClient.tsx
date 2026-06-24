"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Download, Upload } from "lucide-react";
import { settingSchema, type SettingInput } from "@/lib/validators";
import { updateSettings } from "@/actions/settings";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
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

interface SettingsClientProps {
  settings: { shopName: string; phone: string; address: string };
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [isRestoring, startRestore] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<SettingInput>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      shopName: settings.shopName,
      phone: settings.phone,
      address: settings.address,
    },
  });

  function onSubmit(data: SettingInput) {
    startTransition(async () => {
      try {
        await updateSettings(data);
        toast.success("تم حفظ الإعدادات");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  function handleDownload() {
    window.location.href = "/api/backup";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setRestoreFile(file);
      setRestoreConfirmOpen(true);
    }
    e.target.value = "";
  }

  function handleRestore() {
    if (!restoreFile) return;
    startRestore(async () => {
      try {
        const formData = new FormData();
        formData.append("file", restoreFile);
        const res = await fetch("/api/backup", {
          method: "POST",
          body: restoreFile,
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error ?? "فشل الاستعادة");
        }
        toast.success("تمت استعادة قاعدة البيانات. أعد تشغيل التطبيق لتفعيل التغييرات.");
        setRestoreConfirmOpen(false);
        setRestoreFile(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  return (
    <>
      <PageHeader title="الإعدادات" />

      <div className="max-w-lg space-y-6">
        {/* Shop info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">معلومات المتجر</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="shopName" render={({ field }) => (
                <FormItem><FormLabel>اسم المتجر</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>رقم الهاتف</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={isPending} className="cursor-pointer">
                {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                حفظ الإعدادات
              </Button>
            </form>
          </Form>
        </div>

        {/* Backup / Restore */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">نسخ احتياطي واستعادة</h3>
          <p className="text-xs text-muted-foreground mb-4">
            قاعدة البيانات تعمل محلياً بالكامل. احتفظ بنسخة احتياطية دورياً.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="cursor-pointer gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              تنزيل نسخة احتياطية
            </Button>

            <Button
              variant="outline"
              className="cursor-pointer gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              استعادة من ملف
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".db"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={restoreConfirmOpen}
        onOpenChange={(v) => { if (!v) { setRestoreConfirmOpen(false); setRestoreFile(null); } }}
        title="تأكيد استعادة قاعدة البيانات"
        description={`سيتم استبدال قاعدة البيانات الحالية بالملف "${restoreFile?.name ?? ""}". هذا الإجراء لا يمكن التراجع عنه.`}
        onConfirm={handleRestore}
        isPending={isRestoring}
        confirmLabel="استعادة"
        destructive
      />
    </>
  );
}
