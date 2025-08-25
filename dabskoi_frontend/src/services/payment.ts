import { GetPaymentResponse } from "@/types/api/payment";
import { api } from "@/lib/api";
import { BaseResponse } from "@/types/base-response";

export const servicePayment = {
  getPayments: async (): Promise<GetPaymentResponse[]> => {
    const response = await api.get<BaseResponse<GetPaymentResponse[]>>(
      "/admin/payment"
    );
    return response.data.data;
  },
};
