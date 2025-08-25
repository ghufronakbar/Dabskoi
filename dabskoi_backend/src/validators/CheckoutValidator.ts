import { z } from "zod";

export const UserCheckoutSellKoiSchema = z.object({
  koiSellId: z.string().min(1, "Koi Sell ID tidak boleh kosong"),
});

export type UserCheckoutSellKoiSchemaType = z.infer<
  typeof UserCheckoutSellKoiSchema
>;
