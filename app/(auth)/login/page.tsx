"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setIsPending(true);
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
      } else {
        // Redirect to /overview — middleware will redirect cashier to /transactions.
        router.push("/overview");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع. حاول مجدداً.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8"
      style={{ background: "radial-gradient(ellipse 680px 520px at 50% 42%, color-mix(in oklch, var(--primary) 14%, transparent), var(--background))" }}>
      <Card className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl">
        <CardHeader className="flex flex-col items-center gap-3 pb-2 pt-8">
          <div className="relative h-20 w-20">
            <Image
              src="/logo.png"
              alt="شعار Fe5oo BARBERSHOP"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="font-heading text-xl font-extrabold tracking-tight text-center">
            مرحباً بعودتك
          </CardTitle>
          <p className="text-sm text-muted-foreground">سجّل دخولك للمتابعة</p>
        </CardHeader>

        <CardContent className="pb-8 pt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate>
              <FormField
                control={form.control}
                name="username"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<LoginInput, "username">;
                }) => (
                  <FormItem>
                    <FormLabel>اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        autoComplete="username"
                        autoFocus
                        disabled={isPending}
                        placeholder="أدخل اسم المستخدم"
                        className="h-11 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<LoginInput, "password">;
                }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                        disabled={isPending}
                        placeholder="أدخل كلمة المرور"
                        className="h-11 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="mt-2 h-11 w-full cursor-pointer bg-primary text-primary-foreground font-semibold text-base transition-opacity hover:opacity-90">
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ الدخول…
                  </span>
                ) : (
                  "دخول"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
