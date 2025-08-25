import { z } from "zod";

export const CreateSellSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
  type: z.string().min(1, "Tipe tidak boleh kosong"),
  gender: z.enum(["M", "F"]),
  length: z.coerce.number().min(1, "Panjang tidak boleh kosong"),
  weight: z.coerce.number().min(1, "Berat tidak boleh kosong"),
  price: z.coerce.number().min(1, "Harga tidak boleh kosong"),
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  images: z.array(z.string()).min(1, "Gambar tidak boleh kosong"),
  certificate: z
    .string()
    .url("Certificate harus berupa url")
    .nullable()
    .optional(),
});

export type CreateSellSchemaType = z.infer<typeof CreateSellSchema>;
