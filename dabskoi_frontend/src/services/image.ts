import { api } from "@/lib/api";
import { PostImageResponse } from "@/types/api/image";
import { BaseResponse } from "@/types/base-response";

export const serviceImage = {
  upload: async (file: File): Promise<PostImageResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post<BaseResponse<PostImageResponse>>(
      "/image",
      formData
    );
    return response.data.data;
  },
};
