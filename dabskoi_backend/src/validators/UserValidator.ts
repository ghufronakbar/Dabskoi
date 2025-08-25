import { Role } from "@prisma/client";
import { z } from "zod";

export const UserLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type UserLoginSchemaType = z.infer<typeof UserLoginSchema>;

export const UserDecodedSchema = z.object({
  id: z.string(),
  role: z.enum(Object.values(Role) as [string, ...string[]]),
});

export type UserDecodedSchemaType = z.infer<typeof UserDecodedSchema>;

export const UserRegisterSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
});

export type UserRegisterSchemaType = z.infer<typeof UserRegisterSchema>;

export const UserUpdateSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  picture: z.string().url("URL tidak valid").nullable().optional(),
});

export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>;
