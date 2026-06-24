import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

// ── Placeholders — populated phase by phase ──────────────────────────────
// P3-1: serviceSchema
// P4-1: workerSchema
// P5-1: ticketSchema, ticketItemSchema
// P7-1: createUserSchema, updateUserSchema
// P8-2: changePasswordSchema
// P8-3: settingSchema

export type LoginInput = z.infer<typeof loginSchema>;
