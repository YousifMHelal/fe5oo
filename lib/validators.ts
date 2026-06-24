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

// ── Workers ──────────────────────────────────────────────────────────────
export const workerSchema = z.object({
  name: z.string().min(1, "اسم العامل مطلوب").max(100),
  phone: z.string().max(20).optional(),
});

export type WorkerInput = z.infer<typeof workerSchema>;

// ── Tickets ───────────────────────────────────────────────────────────────
export const ticketItemInputSchema = z.object({
  workerId: z.string().min(1, "العامل مطلوب"),
  serviceId: z.string().min(1, "الخدمة مطلوبة"),
});

export const createTicketSchema = z.object({
  items: z.array(ticketItemInputSchema).min(1, "يجب إضافة خدمة واحدة على الأقل"),
  note: z.string().max(500).optional(),
});

export type TicketItemInput = z.infer<typeof ticketItemInputSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

// ── Placeholders — populated phase by phase ──────────────────────────────
// P7-1: createUserSchema, updateUserSchema
// P8-2: changePasswordSchema
// P8-3: settingSchema

export type LoginInput = z.infer<typeof loginSchema>;
