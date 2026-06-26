"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { createWorkerExpense } from "@/actions/expenses";
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

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "المبلغ مطلوب")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, "مبلغ صحيح أكبر من صفر"),
  note: z.string().max(200).optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker: { id: string; name: string } | null;
  onSuccess: () => void;
}

export function ExpenseForm({ open, onOpenChange, worker, onSuccess }: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: "", note: "" },
  });

  useEffect(() => {
    if (open) form.reset({ amount: "", note: "" });
  }, [open, form]);

  function handleClose() {
    onOpenChange(false);
  }

  function onSubmit(data: FormValues) {
    if (!worker) return;
    startTransition(async () => {
      try {
        await createWorkerExpense({
          workerId: worker.id,
          amount: Number(data.amount),
          note: data.note || undefined,
        });
        toast.success(`تم تسجيل السلفة للعامل ${worker.name}`);
        handleClose();
        onSuccess();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              سلفة / مصروف — {worker?.name}
            </DialogTitle>
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ (ج.م)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="0"
                      className="tabular-nums"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظة (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="سبب السلفة..." {...field} />
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
                تسجيل السلفة
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
