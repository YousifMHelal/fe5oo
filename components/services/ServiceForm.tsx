"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { serviceSchema, type ServiceInput } from "@/lib/validators";
import { createService, updateService } from "@/actions/services";
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

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service?: { id: string; title: string; price: number } | null;
  onSuccess: () => void;
}

export function ServiceForm({ open, onOpenChange, service, onSuccess }: ServiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!service;

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { title: "", price: 0 },
  });

  useEffect(() => {
    if (open) {
      form.reset(service ? { title: service.title, price: service.price } : { title: "", price: 0 });
    }
  }, [open, service, form]);

  function handleClose() {
    onOpenChange(false);
  }

  function onSubmit(data: ServiceInput) {
    startTransition(async () => {
      try {
        if (isEdit && service) {
          await updateService(service.id, data);
          toast.success("تم تحديث الخدمة");
        } else {
          await createService(data);
          toast.success("تمت إضافة الخدمة");
        }
        handleClose();
        onSuccess();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isEdit ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              onClick={handleClose}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">إغلاق</span>
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الخدمة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: قصة شعر" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر (ج.م)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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
