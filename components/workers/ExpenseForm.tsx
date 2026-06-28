"use client";

import { useEffect, useTransition, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { createWorkerExpense, deleteWorkerExpense, getWorkerExpenses } from "@/actions/expenses";
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
import { Separator } from "@/components/ui/separator";
import { formatEGP } from "@/lib/money";

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "المبلغ مطلوب")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, "مبلغ صحيح أكبر من صفر"),
  note: z.string().max(200).optional(),
});
type FormValues = z.infer<typeof formSchema>;

type Expense = {
  id: string;
  amount: number;
  note: string | null;
  recordedBy: string;
  createdAt: Date;
};

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker: { id: string; name: string } | null;
  onSuccess: () => void;
  isAdmin?: boolean;
}

export function ExpenseForm({ open, onOpenChange, worker, onSuccess, isAdmin }: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: "", note: "" },
  });

  const loadExpenses = useCallback(async () => {
    if (!worker) return;
    setLoadingExpenses(true);
    try {
      const data = await getWorkerExpenses(worker.id);
      setExpenses(data);
    } catch {
      // silently ignore — list is non-critical
    } finally {
      setLoadingExpenses(false);
    }
  }, [worker]);

  useEffect(() => {
    if (open) {
      form.reset({ amount: "", note: "" });
      loadExpenses();
    } else {
      setExpenses([]);
    }
  }, [open, form, loadExpenses]);

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
        toast.success("تم تسجيل السلفة");
        form.reset({ amount: "", note: "" });
        onSuccess();
        loadExpenses();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteWorkerExpense(id);
        toast.success("تم حذف السلفة");
        onSuccess();
        loadExpenses();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            {/* Brand header */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border bg-card">
                <Image src="/logo.png" alt="fe5oo" fill className="object-contain p-0.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-widest text-primary uppercase leading-none mb-1">
                  fe5oo BARBERSHOP
                </p>
                <DialogTitle className="text-base font-semibold leading-tight">
                  {worker ? `سلفة / مصروف — ${worker.name}` : "سلفة / مصروف"}
                </DialogTitle>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer shrink-0 mt-0.5"
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

        {/* Existing expenses list */}
        {(expenses.length > 0 || loadingExpenses) && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">السلف السابقة</p>
              {loadingExpenses ? (
                <p className="text-sm text-muted-foreground">جار التحميل...</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {expenses.map((exp) => (
                    <li
                      key={exp.id}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <span className="font-medium tabular-nums">{formatEGP(exp.amount)}</span>
                        {exp.note && (
                          <span className="text-muted-foreground truncate ms-2">{exp.note}</span>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(exp.createdAt).toLocaleDateString("ar-EG")}
                          {" · "}
                          {exp.recordedBy}
                        </p>
                      </div>
                      {isAdmin && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-destructive hover:text-destructive cursor-pointer"
                          onClick={() => handleDelete(exp.id)}
                          disabled={isPending && deletingId === exp.id}
                          aria-label="حذف السلفة"
                        >
                          {isPending && deletingId === exp.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
