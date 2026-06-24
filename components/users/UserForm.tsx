"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from "@/lib/validators";
import { createUser, updateUser } from "@/actions/users";
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

type Role = { id: string; key: string; nameAr: string };
type UserRow = { id: string; username: string; fullName: string; roleId: string; isActive: boolean };

interface UserFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: UserRow | null;
  roles: Role[];
  onSuccess: () => void;
}

export function UserForm({ open, onOpenChange, user, roles, onSuccess }: UserFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!user;

  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: "", fullName: "", password: "", roleId: roles[0]?.id ?? "" },
  });

  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { fullName: "", roleId: roles[0]?.id ?? "", isActive: true },
  });

  useEffect(() => {
    if (open) {
      if (isEdit && user) {
        editForm.reset({ fullName: user.fullName, roleId: user.roleId, isActive: user.isActive });
      } else {
        createForm.reset({ username: "", fullName: "", password: "", roleId: roles[0]?.id ?? "" });
      }
    }
  }, [open, isEdit, user, roles, createForm, editForm]);

  function onCreateSubmit(data: CreateUserInput) {
    startTransition(async () => {
      try {
        await createUser(data);
        toast.success("تمت إضافة المستخدم");
        onOpenChange(false);
        onSuccess();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  function onEditSubmit(data: UpdateUserInput) {
    startTransition(async () => {
      try {
        await updateUser(user!.id, data);
        toast.success("تم تحديث بيانات المستخدم");
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
          <DialogTitle>{isEdit ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
        </DialogHeader>

        {isEdit ? (
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-2">
              <FormField control={editForm.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="roleId" render={({ field }) => (
                <FormItem>
                  <FormLabel>الدور</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.nameAr}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 cursor-pointer" />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">المستخدم نشط</FormLabel>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="cursor-pointer">إلغاء</Button>
                <Button type="submit" disabled={isPending} className="cursor-pointer">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}حفظ
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pt-2">
              <FormField control={createForm.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>اسم المستخدم</FormLabel><FormControl><Input placeholder="admin" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>كلمة المرور</FormLabel><FormControl><Input type="password" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="roleId" render={({ field }) => (
                <FormItem>
                  <FormLabel>الدور</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.nameAr}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="cursor-pointer">إلغاء</Button>
                <Button type="submit" disabled={isPending} className="cursor-pointer">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}إضافة
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
