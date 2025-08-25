import {
  GetProfileResponse,
  PostLoginRequest,
  PostLoginResponse,
} from "@/types/api/account";
import { api } from "@/lib/api";
import { BaseResponse } from "@/types/base-response";

export const serviceAccount = {
  login: async (data: PostLoginRequest): Promise<PostLoginResponse> => {
    const response = await api.post<BaseResponse<PostLoginResponse>>(
      "/admin/account/login",
      data
    );
    return response.data.data;
  },

  getProfile: async (): Promise<GetProfileResponse> => {
    const response = await api.get<BaseResponse<GetProfileResponse>>(
      "/admin/account/profile"
    );
    return response.data.data;
  },
};
