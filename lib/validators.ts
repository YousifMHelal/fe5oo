import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

// ── Services ─────────────────────────────────────────────────────────────
export const serviceSchema = z.object({
  title: z.string().min(1, "اسم الخدمة مطلوب").max(100),
  price: z.number({ error: "السعر مطلوب" }).int("السعر يجب أن يكون عدداً صحيحاً").min(0, "السعر لا يقل عن صفر"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// ── Placeholders — populated phase by phase ──────────────────────────────
// P4-1: workerSchema
// P5-1: ticketSchema, ticketItemSchema
// P7-1: createUserSchema, updateUserSchema
// P8-2: changePasswordSchema
// P8-3: settingSchema

export type LoginInput = z.infer<typeof loginSchema>;
