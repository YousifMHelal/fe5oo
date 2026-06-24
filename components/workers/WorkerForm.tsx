"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { workerSchema, type WorkerInput } from "@/lib/validators";
import { createWorker, updateWorker } from "@/actions/workers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface WorkerFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker?: { id: string; name: string; phone?: string | null } | null;
  onSuccess: () => void;
}

export function WorkerForm({ open, onOpenChange, worker, onSuccess }: WorkerFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!worker;

  const form = useForm<WorkerInput>({
    resolver: zodResolver(workerSchema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset(worker ? { name: worker.name, phone: worker.phone ?? "" } : { name: "", phone: "" });
    }
  }, [open, worker, form]);

  function onSubmit(data: WorkerInput) {
    startTransition(async () => {
      try {
        const payload = { ...data, phone: data.phone || undefined };
        if (isEdit && worker) {
          await updateWorker(worker.id, payload);
          toast.success("تم تحديث بيانات العامل");
        } else {
          await createWorker(payload);
          toast.success("تمت إضافة العامل");
        }
        onOpenChange(false);
        onSuccess();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل بيانات العامل" : "إضافة عامل جديد"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم العامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="01xxxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="cursor-pointer"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="cursor-pointer">
                {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {isEdit ? "حفظ التعديلات" : "إضافة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
