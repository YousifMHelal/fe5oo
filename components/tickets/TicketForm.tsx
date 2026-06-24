"use client";

import { useTransition, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createTicketSchema, type CreateTicketInput } from "@/lib/validators";
import { createTicket } from "@/actions/tickets";
import { formatEGP } from "@/lib/money";
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

interface TicketFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workers: Worker[];
  services: Service[];
  onSuccess: () => void;
}

export function TicketForm({ open, onOpenChange, workers, services, onSuccess }: TicketFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { items: [{ workerId: "", serviceId: "" }], note: "" },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  function getPrice(serviceId: string) {
    return services.find((s) => s.id === serviceId)?.price ?? 0;
  }

  const watchedItems = form.watch("items");
  const runningTotal = watchedItems.reduce((sum, i) => sum + getPrice(i.serviceId), 0);

  function handleClose() {
    form.reset({ items: [{ workerId: "", serviceId: "" }], note: "" });
    onOpenChange(false);
  }

  function onSubmit(data: CreateTicketInput) {
    startTransition(async () => {
      try {
        await createTicket(data);
        toast.success("تم إنشاء التذكرة");
        handleClose();
        onSuccess();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة معاملة جديدة</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Line items */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {/* Worker select */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.workerId`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">العامل</FormLabel>
                          <FormControl>
                            <select
                              {...f}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
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

                    {/* Service select */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.serviceId`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">الخدمة</FormLabel>
                          <FormControl>
                            <select
                              {...f}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
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
                  </div>

                  {/* Price preview */}
                  <div className="pt-6 text-sm font-medium tabular-nums min-w-[60px] text-end">
                    <MoneyCell amount={getPrice(watchedItems[index]?.serviceId ?? "")} />
                  </div>

                  {/* Remove */}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 mt-5 cursor-pointer text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Add line */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1"
              onClick={() => append({ workerId: "", serviceId: "" })}
            >
              <Plus className="h-3.5 w-3.5" />
              إضافة خدمة أخرى
            </Button>

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

            {/* Running total */}
            <div className="flex justify-between items-center rounded-lg bg-muted/50 px-4 py-3 font-medium">
              <span className="text-sm text-muted-foreground">الإجمالي</span>
              <span className="text-lg font-bold font-heading">
                <MoneyCell amount={runningTotal} />
              </span>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending} className="cursor-pointer">
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="cursor-pointer">
                {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                حفظ المعاملة
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
