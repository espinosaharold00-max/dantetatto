import { z } from "zod";

export const appointmentSchema = z.object({
  type: z.enum(["CONSULTATION", "CONTINUATION", "TOUCH_UP"]),
  date: z.string().min(1, "La fecha es requerida"),
  startTime: z.string().min(1, "La hora es requerida"),
  description: z.string().min(10, "Describe tu diseño (mínimo 10 caracteres)"),
  bodyArea: z.string().min(1, "La zona del cuerpo es requerida"),
  referenceImageUrl: z.string().optional(),
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  category: z.string().min(1, "La categoría es requerida"),
  stock: z.number().int().min(0),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres"),
});

export const postSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  category: z.string().min(1, "La categoría es requerida"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type PostInput = z.infer<typeof postSchema>;
