"use client";

import { useTransition, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Printer, Trash2, X } from "lucide-react";
import { createTicket, updateTicket } from "@/actions/tickets";
import { formatEGP } from "@/lib/money";
import { printReceipt } from "@/lib/print";
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
import { MoneyCell } from "@/components/shared/MoneyCell";

type Worker = { id: string; name: string };
type Service = { id: string; title: string; price: number };

export type TicketForEdit = {
  id: string;
  note: string | null;
  items: { workerId: string; serviceId: string }[];
};

interface TicketFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workers: Worker[];
  services: Service[];
  onSuccess: () => void;
  editTicket?: TicketForEdit;
}

// Form-local schema: one worker + N services
const formSchema = z.object({
  workerId: z.string().min(1, "العامل مطلوب"),
  items: z
    .array(z.object({ serviceId: z.string().min(1, "الخدمة مطلوبة") }))
    .min(1, "يجب إضافة خدمة واحدة على الأقل"),
  note: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof formSchema>;

function defaultValues(editTicket?: TicketForEdit): FormValues {
  if (editTicket && editTicket.items.length > 0) {
    return {
      workerId: editTicket.items[0].workerId,
      items: editTicket.items.map((i) => ({ serviceId: i.serviceId })),
      note: editTicket.note ?? "",
    };
  }
  return { workerId: "", items: [{ serviceId: "" }], note: "" };
}

export function TicketForm({
  open,
  onOpenChange,
  workers,
  services,
  onSuccess,
  editTicket,
}: TicketFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!editTicket;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(editTicket),
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    form.reset(defaultValues(editTicket));
  }, [editTicket]);

  function getPrice(serviceId: string) {
    return services.find((s) => s.id === serviceId)?.price ?? 0;
  }

  const watchedItems = form.watch("items");
  const runningTotal = watchedItems.reduce((sum, i) => sum + getPrice(i.serviceId), 0);

  function handleClose() {
    form.reset(defaultValues(editTicket));
    onOpenChange(false);
  }

  function submitForm(data: FormValues, withPrint: boolean) {
    startTransition(async () => {
      try {
        const items = data.items.map((i) => ({ workerId: data.workerId, serviceId: i.serviceId }));
        if (isEdit) {
          await updateTicket({ id: editTicket!.id, items, note: data.note });
          toast.success("تم تعديل المعاملة");
        } else {
          const result = await createTicket({ items, note: data.note });
          toast.success("تم إنشاء التذكرة");
          if (withPrint && result.ticket) {
            printReceipt(result.ticket);
          }
        }
        handleClose();
        onSuccess();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  function onSubmit(data: FormValues) { submitForm(data, false); }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isEdit ? "تعديل المعاملة" : "إضافة معاملة جديدة"}</DialogTitle>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
            {/* Scrollable fields */}
            <div className="flex flex-col gap-4 max-h-[55vh] overflow-y-auto pe-1">
              {/* Single worker select */}
              <FormField
                control={form.control}
                name="workerId"
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>العامل</FormLabel>
                    <FormControl>
                      <select
                        {...f}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                      >
                        <option value="">اختر عاملاً</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Service line items */}
              <div className="rounded-lg border border-border divide-y divide-border">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 px-3 py-1.5">
                    <FormField
                      control={form.control}
                      name={`items.${index}.serviceId`}
                      render={({ field: f }) => (
                        <FormItem className="flex-1 mb-0">
                          <FormControl>
                            <select
                              {...f}
                              className="w-full bg-transparent text-sm focus:outline-none cursor-pointer py-1"
                            >
                              <option value="">اختر خدمة</option>
                              {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title} — {formatEGP(s.price)}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="text-xs tabular-nums text-muted-foreground min-w-13 text-end">
                      {watchedItems[index]?.serviceId ? formatEGP(getPrice(watchedItems[index].serviceId)) : ""}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => append({ serviceId: "" })}
                  className="flex items-center gap-1.5 w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  إضافة خدمة
                </button>
              </div>

              {/* Form-level items error */}
              {form.formState.errors.items?.root && (
                <p className="text-sm text-destructive">{form.formState.errors.items.root.message}</p>
              )}

              {/* Note */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظة (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="ملاحظة على المعاملة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pinned: total + actions */}
            <div className="flex justify-between items-center rounded-lg bg-muted/50 px-4 py-3 font-medium">
              <span className="text-sm text-muted-foreground">الإجمالي</span>
              <span className="text-lg font-bold font-heading">
                <MoneyCell amount={runningTotal} />
              </span>
            </div>

            <div className="flex justify-end gap-2 flex-wrap">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending} className="cursor-pointer">
                إلغاء
              </Button>
              {!isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="cursor-pointer gap-2"
                  onClick={() => form.handleSubmit((data) => submitForm(data, true))()}
                >
                  <Printer className="h-4 w-4" />
                  حفظ وطباعة
                </Button>
              )}
              <Button type="submit" disabled={isPending} className="cursor-pointer">
                {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {isEdit ? "حفظ التعديلات" : "حفظ المعاملة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
