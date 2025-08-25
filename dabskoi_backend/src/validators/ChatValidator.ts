import { z } from "zod";

export const AdminSendMessageSchema = z.object({
  userId: z.string().min(1, "User ID tidak boleh kosong"),
  content: z.string().min(1, "Pesan tidak boleh kosong"),
  type: z.enum(["TEXT", "IMAGE"]),
});

export type AdminSendMessageSchemaType = z.infer<typeof AdminSendMessageSchema>;

export const AdminReplyNegoRequestSchema = z.object({
  messageId: z.string().min(1, "Message ID tidak boleh kosong"),
  isAccept: z.boolean({
    required_error: "Status tidak boleh kosong",
  }),
});

export type AdminReplyNegoRequestSchemaType = z.infer<
  typeof AdminReplyNegoRequestSchema
>;

export const UserSendMessageSchema = z.object({
  content: z.string().min(1, "Pesan tidak boleh kosong"),
  type: z.enum(["TEXT", "IMAGE"]),
});

export type UserSendMessageSchemaType = z.infer<typeof UserSendMessageSchema>;

export const UserMakeNegoRequestSchema = z.object({
  productId: z.string().min(1, "Product ID tidak boleh kosong"),
  price: z.number().min(1, "Harga tidak boleh kosong"),
});

export type UserMakeNegoRequestSchemaType = z.infer<
  typeof UserMakeNegoRequestSchema
>;

export const UserReferProductSchema = z.object({
  productId: z.string().min(1, "Product ID tidak boleh kosong"),
  type: z.enum(["SELL", "NEGO", "AUCTION"]),
});

export type UserReferProductSchemaType = z.infer<typeof UserReferProductSchema>;
