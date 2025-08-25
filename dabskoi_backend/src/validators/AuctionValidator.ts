import { z } from "zod";
import moment from "moment-timezone";

export const CreateAuctionSchema = z
  .object({
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
    startAt: z.coerce.date().refine(
      (date) => {
        const now = moment().tz("Asia/Jakarta");
        console.log("now", now.toDate());
        console.log("startAt", date);
        return date > now.toDate();
      },
      {
        message: "Tanggal mulai tidak boleh kurang dari hari ini",
      }
    ),
    endAt: z.coerce.date().refine(
      (date) => {
        const now = moment().tz("Asia/Jakarta");
        return date > now.toDate();
      },
      {
        message: "Tanggal selesai tidak boleh kurang dari hari ini",
      }
    ),
  })
  .refine(
    (data) => {
      const startAt = moment(data.startAt).tz("Asia/Jakarta");
      const endAt = moment(data.endAt).tz("Asia/Jakarta");
      return startAt.isBefore(endAt);
    },
    {
      message: "Tanggal selesai tidak boleh kurang dari tanggal mulai",
    }
  );

export type CreateAuctionSchemaType = z.infer<typeof CreateAuctionSchema>;

export const BidSchema = z.object({
  koiAuctionId: z.string().min(1, "Koi auction id tidak boleh kosong"),
  price: z.number().min(1, "Harga tidak boleh kurang dari 1"),
});

export type BidSchemaType = z.infer<typeof BidSchema>;
