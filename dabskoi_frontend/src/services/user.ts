import { api } from "@/lib/api";
import { GetUserOverviewResponse, GetUserResponse } from "@/types/api/user";
import { BaseResponse } from "@/types/base-response";

export const serviceUser = {
  getUsers: async (): Promise<GetUserResponse[]> => {
    const response = await api.get<BaseResponse<GetUserResponse[]>>(
      "/admin/user"
    );
    return response.data.data;
  },

  getUserOverview: async (): Promise<GetUserOverviewResponse> => {
    const response = await api.get<BaseResponse<GetUserOverviewResponse>>(
      "/admin/user/overview"
    );
    return response.data.data;
  },
};
