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
// ── Users ─────────────────────────────────────────────────────────────────
export const createUserSchema = z.object({
  username: z.string().min(3, "اسم المستخدم لا يقل عن 3 أحرف").max(50).regex(/^[a-z0-9_]+$/, "يسمح فقط بالأحرف اللاتينية والأرقام"),
  fullName: z.string().min(2, "الاسم الكامل مطلوب").max(100),
  password: z.string().min(6, "كلمة المرور لا تقل عن 6 أحرف"),
  roleId: z.string().min(1, "الدور مطلوب"),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب").max(100),
  roleId: z.string().min(1, "الدور مطلوب"),
  isActive: z.boolean(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
// ── Profile ───────────────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(6, "كلمة المرور الجديدة لا تقل عن 6 أحرف"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
// ── Settings ─────────────────────────────────────────────────────────────
export const settingSchema = z.object({
  shopName: z.string().min(1, "اسم المتجر مطلوب").max(100),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
});

export type SettingInput = z.infer<typeof settingSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
